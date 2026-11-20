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

  test("switches to description mode through the accessible toggle", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao-visual");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise 1 has a permitted stimulus AND a description variant: the
    // manual toggle is exposed as a pressed-state button.
    const toggle = page.getByRole("button", {
      name: "Responder por descrição",
    });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();

    // The visible heading switches to the variant's prompt — the question
    // actually being asked — and the modality note is announced.
    await expect(
      page.getByRole("heading", { name: /Pela descrição/ }),
    ).toBeVisible();
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await expect(
      page.locator('img[src="/media/fixtures/shape-circle.svg"]'),
    ).toHaveCount(0);

    // Toggling back restores the visual version.
    const back = page.getByRole("button", {
      name: "Voltar à versão com imagem",
    });
    await expect(back).toHaveAttribute("aria-pressed", "true");
    await back.click();
    await expect(
      page.locator('img[src="/media/fixtures/shape-circle.svg"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Qual forma geométrica aparece na imagem acima?",
      }),
    ).toBeVisible();

    // Switch to description mode again and answer there: scoring uses the
    // variant's own answer key and feedback pool.
    await page
      .getByRole("button", { name: "Responder por descrição" })
      .click();
    await option(page, "Quadrado").click();
    await expect(page.getByText("Ainda não")).toBeVisible();
    await expect(
      page.getByText("um quadrado tem quatro lados retos"),
    ).toBeVisible();

    // After answering, the modality toggle is no longer offered.
    await expect(
      page.getByRole("button", { name: "Voltar à versão com imagem" }),
    ).toHaveCount(0);

    await option(page, "Círculo").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await expectNoProgressRecorded(page);
  });

  test("restores each exercise's own modality when navigating back and forth", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao-visual");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise A answered by description (manual toggle).
    await page
      .getByRole("button", { name: "Responder por descrição" })
      .click();
    await option(page, "Círculo").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise B opens in the visual modality — A's description
    // preference must not leak into it.
    await expect(
      page.getByRole("heading", {
        name: "Qual das imagens abaixo mostra um quadrado?",
      }),
    ).toBeVisible();
    await expect(
      page.locator('img[src="/media/fixtures/shape-square.svg"]'),
    ).toBeVisible();
    await option(page, "Imagem 2").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise C (gated stimulus) — the description variant auto-opens.
    await expect(page.getByText("Versão por descrição")).toBeVisible();

    // Back to B: its visual answer is intact — visual view, checked radio
    // and visual feedback, not A's description pool.
    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Qual das imagens abaixo mostra um quadrado?",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: /Imagem 2/ }),
    ).toBeChecked();
    await expect(
      page.locator('[role="status"]').getByText("a imagem 2 mostra um quadrado"),
    ).toBeVisible();

    // Back to A: its description answer is intact — variant view, checked
    // radio and the variant's own feedback.
    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(
      page.getByRole("heading", { name: /Pela descrição/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Círculo" }),
    ).toBeChecked();
    await expect(
      page
        .locator('[role="status"]')
        .getByText("a descrição corresponde a um círculo"),
    ).toBeVisible();

    // Forward again: B still shows its own visual state.
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(
      page.getByRole("heading", {
        name: "Qual das imagens abaixo mostra um quadrado?",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("radio", { name: /Imagem 2/ }),
    ).toBeChecked();

    await expectNoProgressRecorded(page);
  });

  test("retries a failed image on revisit instead of latching forever", async ({
    page,
  }) => {
    // First request fails, every later one succeeds — a transient failure
    // that recovers on the next visit.
    let attempts = 0;
    await page.route("**/media/fixtures/shape-does-not-exist.svg", (route) => {
      attempts += 1;
      if (attempts === 1) {
        return route.fulfill({ status: 404 });
      }
      return route.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#f0f4f8"/><polygon points="160,60 240,190 80,190" fill="#2563eb"/></svg>`,
      });
    });

    await page.goto("/laboratorio/licao-visual");
    await page.getByRole("button", { name: "Continuar" }).click();
    await option(page, "Círculo").click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await option(page, "Imagem 2").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise 3 (gated → variant) answered by description.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await option(page, "Círculo").click();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise 4: the first load fails — variant offered instead.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await expect(
      page.locator('img[src="/media/fixtures/shape-does-not-exist.svg"]'),
    ).toHaveCount(0);

    // Leave and come back: the image is retried once and recovers — the
    // exercise opens in the visual modality again.
    await page.getByRole("button", { name: "Voltar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(
      page.locator('img[src="/media/fixtures/shape-does-not-exist.svg"]'),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Qual forma geométrica aparece na imagem acima?",
      }),
    ).toBeVisible();

    // The visual exercise is answerable after recovery.
    await option(page, "Triângulo").click();
    await expect(page.getByText("Correto!")).toBeVisible();

    await expectNoProgressRecorded(page);
  });

  test("keeps the recorded answer's feedback after a later media failure", async ({
    page,
  }) => {
    await page.goto("/laboratorio/licao-visual");
    await page.getByRole("button", { name: "Continuar" }).click();

    // Exercise 1 in visual mode — answer it wrongly.
    await expect(
      page.locator('img[src="/media/fixtures/shape-circle.svg"]'),
    ).toBeVisible();
    await option(page, "Quadrado").click();
    await expect(page.getByText("Ainda não")).toBeVisible();

    // The stimulus fails AFTER the wrong answer was recorded. The variant
    // view opens — but the recorded answer still reads the visual pool's
    // feedback and is never reinterpreted as a variant answer.
    await page.evaluate(() => {
      const img = document.querySelector(
        'img[src="/media/fixtures/shape-circle.svg"]',
      );
      img?.dispatchEvent(new Event("error"));
    });
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    const status = page.locator('[role="status"]');
    // Visual pool's feedback for "Quadrado" — not the variant pool's.
    await expect(
      status.getByText("Não: um quadrado teria quatro lados retos e ângulos retos.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      status.getByText("Não: um quadrado tem quatro lados retos.", {
        exact: true,
      }),
    ).toHaveCount(0);
    // No option is highlighted in the shown modality: the recorded answer
    // belongs to the visual pool, which is not what is rendered now.
    await expect(page.getByRole("radio", { name: "Quadrado" })).not.toBeChecked();

    await expectNoProgressRecorded(page);
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
    // rendered and the description variant is offered instead. The visible
    // heading is the variant's prompt, not the hidden visual one.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Pela descrição: a forma tem todos os pontos/,
      }),
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
      page.getByRole("heading", {
        name: /Pela descrição: a forma tem três lados/,
      }),
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

    // Step 1: intro text.
    await page.getByRole("button", { name: "Continuar" }).click();

    // Steps 2-9: letter explanations alternate with gated media slots.
    // Each slot must stay in the honest "em produção" state — no image
    // is fetched because no permission evidence was recorded.
    for (const letter of ["B", "L", "A", "I"]) {
      await expect(
        page.getByRole("heading", {
          name: new RegExp(`Letra ${letter}`),
        }),
      ).toBeVisible();
      await page.getByRole("button", { name: "Continuar" }).click();
      await expect(
        page.getByText("Demonstração visual em produção"),
      ).toBeVisible();
      // Candidate attribution is preserved even while the media is
      // unavailable — but never as a link: the lesson must not point
      // learners at an unlicensed, unvalidated photo.
      await expect(page.getByText(/Fiocruz Imagens/)).toBeVisible();
      await expect(
        page.locator('a[href*="fiocruzimagens"]'),
      ).toHaveCount(0);
      await page.getByRole("button", { name: "Continuar" }).click();
    }
    await expect(
      page.locator('img[src^="/media/alfabeto/primeiros-passos/"]'),
    ).toHaveCount(0);

    // Step 10: comparison text.
    await expect(
      page.getByRole("heading", { name: "Comparando as quatro letras" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 11: visual exercise — gated prompt media auto-opens the
    // description variant, honestly labelled as a different assessment.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: /Pela descrição: a demonstração mostra a mão aberta/,
      }),
    ).toBeVisible();
    await option(page, "Letra B").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 12: visual exercise with option media — also description-gated.
    await expect(page.getByText("Versão por descrição")).toBeVisible();
    await option(page, "Imagem 2").click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 13: plain textual exercise (no media involved).
    await option(page, /forma dos dedos/).click();
    await expect(page.getByText("Correto!")).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 14: recap text.
    await expect(
      page.getByRole("heading", { name: "Recapitulando" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continuar" }).click();

    // Step 15: optional external resources — plain safe links, clearly
    // marked as external and never blocking completion.
    await expect(
      page.getByRole("heading", { name: "Recursos complementares" }),
    ).toBeVisible();
    const ines = page.getByRole("link", {
      name: /^Alfabeto de Libras e Configuração de Mãos/,
    });
    await expect(ines).toBeVisible();
    await expect(ines).toHaveAttribute("target", "_blank");
    await expect(ines).toHaveAttribute("rel", /noopener noreferrer/);
    const unesp = page.getByRole("link", {
      name: /^Videoaula 1 — alfabeto/,
    });
    await expect(unesp).toHaveAttribute(
      "href",
      "https://acervodigital.unesp.br/handle/unesp/222981",
    );
    await expect(unesp).toHaveAttribute("target", "_blank");
    await expect(page.getByText(/site externo/).first()).toBeVisible();
    await expect(
      page.getByText(/não passaram pela revisão da especialista/),
    ).toBeVisible();
    await page.getByRole("button", { name: "Finalizar experiência" }).click();
    await page
      .getByRole("button", { name: "Concluir experiência" })
      .click();
    await expect(page.getByText("Prévia concluída")).toBeVisible();

    await expectNoProgressRecorded(page);
  });
});
