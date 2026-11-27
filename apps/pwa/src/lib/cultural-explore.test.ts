import { describe, expect, it } from "vitest";

import {
  compareHistoryEntries,
  filterLibraryEntries,
  formatHistoryDate,
  getPersonInitials,
  normalizeCulturalSearchText,
  uniqueLibraryValues,
} from "./cultural-explore";
import {
  fixtureHistoryEntries,
  fixtureLibraryEntries,
} from "@/test/cultural-fixtures";

describe("cultural explore helpers", () => {
  it("sorts history chronologically without inventing missing dates", () => {
    const ordered = [...fixtureHistoryEntries].sort(compareHistoryEntries);
    expect(ordered.map((entry) => entry.id)).toEqual(["FIX-HIST-001", "FIX-HIST-002"]);
    expect(formatHistoryDate(ordered[0])).toBe("2010");
    expect(
      formatHistoryDate({
        ...ordered[0],
        history: { unknownMetadata: [] },
      } as never),
    ).toBe("Data em apuração");
  });

  it("normalizes accents and case for local library search", () => {
    expect(normalizeCulturalSearchText(" Constelação Fictícia ")).toBe("constelacao ficticia");
    const results = filterLibraryEntries(
      fixtureLibraryEntries,
      { query: "constelacao", format: "all", access: "all" },
      (entry) => entry.title,
    );
    expect(results.map((entry) => entry.id)).toEqual(["FIX-BIB-002"]);
  });

  it("filters public library entries by format and access", () => {
    const byFormat = filterLibraryEntries(
      fixtureLibraryEntries,
      { query: "", format: "book", access: "all" },
      (entry) => entry.title,
    );
    expect(byFormat.map((entry) => entry.id)).toEqual(["FIX-BIB-001"]);

    const byAccess = filterLibraryEntries(
      fixtureLibraryEntries,
      { query: "", format: "all", access: "external-website" },
      (entry) => entry.title,
    );
    expect(byAccess.map((entry) => entry.id)).toEqual(["FIX-BIB-002"]);
  });

  it("derives unique public filter values and neutral person initials", () => {
    expect(uniqueLibraryValues(fixtureLibraryEntries, "format")).toEqual([
      "audiovisual-series",
      "book",
    ]);
    expect(uniqueLibraryValues(fixtureLibraryEntries, "access")).toEqual([
      "external-website",
      "open-digital",
    ]);
    expect(getPersonInitials("Pessoa Fictícia Um")).toBe("PF");
    expect(getPersonInitials("")).toBe("?");
  });
});
