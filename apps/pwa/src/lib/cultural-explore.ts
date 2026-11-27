import type {
  PublicCulturalHistoryEntry,
  PublicCulturalLibraryEntry,
} from "@/data/cultural-publication";

export function compareHistoryEntries(
  left: PublicCulturalHistoryEntry,
  right: PublicCulturalHistoryEntry,
): number {
  if (left.history.year !== undefined && right.history.year !== undefined) {
    return left.history.year - right.history.year;
  }
  if (left.history.year !== undefined) return -1;
  if (right.history.year !== undefined) return 1;

  const leftDate = left.history.dateLabel ?? "";
  const rightDate = right.history.dateLabel ?? "";
  const dateComparison = leftDate.localeCompare(rightDate, "pt-BR");
  if (dateComparison !== 0) return dateComparison;
  return left.title.localeCompare(right.title, "pt-BR");
}

export function formatHistoryDate(
  entry: Pick<PublicCulturalHistoryEntry, "history">,
): string {
  if (entry.history.dateLabel) return entry.history.dateLabel;
  if (entry.history.year !== undefined) return String(entry.history.year);
  return "Data em apuração";
}

export function normalizeCulturalSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export interface LibraryBrowserFilters {
  query: string;
  format: string;
  access: string;
}

export function filterLibraryEntries(
  entries: readonly PublicCulturalLibraryEntry[],
  filters: LibraryBrowserFilters,
  searchableText: (entry: PublicCulturalLibraryEntry) => string,
): PublicCulturalLibraryEntry[] {
  const query = normalizeCulturalSearchText(filters.query);

  return entries.filter((entry) => {
    if (filters.format !== "all" && entry.library.format !== filters.format) {
      return false;
    }
    if (filters.access !== "all" && entry.library.access !== filters.access) {
      return false;
    }
    if (!query) return true;
    return normalizeCulturalSearchText(searchableText(entry)).includes(query);
  });
}

export function uniqueLibraryValues(
  entries: readonly PublicCulturalLibraryEntry[],
  key: "format" | "access",
): string[] {
  return [
    ...new Set(
      entries
        .map((entry) => entry.library[key])
        .filter((value): value is string => Boolean(value)),
    ),
  ].sort((left, right) => left.localeCompare(right, "pt-BR"));
}

function getInitials(value: string): string {
  const initials = value
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !["da", "de", "do", "das", "dos", "e"].includes(part.toLocaleLowerCase("pt-BR")))
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("pt-BR"))
    .join("");
  return initials || "?";
}

export function getPersonInitials(name: string): string {
  return getInitials(name);
}

export function getTitleInitials(title: string): string {
  return getInitials(title);
}
