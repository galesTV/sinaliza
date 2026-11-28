import { expect, test, type BrowserContext, type Page } from "@playwright/test";

/**
 * Production-only regression for the pre-hydration interaction race. Run with
 * PLAYWRIGHT_PRODUCTION=1 against `next start` on the configured port; the
 * standard config then reuses that server instead of booting `next dev`.
 */

test.skip(
  process.env.PLAYWRIGHT_PRODUCTION !== "1",
  "requires PLAYWRIGHT_PRODUCTION=1 and a production server",
);

async function throttleCpu(page: Page, rate: number) {
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate });
}

async function holdJavaScriptChunks(context: BrowserContext) {
  let releaseGate!: () => void;
  const gate = new Promise<void>((resolve) => {
    releaseGate = resolve;
  });
  await context.route(/\/_next\/static\/chunks\/.*\.js/, async (route) => {
    await gate;
    await route.continue();
  });
  return {
    release() {
      releaseGate();
    },
  };
}

function option(page: Page, text: string) {
  return page.locator("fieldset label", { hasText: text });
}

async function activateAtCenter(
  page: Page,
  box: { x: number; y: number; width: number; height: number },
  useTouch: boolean,
) {
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (useTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

for (const theme of ["dark", "light"] as const) {
  test(`production hydration gate prevents premature activation in ${theme} theme`, async ({
    page,
    context,
  }, testInfo) => {
    const useTouch = testInfo.project.name === "mobile";
    await throttleCpu(page, 6);
    await context.addInitScript((selectedTheme) => {
      window.localStorage.setItem("sinaliza.theme-preference.v1", selectedTheme);
    }, theme);
    const chunkGate = await holdJavaScriptChunks(context);

    await page.goto("/laboratorio/licao-visual", { waitUntil: "commit" });

    const runner = page.locator("[data-lesson-interactive]").first();
    const continueButton = page
      .getByRole("button", { name: "Continuar" })
      .first();

    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeDisabled();
    await expect(runner).toHaveAttribute("data-lesson-interactive", "false");

    await continueButton.scrollIntoViewIfNeeded();
    const box = await continueButton.boundingBox();
    expect(box).not.toBeNull();
    await activateAtCenter(page, box!, useTouch);
    await expect(page.getByText(/Passo 1 de/)).toBeVisible();

    chunkGate.release();

    await expect(runner).toHaveAttribute("data-lesson-interactive", "true");
    await expect(continueButton).toBeEnabled();
    await expect(page.getByText(/Passo 1 de/)).toBeVisible();

    await continueButton.scrollIntoViewIfNeeded();
    const readyBox = await continueButton.boundingBox();
    expect(readyBox).not.toBeNull();
    await activateAtCenter(page, readyBox!, useTouch);

    await expect(page.getByText(/Passo 2 de/)).toBeVisible();
    await expect(page.getByText(/Passo 3 de/)).toHaveCount(0);
    await expect(page.locator("#lesson-runner-title")).toBeFocused();
  });
}

test("keyboard activation after readiness advances exactly one step at normal CPU", async ({
  page,
}) => {
  await throttleCpu(page, 1);
  await page.goto("/laboratorio/licao");

  const runner = page.locator("[data-lesson-interactive]").first();
  const continueButton = page.getByRole("button", { name: "Continuar" }).first();
  await expect(runner).toHaveAttribute("data-lesson-interactive", "true");
  await expect(continueButton).toBeEnabled();

  let focused = false;
  for (let step = 0; step < 30; step += 1) {
    await page.keyboard.press("Tab");
    focused = await continueButton.evaluate(
      (button) => document.activeElement === button,
    );
    if (focused) break;
  }
  expect(focused).toBe(true);

  await page.keyboard.press("Enter");
  await expect(page.getByText(/Passo 2 de/)).toBeVisible();
  await expect(page.getByText(/Passo 3 de/)).toHaveCount(0);
  await expect(page.locator("#lesson-runner-title")).toBeFocused();
});

test("production guided experience exposes the same readiness contract", async ({
  page,
  context,
}) => {
  await throttleCpu(page, 1);
  await context.addInitScript(() => {
    window.localStorage.setItem("sinaliza.theme-preference.v1", "light");
  });
  await page.goto("/laboratorio/experiencia");

  const runner = page.locator("[data-lesson-interactive]").first();
  await expect(runner).toHaveAttribute("data-lesson-interactive", "true");
  const continueButton = page.getByRole("button", { name: "Continuar" }).first();
  await expect(continueButton).toBeEnabled();
  await continueButton.click();
  await expect(page.getByText(/Passo 2 de/)).toBeVisible();
  await expect(page.locator("#lesson-runner-title")).toBeFocused();
});

test("production back navigation and restart preserve step focus", async ({
  page,
}) => {
  await throttleCpu(page, 1);
  await page.goto("/laboratorio/licao");

  const runner = page.locator("[data-lesson-interactive]").first();
  await expect(runner).toHaveAttribute("data-lesson-interactive", "true");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText(/Passo 2 de/)).toBeVisible();
  await expect(page.locator("#lesson-runner-title")).toBeFocused();

  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.getByText(/Passo 1 de/)).toBeVisible();
  await expect(page.locator("#lesson-runner-title")).toBeFocused();

  await page.getByRole("button", { name: "Continuar" }).click();
  await option(page, "Somente depois de acertar a resposta").click();
  await page.getByRole("button", { name: "Confirmar resposta" }).click();
  await expect(page.getByText("Correto!")).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByText(/Passo 3 de/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText(/Passo 4 de/)).toBeVisible();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText(/Passo 5 de/)).toBeVisible();

  await option(
    page,
    "Nada é registrado — a demo não afeta seu progresso real",
  ).click();
  await page.getByRole("button", { name: "Confirmar resposta" }).click();
  await expect(page.getByText("Correto!")).toBeVisible();
  await page.getByRole("button", { name: "Finalizar experiência" }).click();
  await page.getByRole("button", { name: "Concluir experiência" }).click();

  await page.getByRole("button", { name: "Recomeçar" }).click();
  await expect(page.getByText(/Passo 1 de/)).toBeVisible();
  await expect(page.locator("#lesson-runner-title")).toBeFocused();
});
