import { expect, test, type Page } from "@playwright/test";

const PROGRESS_KEY = "sinaliza.progress.v1";

async function expectNoProgressRecorded(page: Page) {
  const stored = await page.evaluate(
    (key) => localStorage.getItem(key),
    PROGRESS_KEY,
  );
  expect(stored).toBeNull();
}

/** Clicks the option card whose text matches — the radio input itself is visually hidden. */
function option(page: Page, text: string | RegExp) {
  return page.locator("fieldset label", { hasText: text });
}

test.describe("textual lesson demo", () => {
  test("navigates steps, requires correct answers and records no progress", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao");
    await expect(page.getByText("Passo 1 de 5")).toBeVisible();

    await page.getByRole("button", { name: "Continuar" }).click();

    // Wrong answer gives feedback and does not unlock advancing.
    await option(page, "Imediatamente, antes de escolher").click();
    await expect(page.getByText("Ainda não")).toBeVisible();

    await option(page, "Somente depois de acertar").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Media step advances freely.
    await expect(page.getByText("Passo 3 de 5")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();

    await option(page, "Nada é registrado").click();
    await page.getByRole("button", { name: "Finalizar experiência" }).click();
    await page
      .getByRole("button", { name: "Concluir experiência" })
      .click();
    await expect(page.getByText("Demonstração concluída")).toBeVisible();

    await expectNoProgressRecorded(page);
  });

  test("is operable by keyboard with accessible feedback", async ({ page }) => {
    await page.goto("/laboratorio/licao");

    // Tab to "Continuar" and activate with Enter.
    let attempts = 0;
    while (attempts < 20) {
      await page.keyboard.press("Tab");
      const isButton = await page.evaluate(
        () => document.activeElement?.tagName === "BUTTON",
      );
      if (isButton) break;
      attempts += 1;
    }
    await page.keyboard.press("Enter");
    await expect(page.getByText("Passo 2 de 5")).toBeVisible();

    // Tab to a radio option and select it with Space.
    attempts = 0;
    while (attempts < 20) {
      await page.keyboard.press("Tab");
      const isRadio = await page.evaluate(
        () => document.activeElement?.getAttribute("type") === "radio",
      );
      if (isRadio) break;
      attempts += 1;
    }
    await page.keyboard.press("Space");
    // Feedback region announces the result for assistive tech.
    await expect(page.locator('[role="status"]')).toBeVisible();
    await expectNoProgressRecorded(page);
  });
});

test.describe("visual exercise infrastructure", () => {
  test("renders permitted stimulus and option media from local fixtures", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao-visual");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Stimulus image is visible before answering.
    const stimulus = page.locator(
      'img[src="/media/fixtures/shape-circle.svg"]',
    );
    await expect(stimulus.first()).toBeVisible();
    await option(page, "Círculo").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Options carry their own images.
    await expect(
      page.locator('img[src="/media/fixtures/shape-triangle.svg"]'),
    ).toBeVisible();
    await expect(
      page.locator('img[src="/media/fixtures/shape-square.svg"]'),
    ).toBeVisible();
    await option(page, "Imagem 2").click();
    await expect(page.getByText("Correto!")).toBeVisible();
  });

  test("falls back to the description variant when media is gated or fails", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao-visual");
    await page.getByRole("button", { name: "Continuar" }).click();
    await option(page, "Círculo").click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await option(page, "Imagem 2").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise 3: stimulus without permission evidence — the image is never
    // rendered and the description variant is offered instead.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await expect(
      page.getByText("Pela descrição: a forma tem todos os pontos"),
    ).toBeVisible();
    await expect(
      page.locator('img[src="/media/fixtures/shape-circle.svg"]'),
    ).toHaveCount(0);
    await option(page, "Círculo").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise 4: permitted stimulus whose file is missing — the load
    // failure produces the same description-variant fallback.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await expect(
      page.getByText("Pela descrição: a forma tem três lados"),
    ).toBeVisible();
    await option(page, "Triângulo").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Finalizar experiência" }).click();
    await page.getByRole("button", { name: "Concluir experiência" }).click();
    await expect(page.getByText("Demonstração concluída")).toBeVisible();

    await expectNoProgressRecorded(page);
  });

  test("keeps a visual exercise without stimulus and without variant blocked", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao-visual-bloqueada");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page.getByText("Exercício indisponível")).toBeVisible();
    // No stimulus image is rendered and every option is disabled.
    await expect(
      page.locator('img[src="/media/fixtures/shape-circle.svg"]'),
    ).toHaveCount(0);
    for (const radio of await page.getByRole("radio").all()) {
      await expect(radio).toBeDisabled();
    }
    // The activity cannot be finished: no advance/complete button exists.
    await expect(
      page.getByRole("button", { name: "Continuar" }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: "Finalizar" }),
    ).toHaveCount(0);

    await expectNoProgressRecorded(page);
  });
});

test.describe("draft preview", () => {
  test("shows honest review state and never records progress", async ({
    page,
  }) => {
    await page.goto(
      "/laboratorio/licoes/alfabeto/primeiros-passos/primeiras-letras",
    );
    await expect(
      page.getByText("Rascunho", { exact: true }).first(),
    ).toBeVisible();

    // Walk the whole draft (5 texts + 3 exercises; correct options 0, 0, 2).
    for (let i = 0; i < 5; i += 1) {
      await page.getByRole("button", { name: "Continuar" }).click();
    }
    await page.locator("fieldset label").nth(0).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.locator("fieldset label").nth(0).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.locator("fieldset label").nth(2).click();
    await page.getByRole("button", { name: "Finalizar experiência" }).click();
    await page
      .getByRole("button", { name: "Concluir experiência" })
      .click();
    await expect(page.getByText("Prévia concluída")).toBeVisible();

    await expectNoProgressRecorded(page);
  });
});
