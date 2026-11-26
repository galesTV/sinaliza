#!/usr/bin/env bash

set -u
set -o pipefail

build() {
  printf 'BUILD: %s\n' "$1"
  exit 1
}

skip() {
  printf 'SKIP: %s\n' "$1"
  exit 0
}

is_known_independent_path() {
  case "$1" in
    apps/pwa/*|docs/*|supabase/*|.agents/*|README.md|AGENTS.md|.gitignore)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

validate_sha_format() {
  local value=$1
  local label=$2
  local pattern=$3

  [ -n "$value" ] || build "$label is absent or empty"

  if [[ ! "$value" =~ $pattern ]]; then
    build "$label is not a full lowercase hexadecimal commit SHA for this repository"
  fi
}

if [ "${VERCEL_ENV:-}" != "preview" ] || [ "${VERCEL_TARGET_ENV:-}" != "preview" ]; then
  build "environment is not positively identified as preview"
fi

repo_root=$(git rev-parse --show-toplevel 2>/dev/null) || build "unable to locate the Git repository"
cd "$repo_root" || build "unable to enter the Git repository root"

object_format=$(git rev-parse --show-object-format 2>/dev/null) || build "unable to determine the repository object format"
case "$object_format" in
  sha1)
    sha_length=40
    ;;
  sha256)
    sha_length=64
    ;;
  *)
    build "unsupported Git object format"
    ;;
esac
sha_pattern="^[0-9a-f]{$sha_length}$"

head_input=${VERCEL_GIT_COMMIT_SHA:-}
base_input=${VERCEL_GIT_PREVIOUS_SHA:-}

validate_sha_format "$head_input" "VERCEL_GIT_COMMIT_SHA" "$sha_pattern"
validate_sha_format "$base_input" "VERCEL_GIT_PREVIOUS_SHA" "$sha_pattern"

head_commit=$(git rev-parse --verify "${head_input}^{commit}" 2>/dev/null) || build "current commit SHA is unavailable in this clone"
base_commit=$(git rev-parse --verify "${base_input}^{commit}" 2>/dev/null) || build "previous successful deployment SHA is unavailable in this clone"
checked_out_head=$(git rev-parse --verify "HEAD^{commit}" 2>/dev/null) || build "unable to resolve the checked-out HEAD"

if [ "$head_commit" != "$checked_out_head" ]; then
  build "VERCEL_GIT_COMMIT_SHA does not match the checked-out HEAD"
fi

if [ "$base_commit" = "$head_commit" ]; then
  build "current commit is already the last successful deployment; treat as a redeploy"
fi

if ! git merge-base --is-ancestor "$base_commit" "$head_commit" 2>/dev/null; then
  build "previous successful deployment is not an ancestor of the current commit or history is insufficient"
fi

diff_file=$(mktemp "${TMPDIR:-/tmp}/sinaliza-landing-diff.XXXXXX") || build "unable to create a temporary diff file"
cleanup() {
  rm -f -- "$diff_file"
}
trap cleanup EXIT

if ! git diff --name-only --no-renames -z "$base_commit" "$head_commit" -- >"$diff_file" 2>/dev/null; then
  build "git diff failed for the reliable comparison range"
fi

if [ ! -r "$diff_file" ]; then
  build "temporary diff file is not readable"
fi

expected_count=$(tr -cd '\000' <"$diff_file" 2>/dev/null | wc -c | tr -d ' ') || build "unable to count entries in the diff file"

if [[ ! "$expected_count" =~ ^[0-9]+$ ]]; then
  build "diff entry count is invalid"
fi

if [ "$expected_count" -eq 0 ]; then
  build "comparison range has no file changes"
fi

last_byte_hex=$(tail -c 1 "$diff_file" 2>/dev/null | od -An -tx1 -v 2>/dev/null | tr -d ' \n') || build "unable to inspect the diff entry terminator"

if [ "$last_byte_hex" != "00" ]; then
  build "diff output is incomplete or missing its final NUL delimiter"
fi

change_count=0

while IFS= read -r -d '' changed_path; do
  change_count=$((change_count + 1))
  quoted_path=$(printf '%q' "$changed_path")

  if [ -z "$changed_path" ]; then
    build "diff contains an empty path"
  fi

  case "$changed_path" in
    apps/landing/*)
      build "landing-relevant path changed: $quoted_path"
      ;;
  esac

  if ! is_known_independent_path "$changed_path"; then
    build "unclassified path changed: $quoted_path"
  fi
done <"$diff_file"

if [ "$change_count" -ne "$expected_count" ]; then
  build "failed to read every entry in the diff file"
fi

skip "only known landing-independent paths changed in $change_count entr$( [ "$change_count" -eq 1 ] && printf 'y' || printf 'ies') since ${base_commit:0:12}"
