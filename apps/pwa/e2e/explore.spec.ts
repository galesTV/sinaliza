import { readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const CATEGORIES = [
  { href: "/explorar/historia", heading: "História" },
  { href: "/explorar/curiosidades", heading: "Curiosidades" },
  { href: "/explorar/personalidades", heading: "Personalidades" },
  { href: "/explorar/biblioteca", heading: "Biblioteca Cultural" },
];

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
}

test.describe("explorar — descoberta cultural", () => {
  test("renders the discovery page with four distinct public category entries", async ({ page }) => {
    await page.goto("/explorar");
    await expect(
      page.getByRole("heading", { name: "Uma língua. Muitas histórias." }),
    ).toBeVisible();

    for (const category of CATEGORIES) {
      await expect(page.locator(`a[href="${category.href}"]`).first()).toBeVisible();
    }

    await expect(page.getByText("Novos conteúdos em preparação")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("navigates from the discovery page to a category and back", async ({ page }) => {
    await page.goto("/explorar");
    await page.locator('a[href="/explorar/historia"]').first().click();
    await expect(page).toHaveURL(/\/explorar\/historia$/);
    await expect(page.getByRole("heading", { name: "História" })).toBeVisible();

    await page.goto("/explorar/historia");
    await page.getByRole("link", { name: "Explorar", exact: true }).first().click();
    await expect(page).toHaveURL(/\/explorar$/);
  });

  for (const category of CATEGORIES) {
    test(`${category.href} renders an honest empty state without candidate content`, async ({ page }) => {
      await page.goto(category.href);
      await expect(page.getByRole("heading", { name: category.heading })).toBeVisible();
      await expect(page.getByText("Novos conteúdos em preparação")).toBeVisible();
      await expect(page.getByText("Ernest Huet")).toHaveCount(0);
      await expect(page.getByText("Flausino")).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
    });
  }

  test("keeps Explore out of the main navigation while the launch gate is closed", async ({ page }) => {
    await page.goto("/");
    const navTexts = await page
      .locator('nav[aria-label="Navegação principal"]')
      .allInnerTexts();
    expect(navTexts.join("\n")).not.toContain("Explorar");
  });

  test("preserves the existing pedagogical journey", async ({ page }) => {
    await page.goto("/trilhas");
    await expect(
      page.getByRole("heading", { name: "Trilhas de aprendizagem" }),
    ).toBeVisible();
    await expect(page.getByText(/0 de \d+ publicadas/).first()).toBeVisible();
  });
});

test.describe("explorar — publication guards", () => {
  test("returns 404 for a real non-publishable candidate slug", async ({ page }) => {
    const response = await page.goto(
      "/explorar/historia/1857-fundacao-do-instituto-que-se-tornou-o-ines",
    );
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Página não encontrada" })).toBeVisible();
  });


  test("returns 404 for the six migrated V2 draft candidates", async ({ page }) => {
    for (const path of [
      "/explorar/personalidades/fernando-cesar-capovilla",
      "/explorar/personalidades/fernanda-de-araujo-machado",
      "/explorar/biblioteca/dicionario-da-lingua-de-sinais-do-brasil",
      "/explorar/biblioteca/enciclopedia-da-lingua-de-sinais-brasileira",
      "/explorar/biblioteca/cartilha-de-libras-em-medicina-e-saude",
      "/explorar/biblioteca/filosofias-educacionais-em-relacao-ao-surdo",
    ]) {
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(404);
    }
  });

  test("returns 404 for an incompatible category and for unknown categories", async ({ page }) => {
    const wrongCategory = await page.goto(
      "/explorar/curiosidades/1857-fundacao-do-instituto-que-se-tornou-o-ines",
    );
    expect(wrongCategory?.status()).toBe(404);

    const unknownCategory = await page.goto("/explorar/categoria-inexistente/registro");
    expect(unknownCategory?.status()).toBe(404);
  });

  test("returns 404 for encoded, malformed and unknown slugs", async ({ page }) => {
    for (const path of [
      "/explorar/historia/registro%20inexistente",
      "/explorar/historia/%",
      "/explorar/historia/slug-que-nao-existe",
    ]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
    }
  });

  test("reserves enough bottom spacing for the fixed mobile navigation", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 1024) >= 768, "mobile-only fixed bottom navigation");
    await page.goto("/explorar/biblioteca");
    const spacing = await page.evaluate(() => {
      const main = document.querySelector("main");
      const nav = document.querySelector('nav.fixed.bottom-0');
      if (!main || !nav) return null;
      return {
        paddingBottom: Number.parseFloat(getComputedStyle(main).paddingBottom),
        navHeight: nav.getBoundingClientRect().height,
      };
    });
    expect(spacing).not.toBeNull();
    expect(spacing!.paddingBottom).toBeGreaterThanOrEqual(spacing!.navHeight);
    await expectNoHorizontalOverflow(page);
  });

  test("does not expose raw editorial data in HTML or the embedded RSC payload", async ({ page }) => {
    for (const path of ["/explorar", "/explorar/historia", "/explorar/curiosidades", "/explorar/biblioteca"]) {
      const response = await page.request.get(path);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).not.toContain("internalPending");
      expect(html).not.toContain("unverified-candidate");
      expect(html).not.toContain("validationStatus");
      expect(html).not.toContain("publicationAuthorization");
      expect(html).not.toContain("editorialBody");
      expect(html).not.toContain("claimIds");
      expect(html).not.toContain("Ernest Huet");
      expect(html).not.toContain("Iconographia de Flausino");
      expect(html).not.toContain("Conferir cronologia");
      expect(html).not.toContain("Fernando César Capovilla");
      expect(html).not.toContain("Fernanda de Araújo Machado");
      expect(html).not.toContain("Dicionário da Língua de Sinais do Brasil");
      const matrix = JSON.parse(readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original/matriz-afirmacoes.json"), "utf8")) as Array<{ id: string; text: string; consultation: string }>;
      const acervo = JSON.parse(readFileSync(join(process.cwd(), "docs/curadoria-cultural/v2/pacote-original/acervo-editorial.json"), "utf8")) as { records: Array<{ id: string; editorialBody: string }> };
      for (const record of acervo.records.filter((item) => ["HIST-001", "HIST-006", "CUR-001"].includes(item.id))) {
        expect(html).not.toContain(record.editorialBody);
      }
      const blocked = new Set(["PER-001-C03", "PER-001-C04", "PER-002-C01", "BIB-002-C01", "BIB-010-C02"]);
      for (const claim of matrix.filter((item) => !blocked.has(item.id))) {
        expect(html).not.toContain(claim.id);
        expect(html).not.toContain(claim.text);
        expect(html).not.toContain(claim.consultation);
      }
    }
  });
});
