import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DisplayNameForm } from "./display-name-form";

// The form uses useRouter only for post-save refresh; SSR assertions do not
// need a real App Router context.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }),
}));

describe("DisplayNameForm (SSR)", () => {
  it("renders the persisted name in the labeled input", () => {
    const html = renderToStaticMarkup(
      <DisplayNameForm userId="user-1" savedName="Ana" />,
    );
    expect(html).toContain('for="nome-exibicao"');
    expect(html).toContain('id="nome-exibicao"');
    expect(html).toContain('value="Ana"');
    expect(html).toContain("Nome de exibição");
    expect(html).toContain("Salvar nome");
  });

  it("wires the hint through aria-describedby", () => {
    const html = renderToStaticMarkup(
      <DisplayNameForm userId="user-1" savedName="Ana" />,
    );
    expect(html).toContain('aria-describedby="nome-exibicao-dica"');
    expect(html).toContain('id="nome-exibicao-dica"');
  });

  it("explains the recoverable state when the profile row is missing", () => {
    const html = renderToStaticMarkup(
      <DisplayNameForm userId="user-1" savedName={null} />,
    );
    expect(html).toContain("ainda não tem um nome de exibição");
    expect(html).toContain('value=""');
  });

  it("renders no error or success state on first paint", () => {
    const html = renderToStaticMarkup(
      <DisplayNameForm userId="user-1" savedName="Ana" />,
    );
    expect(html).not.toContain('role="alert"');
    expect(html).not.toContain('role="status"');
    expect(html).not.toContain("aria-invalid");
  });
});
