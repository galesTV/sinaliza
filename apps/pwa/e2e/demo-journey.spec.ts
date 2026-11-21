import { expect, test, type Page } from "@playwright/test";

const PROGRESS_KEY = "sinaliza.progress.v1";

async function expectNoProgressRecorded(page: Page) {
  const stored = await page.evaluate(
    (key) => localStorage.getItem(key),
    PROGRESS_KEY,
  );
  expect(stored).toBeNull();
}

test.describe("laboratório demo index", () => {
  test("lists the demo journey and navigates to each destination", async ({
    page,
  }) => {
    await page.goto("/laboratorio");
    await expect(
      page.getByRole("heading", { name: "Demonstrações do Sinaliza" }),
    ).toBeVisible();
    await expect(
      page.getByText(/Não são lições publicadas/),
    ).toBeVisible();

    const journey = [
      "/laboratorio/experiencia",
      "/laboratorio/licoes",
      "/laboratorio/alfabeto",
      "/laboratorio/maos",
    ];
    for (const href of journey) {
      const link = page.locator(`a[href="${href}"]`).first();
      await expect(link).toBeVisible();
    }

    // Ordered: experiencia before licoes before alfabeto before maos.
    const hrefs = await page
      .locator('ol[aria-label="Demonstrações em sequência"] a')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs).toEqual(journey);

    await page.locator('a[href="/laboratorio/licoes"]').first().click();
    await expect(
      page.getByRole("heading", { name: "Lições em revisão" }),
    ).toBeVisible();
  });

  test("is reachable from the main navigation", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegação principal" });
    const labLink = nav.getByRole("link", { name: "Laboratório" }).first();
    await expect(labLink).toBeVisible();
    await labLink.click();
    await expect(page).toHaveURL(/\/laboratorio$/);
  });
});

test.describe("contextual lab link", () => {
  test("planned lesson pages link to the lab and keep draft previews", async ({
    page,
  }) => {
    await page.goto("/trilhas/alfabeto/primeiros-passos/primeiras-letras");

    const labLink = page.getByRole("link", {
      name: "Conheça as demonstrações do Sinaliza",
    });
    await expect(labLink).toBeVisible();
    await expect(labLink).toHaveAttribute("href", "/laboratorio");

    // The draft-preview link stays — publication gates unchanged.
    await expect(
      page.getByRole("link", { name: /Ver prévia do conteúdo em revisão/ }),
    ).toHaveAttribute(
      "href",
      "/laboratorio/licoes/alfabeto/primeiros-passos/primeiras-letras",
    );

    await labLink.click();
    await expect(page).toHaveURL(/\/laboratorio$/);
    await expectNoProgressRecorded(page);
  });
});

test.describe("honest learning-path status", () => {
  test("path cards show derived publication counts instead of Aberta", async ({
    page,
  }) => {
    await page.goto("/trilhas");
    await expect(page.getByText("Aberta")).toHaveCount(0);
    await expect(
      page.getByText(/0 de \d+ publicadas/).first(),
    ).toBeVisible();
  });

  test("path page shows the real publication breakdown", async ({ page }) => {
    await page.goto("/trilhas/alfabeto");
    await expect(page.getByText("Aberta")).toHaveCount(0);
    await expect(page.getByText(/0 de \d+ publicadas/)).toBeVisible();
    await expect(page.getByText(/\d+ em revisão/)).toBeVisible();
    await expect(page.getByText(/\d+ planejadas/)).toBeVisible();
  });

  test("draft boundary is unchanged — previews stay unvalidated", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licoes");
    await page
      .getByRole("link", { name: /Libras é uma língua/ })
      .click();
    await expect(
      page.getByText("Prévia em revisão — conteúdo não validado"),
    ).toBeVisible();
    await expect(page.getByText("Rascunho").first()).toBeVisible();
    await expectNoProgressRecorded(page);
  });
});
