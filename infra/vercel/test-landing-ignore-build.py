#!/usr/bin/env python3

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT = Path(__file__).with_name("landing-ignore-build.sh").resolve()
GIT_ENV = {
    "GIT_AUTHOR_NAME": "Sinaliza Test",
    "GIT_AUTHOR_EMAIL": "sinaliza-test@example.invalid",
    "GIT_COMMITTER_NAME": "Sinaliza Test",
    "GIT_COMMITTER_EMAIL": "sinaliza-test@example.invalid",
}
VERCEL_KEYS = [
    "VERCEL_ENV",
    "VERCEL_TARGET_ENV",
    "VERCEL_GIT_PREVIOUS_SHA",
    "VERCEL_GIT_COMMIT_SHA",
]
CURRENT_HEAD = object()

results = []


def run(cmd, cwd, check=True):
    env = os.environ.copy()
    env.update(GIT_ENV)
    proc = subprocess.run(cmd, cwd=cwd, env=env, text=True, capture_output=True)
    if check and proc.returncode != 0:
        raise RuntimeError(
            f"command failed ({proc.returncode}): {' '.join(map(str, cmd))}\n{proc.stdout}{proc.stderr}"
        )
    return proc


def git(repo, *args, check=True):
    return run(["git", *args], repo, check)


def write(repo, rel, content="x\n"):
    path = repo / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def move(repo, source, target):
    target_path = repo / target
    target_path.parent.mkdir(parents=True, exist_ok=True)
    (repo / source).rename(target_path)


def commit_all(repo, message):
    git(repo, "add", "-A")
    git(repo, "commit", "-qm", message)
    return git(repo, "rev-parse", "HEAD").stdout.strip()


def init_repo():
    tmp = tempfile.TemporaryDirectory(prefix="sinaliza-ignore-test-")
    repo = Path(tmp.name) / "repo"
    repo.mkdir()
    git(repo, "init", "-q", "-b", "main")
    write(repo, "apps/landing/package.json", '{"name":"landing"}\n')
    write(repo, "apps/landing/package-lock.json", '{"lockfileVersion":3}\n')
    write(repo, "apps/landing/src/app/page.tsx", "export default function Home() { return null }\n")
    write(repo, "apps/pwa/src/app/page.tsx", "export default function Home() { return null }\n")
    write(repo, "apps/pwa/src/asset.txt", "asset\n")
    write(repo, "docs/product.md", "# Product\n")
    write(repo, "README.md", "# Test\n")
    base = commit_all(repo, "initial")
    return tmp, repo, base


def decide(repo, base=None, head=CURRENT_HEAD, extra_env=None, unset_env=(), cwd=None):
    env = os.environ.copy()
    for key in VERCEL_KEYS:
        env.pop(key, None)
    env["VERCEL_ENV"] = "preview"
    env["VERCEL_TARGET_ENV"] = "preview"
    if base is not None:
        env["VERCEL_GIT_PREVIOUS_SHA"] = base
    if head is CURRENT_HEAD:
        env["VERCEL_GIT_COMMIT_SHA"] = git(repo, "rev-parse", "HEAD").stdout.strip()
    elif head is not None:
        env["VERCEL_GIT_COMMIT_SHA"] = head
    if extra_env:
        env.update(extra_env)
    for key in unset_env:
        env.pop(key, None)

    workdir = cwd or repo / "apps" / "landing"
    proc = subprocess.run(
        ["bash", str(SCRIPT)],
        cwd=workdir,
        env=env,
        text=True,
        capture_output=True,
    )
    output = "; ".join((proc.stdout + proc.stderr).strip().splitlines()) or "no output"
    return proc.returncode, output


def record(name, expected, code, output, base="", head="", reason_contains=None):
    reason_ok = reason_contains is None or reason_contains in output
    status = "PASS" if code == expected and reason_ok else "FAIL"
    results.append((status, name, expected, code, output, base, head))
    reason_note = "" if reason_contains is None else f"|reason_check={'PASS' if reason_ok else 'FAIL'}"
    print(
        f"{status}|{name}|expected={expected}|actual={code}|"
        f"base={base[:12] or '-'}|head={head[:12] or '-'}{reason_note}|reason={output}"
    )


def record_skipped(name, reason, base="", head=""):
    results.append(("SKIPPED", name, "skipped", "skipped", reason, base, head))
    print(f"SKIPPED|{name}|base={base[:12] or '-'}|head={head[:12] or '-'}|reason={reason}")


def simple_case(
    name,
    expected,
    mutate,
    base_override=None,
    extra_env=None,
    unset_env=(),
    head_override=CURRENT_HEAD,
    reason_contains=None,
):
    tmp, repo, base = init_repo()
    mutate(repo)
    head = commit_all(repo, name)
    effective_base = base if base_override is None else base_override
    effective_head = head if head_override is CURRENT_HEAD else head_override
    code, output = decide(
        repo,
        effective_base,
        effective_head,
        extra_env=extra_env,
        unset_env=unset_env,
    )
    record(name, expected, code, output, effective_base or "", head, reason_contains)
    tmp.cleanup()


def case_pwa_only():
    simple_case(
        "exclusive PWA change with reliable base",
        0,
        lambda repo: write(repo, "apps/pwa/src/app/page.tsx", "pwa change\n"),
        reason_contains="SKIP: only known landing-independent paths",
    )


def case_landing_only():
    simple_case(
        "exclusive landing change",
        1,
        lambda repo: write(repo, "apps/landing/src/app/page.tsx", "landing change\n"),
        reason_contains="landing-relevant path changed",
    )


def case_both_apps():
    def mutate(repo):
        write(repo, "apps/pwa/src/app/page.tsx", "pwa change\n")
        write(repo, "apps/landing/src/app/page.tsx", "landing change\n")

    simple_case("changes in both applications", 1, mutate, reason_contains="landing-relevant path changed")


def case_docs_only():
    simple_case(
        "independent documentation change",
        0,
        lambda repo: write(repo, "docs/product.md", "docs change\n"),
        reason_contains="SKIP: only known landing-independent paths",
    )


def case_unknown_external():
    simple_case(
        "external file with unknown influence",
        1,
        lambda repo: write(repo, "infra/unknown.txt", "unknown\n"),
        reason_contains="unclassified path changed",
    )


def case_new_branch_empty_base():
    simple_case(
        "new branch with empty previous SHA",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        base_override="",
        reason_contains="VERCEL_GIT_PREVIOUS_SHA is absent or empty",
    )


def case_missing_base():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "missing base")
    code, output = decide(repo, None, head)
    record("previous SHA absent", 1, code, output, "", head, "VERCEL_GIT_PREVIOUS_SHA is absent or empty")
    tmp.cleanup()


def case_invalid_base():
    simple_case(
        "invalid previous SHA",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        base_override="not-a-valid-sha",
        reason_contains="VERCEL_GIT_PREVIOUS_SHA is not a full lowercase hexadecimal",
    )


def case_shallow_history():
    tmp, source, base = init_repo()
    write(source, "apps/pwa/src/app/page.tsx", "pwa change\n")
    head = commit_all(source, "pwa change")
    clone = Path(tmp.name) / "clone"
    run(["git", "clone", "-q", "--depth", "1", f"file://{source}", str(clone)], Path(tmp.name))
    code, output = decide(clone, base, head)
    record("shallow history without base object", 1, code, output, base, head, "previous successful deployment SHA is unavailable")
    tmp.cleanup()


def case_git_failure():
    with tempfile.TemporaryDirectory(prefix="sinaliza-ignore-no-git-") as directory:
        repo = Path(directory)
        (repo / "apps" / "landing").mkdir(parents=True)
        fake = "0" * 40
        code, output = decide(repo, fake, fake)
        record("git command failure outside a repository", 1, code, output, fake, fake, "unable to locate the Git repository")


def case_multiple_commits_with_landing():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/one.txt", "one\n")
    commit_all(repo, "pwa one")
    write(repo, "apps/landing/two.txt", "two\n")
    head = commit_all(repo, "landing two")
    code, output = decide(repo, base, head)
    record("multi-commit push including landing", 1, code, output, base, head, "landing-relevant path changed")
    tmp.cleanup()


def case_multiple_commits_pwa_only():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/one.txt", "one\n")
    commit_all(repo, "pwa one")
    write(repo, "apps/pwa/two.txt", "two\n")
    head = commit_all(repo, "pwa two")
    code, output = decide(repo, base, head)
    record("multi-commit push exclusive to PWA", 0, code, output, base, head, "2 entries")
    tmp.cleanup()


def merge_case(name, expected, changed_path):
    tmp, repo, base = init_repo()
    git(repo, "checkout", "-qb", "feature")
    write(repo, changed_path, "feature change\n")
    commit_all(repo, "feature change")
    git(repo, "checkout", "-q", "main")
    git(repo, "merge", "-q", "--no-ff", "-m", "merge feature", "feature")
    head = git(repo, "rev-parse", "HEAD").stdout.strip()
    code, output = decide(repo, base, head)
    record(name, expected, code, output, base, head)
    tmp.cleanup()


def case_divergent_history():
    tmp, repo, initial = init_repo()
    git(repo, "checkout", "-qb", "side")
    write(repo, "apps/pwa/side.txt", "side\n")
    side = commit_all(repo, "side commit")
    git(repo, "checkout", "-q", "main")
    write(repo, "apps/pwa/main.txt", "main\n")
    head = commit_all(repo, "main commit")
    code, output = decide(repo, side, head)
    record("force push or divergent history", 1, code, output, side, head, "not an ancestor")
    tmp.cleanup()


def case_delete_landing():
    def mutate(repo):
        (repo / "apps/landing/src/app/page.tsx").unlink()

    simple_case("deleted landing file", 1, mutate, reason_contains="landing-relevant path changed")


def case_rename_landing_out():
    def mutate(repo):
        move(repo, "apps/landing/src/app/page.tsx", "apps/pwa/src/app/moved-page.tsx")

    simple_case("landing file renamed outside landing", 1, mutate, reason_contains="landing-relevant path changed")


def case_rename_external_into_landing():
    def mutate(repo):
        move(repo, "apps/pwa/src/asset.txt", "apps/landing/src/app/moved-asset.txt")

    simple_case("external file renamed into landing", 1, mutate, reason_contains="landing-relevant path changed")


def case_landing_lockfile():
    simple_case(
        "landing package-lock change",
        1,
        lambda repo: write(repo, "apps/landing/package-lock.json", '{"lockfileVersion":3,"changed":true}\n'),
        reason_contains="landing-relevant path changed",
    )


def case_failed_previous_build_pending_landing():
    tmp, repo, last_success = init_repo()
    write(repo, "apps/landing/pending.txt", "pending\n")
    commit_all(repo, "B - landing change whose build failed")
    write(repo, "apps/pwa/followup.txt", "followup\n")
    head = commit_all(repo, "C - PWA-only follow-up")
    code, output = decide(repo, last_success, head)
    record(
        "previous build failed and landing changes remain pending",
        1,
        code,
        output,
        last_success,
        head,
        "landing-relevant path changed",
    )
    tmp.cleanup()


def case_manual_redeploy_same_sha():
    tmp, repo, head = init_repo()
    code, output = decide(repo, head, head)
    record("manual redeploy of same successful SHA", 1, code, output, head, head, "already the last successful deployment")
    tmp.cleanup()


WRAPPER_COMMAND = (
    's=../../infra/vercel/landing-ignore-build.sh;'
    '[ "$VERCEL_ENV/$VERCEL_TARGET_ENV" = preview/preview ]&&bash -n "$s"||{ echo BUILD;exit 1;};'
    'o=$(bash $s;printf x$?);c=${o##*x};o=${o%x$c};echo "$o";'
    '[ $c = 0 ]&&[ "$o" = $\'SKIP\\n\' ]&&exit 0;'
    'echo BUILD:$c;exit 1'
)


def run_wrapper(repo, base, head, extra_env=None, unset_env=()):
    env = os.environ.copy()
    for key in VERCEL_KEYS:
        env.pop(key, None)
    env.update(
        {
            "VERCEL_ENV": "preview",
            "VERCEL_TARGET_ENV": "preview",
            "VERCEL_GIT_PREVIOUS_SHA": base,
            "VERCEL_GIT_COMMIT_SHA": head,
        }
    )
    if extra_env:
        env.update(extra_env)
    for key in unset_env:
        env.pop(key, None)
    proc = subprocess.run(
        ["bash", "-c", WRAPPER_COMMAND],
        cwd=repo / "apps" / "landing",
        env=env,
        text=True,
        capture_output=True,
    )
    output = "; ".join((proc.stdout + proc.stderr).strip().splitlines()) or "no output"
    return proc.returncode, output


def prepare_wrapper_repo(script_content=None):
    tmp, repo, _ = init_repo()
    write(repo, "infra/vercel/landing-ignore-build.sh", SCRIPT.read_text() if script_content is None else script_content)
    base = commit_all(repo, "add ignore-build script")
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "pwa change")
    return tmp, repo, base, head


def case_script_absent_in_old_branch():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "pwa change")
    code, output = run_wrapper(repo, base, head)
    record("script absent in old branch", 1, code, output, base, head, "BUILD")
    tmp.cleanup()


def case_versioned_script_through_wrapper():
    tmp, repo, base, head = prepare_wrapper_repo()
    code, output = run_wrapper(repo, base, head)
    record("versioned script through activation wrapper", 0, code, output, base, head, "SKIP:")
    tmp.cleanup()


def case_production_always_builds():
    simple_case(
        "production deployment with PWA-only change",
        1,
        lambda repo: write(repo, "apps/pwa/src/app/page.tsx", "pwa change\n"),
        extra_env={"VERCEL_ENV": "production", "VERCEL_TARGET_ENV": "production"},
        reason_contains="environment is not positively identified as preview",
    )


def case_both_environment_variables_absent():
    simple_case(
        "both environment variables absent",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        unset_env=("VERCEL_ENV", "VERCEL_TARGET_ENV"),
        reason_contains="environment is not positively identified as preview",
    )


def case_unknown_environment():
    simple_case(
        "unknown environment",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        extra_env={"VERCEL_ENV": "unknown", "VERCEL_TARGET_ENV": "unknown"},
        reason_contains="environment is not positively identified",
    )


def case_development_environment():
    simple_case(
        "development environment",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        extra_env={"VERCEL_ENV": "development", "VERCEL_TARGET_ENV": "development"},
        reason_contains="environment is not positively identified",
    )


def case_custom_environment():
    simple_case(
        "custom environment",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        extra_env={"VERCEL_ENV": "preview", "VERCEL_TARGET_ENV": "staging"},
        reason_contains="environment is not positively identified",
    )


def case_contradictory_environment():
    simple_case(
        "contradictory environment variables",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        extra_env={"VERCEL_ENV": "preview", "VERCEL_TARGET_ENV": "production"},
        reason_contains="environment is not positively identified",
    )


def case_legitimate_preview_environment():
    simple_case(
        "legitimate preview environment",
        0,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        extra_env={"VERCEL_ENV": "preview", "VERCEL_TARGET_ENV": "preview"},
        reason_contains="SKIP:",
    )


def case_current_sha_absent():
    simple_case(
        "current SHA absent",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        head_override=None,
        reason_contains="VERCEL_GIT_COMMIT_SHA is absent or empty",
    )


def case_current_sha_empty():
    simple_case(
        "current SHA empty",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        head_override="",
        reason_contains="VERCEL_GIT_COMMIT_SHA is absent or empty",
    )


def case_current_sha_invalid():
    simple_case(
        "current SHA invalid",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        head_override="not-a-valid-sha",
        reason_contains="VERCEL_GIT_COMMIT_SHA is not a full lowercase hexadecimal",
    )


def case_current_sha_symbolic_head():
    simple_case(
        "current SHA symbolic HEAD",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        head_override="HEAD",
        reason_contains="VERCEL_GIT_COMMIT_SHA is not a full lowercase hexadecimal",
    )


def case_previous_sha_symbolic():
    simple_case(
        "previous SHA symbolic",
        1,
        lambda repo: write(repo, "apps/pwa/new.txt"),
        base_override="HEAD",
        reason_contains="VERCEL_GIT_PREVIOUS_SHA is not a full lowercase hexadecimal",
    )


def case_current_sha_differs_from_checked_out_head():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "pwa change")
    code, output = decide(repo, base, base)
    record(
        "current SHA valid but different from checked-out HEAD",
        1,
        code,
        output,
        base,
        head,
        "does not match the checked-out HEAD",
    )
    tmp.cleanup()


def special_file_case(name, path, expected, reason):
    simple_case(name, expected, lambda repo: write(repo, path), reason_contains=reason)


def special_rename_case(name, source, target):
    tmp, repo, _ = init_repo()
    write(repo, source, "special\n")
    base = commit_all(repo, f"add versioned source for {name}")
    move(repo, source, target)
    head = commit_all(repo, f"move special file for {name}")
    code, output = decide(repo, base, head)
    record(name, 1, code, output, base, head, "landing-relevant path changed")
    tmp.cleanup()


def case_rename_special_pwa_to_landing():
    special = "nome unicode ç\tcomplicado.txt"
    special_rename_case(
        "rename with special name from PWA into landing",
        f"apps/pwa/{special}",
        f"apps/landing/{special}",
    )


def case_rename_special_landing_to_pwa():
    special = "nome unicode ç\tcomplicado.txt"
    special_rename_case(
        "rename with special name from landing into PWA",
        f"apps/landing/{special}",
        f"apps/pwa/{special}",
    )


def case_git_diff_failure():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "pwa change")
    fakebin = Path(tmp.name) / "fakebin"
    fakebin.mkdir()
    real_git = shutil.which("git")
    fake_git = fakebin / "git"
    fake_git.write_text(
        "#!/bin/sh\n"
        'if [ "$1" = diff ]; then echo forced-diff-failure >&2; exit 128; fi\n'
        f'exec "{real_git}" "$@"\n'
    )
    fake_git.chmod(0o755)
    code, output = decide(repo, base, head, extra_env={"PATH": f"{fakebin}:{os.environ['PATH']}"})
    record("git diff failure after initial validations", 1, code, output, base, head, "git diff failed")
    tmp.cleanup()


def case_pipeline_intermediate_failure():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "pwa change")
    fakebin = Path(tmp.name) / "fakebin-tr"
    fakebin.mkdir()
    fake_tr = fakebin / "tr"
    fake_tr.write_text("#!/bin/sh\nexit 42\n")
    fake_tr.chmod(0o755)
    code, output = decide(repo, base, head, extra_env={"PATH": f"{fakebin}:{os.environ['PATH']}"})
    record("intermediate failure in diff counting pipeline", 1, code, output, base, head, "unable to count entries")
    tmp.cleanup()


def case_incomplete_diff_output():
    tmp, repo, base = init_repo()
    write(repo, "apps/pwa/new.txt")
    head = commit_all(repo, "pwa change")
    fakebin = Path(tmp.name) / "fakebin-incomplete-diff"
    fakebin.mkdir()
    real_git = shutil.which("git")
    fake_git = fakebin / "git"
    fake_git.write_text(
        "#!/bin/sh\n"
        'if [ "$1" = diff ]; then printf \'apps/pwa/new.txt\\0partial-entry\'; exit 0; fi\n'
        f'exec "{real_git}" "$@"\n'
    )
    fake_git.chmod(0o755)
    code, output = decide(repo, base, head, extra_env={"PATH": f"{fakebin}:{os.environ['PATH']}"})
    record("incomplete diff output missing final NUL delimiter", 1, code, output, base, head, "missing its final NUL delimiter")
    tmp.cleanup()


def case_empty_diff():
    tmp, repo, base = init_repo()
    git(repo, "commit", "-q", "--allow-empty", "-m", "empty commit")
    head = git(repo, "rev-parse", "HEAD").stdout.strip()
    code, output = decide(repo, base, head)
    record("empty diff", 1, code, output, base, head, "no file changes")
    tmp.cleanup()


def case_wrapper_syntax_error():
    tmp, repo, base, head = prepare_wrapper_repo("this is not valid bash (((\n")
    code, output = run_wrapper(repo, base, head)
    record("wrapper normalizes script syntax error", 1, code, output, base, head, "syntax error")
    tmp.cleanup()


def case_wrapper_unexpected_exit_code():
    tmp, repo, base, head = prepare_wrapper_repo("#!/usr/bin/env bash\nexit 2\n")
    code, output = run_wrapper(repo, base, head)
    record("wrapper normalizes unexpected script exit code", 1, code, output, base, head, "BUILD:2")
    tmp.cleanup()


def case_wrapper_production_protection():
    tmp, repo, base, head = prepare_wrapper_repo()
    code, output = run_wrapper(
        repo,
        base,
        head,
        extra_env={"VERCEL_ENV": "production", "VERCEL_TARGET_ENV": "production"},
    )
    record("production protected directly by wrapper", 1, code, output, base, head, "BUILD")
    tmp.cleanup()


def wrapper_script_case(name, script_content, reason):
    tmp, repo, base, head = prepare_wrapper_repo(script_content)
    code, output = run_wrapper(repo, base, head)
    record(name, 1, code, output, base, head, reason)
    tmp.cleanup()


def case_wrapper_empty_script():
    wrapper_script_case("wrapper rejects empty script without SKIP confirmation", "", "BUILD")


def case_wrapper_exit_zero_without_skip():
    wrapper_script_case(
        "wrapper rejects exit zero without SKIP confirmation",
        "#!/usr/bin/env bash\necho 'execution finished'\nexit 0\n",
        "BUILD",
    )


def case_wrapper_skip_message_with_nonzero_exit():
    wrapper_script_case(
        "wrapper rejects SKIP message with nonzero exit",
        "#!/usr/bin/env bash\necho 'SKIP: misleading confirmation'\nexit 2\n",
        "BUILD",
    )


def case_wrapper_skip_with_extra_output():
    wrapper_script_case(
        "wrapper rejects ambiguous SKIP with extra output",
        "#!/usr/bin/env bash\necho noise\necho 'SKIP: mixed output'\nexit 0\n",
        "BUILD",
    )


def case_wrapper_skip_with_unterminated_extra_output():
    wrapper_script_case(
        "wrapper rejects SKIP followed by unterminated extra output",
        "#!/usr/bin/env bash\nprintf 'SKIP: valid-looking line\\nextra without newline'\nexit 0\n",
        "BUILD",
    )


def case_wrapper_skip_only_on_stderr():
    wrapper_script_case(
        "wrapper rejects SKIP written only to stderr",
        "#!/usr/bin/env bash\nprintf 'SKIP\\n' >&2\nexit 0\n",
        "BUILD",
    )


def case_wrapper_skip_with_trailing_blank_line():
    wrapper_script_case(
        "wrapper rejects exact SKIP with trailing blank line",
        "#!/usr/bin/env bash\nprintf 'SKIP\\n\\n'\nexit 0\n",
        "BUILD",
    )


def case_wrapper_unreadable_script():
    tmp, repo, base, head = prepare_wrapper_repo()
    script_path = repo / "infra/vercel/landing-ignore-build.sh"
    script_path.chmod(0)
    if os.geteuid() == 0 and os.access(script_path, os.R_OK):
        record_skipped(
            "wrapper rejects unreadable script",
            "privileged user can still read chmod-0 files; permission scenario not meaningful",
            base,
            head,
        )
    else:
        code, output = run_wrapper(repo, base, head)
        record("wrapper rejects unreadable script", 1, code, output, base, head, "BUILD")
    tmp.cleanup()


def case_accumulated_skips_then_landing():
    tmp, repo, last_success = init_repo()
    intermediate_changes = [
        ("apps/pwa/skip-one.txt", "one\n", "PWA-only skipped candidate one"),
        ("docs/skip-two.md", "two\n", "docs-only skipped candidate two"),
        ("apps/pwa/skip-three.txt", "three\n", "PWA-only skipped candidate three"),
    ]
    for index, (path, content, message) in enumerate(intermediate_changes, 1):
        write(repo, path, content)
        intermediate = commit_all(repo, message)
        code, output = decide(repo, last_success, intermediate)
        record(
            f"accumulated independent skip candidate {index}",
            0,
            code,
            output,
            last_success,
            intermediate,
            "SKIP: only known landing-independent paths",
        )

    write(repo, "apps/landing/relevant.txt", "landing\n")
    head = commit_all(repo, "landing change after accumulated skips")
    code, output = decide(repo, last_success, head)
    record(
        "multiple accumulated skips followed by landing change",
        1,
        code,
        output,
        last_success,
        head,
        "landing-relevant path changed",
    )
    tmp.cleanup()


def main():
    original_cases = [
        case_pwa_only,
        case_landing_only,
        case_both_apps,
        case_docs_only,
        case_unknown_external,
        case_new_branch_empty_base,
        case_missing_base,
        case_invalid_base,
        case_shallow_history,
        case_git_failure,
        case_multiple_commits_with_landing,
        case_multiple_commits_pwa_only,
        lambda: merge_case("merge PR with landing changes", 1, "apps/landing/merge.txt"),
        lambda: merge_case("merge PR exclusive to PWA with reliable base", 0, "apps/pwa/merge.txt"),
        case_divergent_history,
        case_delete_landing,
        case_rename_landing_out,
        case_rename_external_into_landing,
        case_landing_lockfile,
        case_failed_previous_build_pending_landing,
        case_manual_redeploy_same_sha,
        case_script_absent_in_old_branch,
        case_versioned_script_through_wrapper,
        case_production_always_builds,
    ]
    hardening_cases = [
        case_both_environment_variables_absent,
        case_unknown_environment,
        case_development_environment,
        case_custom_environment,
        case_contradictory_environment,
        case_legitimate_preview_environment,
        case_current_sha_absent,
        case_current_sha_empty,
        case_current_sha_invalid,
        case_current_sha_symbolic_head,
        case_previous_sha_symbolic,
        case_current_sha_differs_from_checked_out_head,
        lambda: special_file_case("PWA file with space in name", "apps/pwa/file with space.txt", 0, "SKIP:"),
        lambda: special_file_case("landing file with space in name", "apps/landing/file with space.txt", 1, "landing-relevant path changed"),
        lambda: special_file_case("PWA file with Unicode in name", "apps/pwa/sinalização.txt", 0, "SKIP:"),
        lambda: special_file_case("landing file with Unicode in name", "apps/landing/sinalização.txt", 1, "landing-relevant path changed"),
        lambda: special_file_case("file with tab in name", "apps/pwa/file\twith-tab.txt", 0, "SKIP:"),
        lambda: special_file_case("file with newline in name", "apps/pwa/file\nwith-newline.txt", 0, "SKIP:"),
        lambda: special_file_case("file with quote and backslash in name", 'apps/pwa/file"quote\\backslash.txt', 0, "SKIP:"),
        lambda: special_file_case("landing file with tab in name", "apps/landing/file\twith-tab.txt", 1, "\\t"),
        lambda: special_file_case("landing file with newline in name", "apps/landing/file\nwith-newline.txt", 1, "\\n"),
        lambda: special_file_case("landing file with quote and backslash in name", 'apps/landing/file"quote\\backslash.txt', 1, "landing-relevant path changed"),
        lambda: simple_case("root gitignore change", 1, lambda repo: write(repo, ".gitignore", "apps/landing/src/**\n"), reason_contains="unclassified path changed"),
        case_rename_special_pwa_to_landing,
        case_rename_special_landing_to_pwa,
        case_git_diff_failure,
        case_pipeline_intermediate_failure,
        case_incomplete_diff_output,
        case_empty_diff,
        case_wrapper_syntax_error,
        case_wrapper_unexpected_exit_code,
        case_wrapper_production_protection,
        case_wrapper_empty_script,
        case_wrapper_exit_zero_without_skip,
        case_wrapper_skip_message_with_nonzero_exit,
        case_wrapper_skip_with_extra_output,
        case_wrapper_skip_with_unterminated_extra_output,
        case_wrapper_skip_only_on_stderr,
        case_wrapper_skip_with_trailing_blank_line,
        case_wrapper_unreadable_script,
        case_accumulated_skips_then_landing,
    ]

    for case in original_cases + hardening_cases:
        case()

    failed = [item for item in results if item[0] == "FAIL"]
    passed = [item for item in results if item[0] == "PASS"]
    skipped = [item for item in results if item[0] == "SKIPPED"]
    print(f"TOTAL|{len(results)}|PASS|{len(passed)}|FAIL|{len(failed)}|SKIPPED|{len(skipped)}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
