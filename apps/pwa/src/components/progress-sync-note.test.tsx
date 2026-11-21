import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProgressSyncNote, syncNoteCopy } from "./progress-sync-note";

const base = {
  configured: true,
  hydrated: false,
  pending: 0,
  failed: 0,
  syncing: false,
};

describe("syncNoteCopy", () => {
  it("never claims synchronization when sync is not configured", () => {
    const text = syncNoteCopy({ ...base, configured: false });
    expect(text).toContain("indisponível");
    expect(text).not.toContain("sincronizado");
  });

  it("reports pending work honestly", () => {
    expect(syncNoteCopy({ ...base, pending: 1 })).toContain(
      "1 conclusão aguardando envio",
    );
    expect(syncNoteCopy({ ...base, pending: 3 })).toContain(
      "3 conclusões aguardando envio",
    );
  });

  it("reports durable failures without pretending they synced", () => {
    expect(syncNoteCopy({ ...base, failed: 2 })).toContain(
      "2 conclusões ainda não foram sincronizadas",
    );
  });

  it("does not claim sync before hydration is confirmed", () => {
    const text = syncNoteCopy({ ...base });
    expect(text).toContain("ainda não confirmada");
    expect(text).not.toContain("sincronizado com a sua conta");
  });

  it("claims synchronization only when hydrated with nothing pending or failed", () => {
    expect(syncNoteCopy({ ...base, hydrated: true })).toContain(
      "sincronizado com a sua conta",
    );
    expect(
      syncNoteCopy({ ...base, hydrated: true, pending: 1 }),
    ).not.toContain("sincronizado com a sua conta");
  });
});

describe("ProgressSyncNote", () => {
  it("renders a status note (SSR renders the not-configured copy)", () => {
    const html = renderToStaticMarkup(<ProgressSyncNote />);
    expect(html).toContain("role=\"status\"");
  });
});
