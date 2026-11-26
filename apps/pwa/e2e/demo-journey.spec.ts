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
      name: "Iniciar experiência guiada",
    });
    await expect(labLink).toBeVisible();
    await expect(labLink).toHaveAttribute("href", "/laboratorio/experiencia");

    // The draft-preview link stays — publication gates unchanged.
    await expect(
      page.getByRole("link", { name: /Ver prévia do conteúdo em revisão/ }),
    ).toHaveAttribute(
      "href",
      "/laboratorio/licoes/alfabeto/primeiros-passos/primeiras-letras",
    );

    await labLink.click();
    await expect(page).toHaveURL(/\/laboratorio\/experiencia$/);
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

const FIRST_WRONG = "Marca uma lição da trilha do alfabeto como concluída";
const FIRST_RIGHT = "Nada — a atividade do laboratório não gera progresso";
const SECOND_RIGHT =
  "Quando houver licença confirmada e a revisão especializada da versão atual";

function demoConstellation(page: Page) {
  return page.getByTestId("demo-constellation");
}

async function answerGuidedExercise(page: Page, label: string) {
  await page.locator("fieldset label", { hasText: label }).click();
}

async function reachFirstGuidedExercise(page: Page) {
  await page.goto("/laboratorio/experiencia");
  await expect(demoConstellation(page)).toBeVisible();
  await expect(demoConstellation(page)).toHaveAttribute("data-correct", "0");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Passo 4 de 6")).toBeVisible();
}

test.describe("guided public demo constellation", () => {
  test("home offers the experience as the immediate action", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator('section[aria-labelledby="home-title"]');
    const cta = hero.getByRole("link", { name: "Experimentar o Sinaliza" });
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/\/laboratorio\/experiencia$/);
    await expect(
      page.getByRole("heading", { name: "Experiência guiada de aprendizagem" }),
    ).toBeVisible();
  });

  test("incorrect answers give feedback without evolving the simulation", async ({
    page,
  }) => {
    await reachFirstGuidedExercise(page);
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-furthest-step",
      "3",
    );

    await answerGuidedExercise(page, FIRST_WRONG);
    await expect(page.getByText("Ainda não — tente novamente")).toBeVisible();
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "0");
    await expect(page.getByTestId("demo-constellation-mini")).toHaveAttribute(
      "data-correct",
      "0",
    );
    await expect(
      page.locator('[data-demo-node="3"]'),
    ).toHaveAttribute("data-state", "current");

    await answerGuidedExercise(page, FIRST_RIGHT);
    await expect(page.getByText("Correto!")).toBeVisible();
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "1");
    await expect(page.getByTestId("demo-constellation-mini")).toHaveAttribute(
      "data-correct",
      "1",
    );
    await expect(
      page.locator('[data-demo-node="3"]'),
    ).toHaveAttribute("data-state", "correct");
    await expect(
      page.locator('[data-mini-node="3"]'),
    ).toHaveAttribute("data-state", "correct");
    const pulse = await page
      .locator('[data-demo-node="3"] circle')
      .first()
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          name: style.animationName,
          iterations: style.animationIterationCount,
        };
      });
    expect(pulse).toEqual({ name: "demo-node-pulse", iterations: "1" });
  });

  test("back and forward navigation never duplicates demo achievements", async ({
    page,
  }) => {
    await reachFirstGuidedExercise(page);
    await answerGuidedExercise(page, FIRST_RIGHT);
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText("Passo 5 de 6")).toBeVisible();

    await page.getByRole("button", { name: "Voltar" }).click();
    await expect(page.getByText("Passo 4 de 6")).toBeVisible();
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-furthest-step",
      "4",
    );
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "1");
    await expect(
      page.locator('[data-demo-node="4"]'),
    ).toHaveAttribute("data-state", "passed");

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-furthest-step",
      "4",
    );
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "1");
  });

  test("completes with an honest summary, final simulation and next actions", async ({
    page,
  }) => {
    const before = JSON.stringify({
      version: 1,
      completed: ["alfabeto/primeiros-passos/libras-e-uma-lingua"],
    });
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [PROGRESS_KEY, before],
    );

    await reachFirstGuidedExercise(page);
    await answerGuidedExercise(page, FIRST_RIGHT);
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await answerGuidedExercise(page, SECOND_RIGHT);
    await page.getByRole("button", { name: "Finalizar experiência" }).click();
    await page.getByRole("button", { name: "Concluir experiência" }).click();

    await expect(
      page.getByRole("heading", { name: "Demonstração concluída" }),
    ).toBeFocused();
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-completed",
      "true",
    );
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "2");
    await expect(page.getByText(/nenhum progresso foi salvo/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Experimentar laboratório de mãos" }),
    ).toHaveAttribute("href", "/laboratorio/maos");
    await expect(
      page.getByRole("link", { name: "Explorar trilhas" }),
    ).toHaveAttribute("href", "/trilhas");

    const after = await page.evaluate(
      (key) => localStorage.getItem(key),
      PROGRESS_KEY,
    );
    expect(after).toBe(before);
    const sinalizaKeys = await page.evaluate(() =>
      Object.keys(localStorage).filter((key) => key.startsWith("sinaliza")),
    );
    expect(sinalizaKeys).toEqual([PROGRESS_KEY]);
  });

  test("restart resets the ephemeral simulation and reload drops it", async ({
    page,
  }) => {
    await reachFirstGuidedExercise(page);
    await answerGuidedExercise(page, FIRST_RIGHT);
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await answerGuidedExercise(page, SECOND_RIGHT);
    await page.getByRole("button", { name: "Finalizar experiência" }).click();
    await page.getByRole("button", { name: "Concluir experiência" }).click();
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-completed",
      "true",
    );

    await page.getByRole("button", { name: "Recomeçar" }).click();
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-completed",
      "false",
    );
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "0");
    await expect(
      page.locator('[data-demo-node="3"]'),
    ).toHaveAttribute("data-state", "locked");

    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await answerGuidedExercise(page, FIRST_RIGHT);
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "1");
    await page.reload();
    await expect(demoConstellation(page)).toHaveAttribute("data-correct", "0");
    await expect(demoConstellation(page)).toHaveAttribute(
      "data-completed",
      "false",
    );
    await expectNoProgressRecorded(page);
  });

  test("correct-answer animation is disabled under reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await reachFirstGuidedExercise(page);
    await answerGuidedExercise(page, FIRST_RIGHT);
    await expect(
      page.locator('[data-demo-node="3"]'),
    ).toHaveAttribute("data-state", "correct");
    const animationName = await page
      .locator('[data-demo-node="3"] circle')
      .first()
      .evaluate((node) => getComputedStyle(node).animationName);
    expect(animationName).toBe("none");
  });
});

test.describe("mobile lesson pager regression", () => {
  for (const width of [320, 375, 390, 430]) {
    test(`does not overflow horizontally at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/trilhas/alfabeto/primeiros-passos/primeiras-letras");
      await expect(
        page.getByRole("heading", {
          name: "Primeiras letras do alfabeto manual",
        }),
      ).toBeVisible();
      await expect(
        page.getByText("Conteúdo anterior do percurso"),
      ).toBeVisible();
      const measurements = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        navRight: document
          .querySelector("nav.fixed")
          ?.getBoundingClientRect().right,
      }));
      expect(measurements.scrollWidth).toBeLessThanOrEqual(
        measurements.innerWidth,
      );
      if (measurements.navRight !== undefined) {
        expect(measurements.navRight).toBeLessThanOrEqual(
          measurements.innerWidth,
        );
      }
    });
  }
});
