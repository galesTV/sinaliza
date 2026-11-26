import {
  expect,
  test,
  type BrowserContext,
  type Page,
} from "@playwright/test";

/**
 * Guided hand-positioning practice on /laboratorio/maos.
 *
 * MediaPipe is replaced by a deterministic source via the dev-only
 * `__sinalizaHandLabSim` hook, and Chromium's fake video device feeds the
 * <video> element — so this exercises the real tracker loop, state machine
 * and UI end to end without real camera hardware or sign inference.
 */

function handAt(x: number, y: number) {
  return {
    landmarks: [Array.from({ length: 21 }, () => ({ x, y, z: 0 }))],
    handedness: [[{ categoryName: "Right" }]],
  };
}

const NO_HAND = { landmarks: [] as never[], handedness: [] as never[] };

async function setObservation(
  page: Page,
  observation: ReturnType<typeof handAt> | typeof NO_HAND,
) {
  await page.evaluate((obs) => {
    (window as unknown as { __handLabObservation: unknown }).__handLabObservation =
      obs;
  }, observation);
}


async function activateCamera(page: Page) {
  const button = page.getByRole("button", { name: "Ativar câmera" });
  // Server-rendered controls are visible before React hydration; waiting for
  // the component's hydration marker avoids losing the first click under
  // parallel E2E load instead of papering over the race with a timeout.
  await expect(page.locator("html")).toHaveAttribute(
    "data-sinaliza-hand-lab-hydrated",
    "true",
  );
  await button.click();
}

async function installSim(context: BrowserContext) {
  await context.addInitScript(() => {
    const w = window as unknown as {
      __handLabObservation: unknown;
      __sinalizaHandLabSim: () => unknown;
    };
    w.__handLabObservation = { landmarks: [], handedness: [] };
    w.__sinalizaHandLabSim = () => w.__handLabObservation;
  });
}

test.use({
  // fake-device feeds a synthetic camera; fake-ui auto-answers the permission
  // prompt (required in headless-shell). The denied test below bypasses both
  // by stubbing getUserMedia itself.
  permissions: ["camera"],
  launchOptions: {
    args: [
      "--use-fake-device-for-media-stream",
      "--use-fake-ui-for-media-stream",
    ],
  },
});

test.describe("guided hand practice", () => {
  test.beforeEach(async ({ context }) => {
    await installSim(context);
  });

  test("completes the guided flow and restarts without touching the camera", async ({
    page,
  }) => {
    await page.goto("/laboratorio/maos");
    await setObservation(page, NO_HAND);

    await activateCamera(page);
    await expect(page.getByText("Câmera ativa")).toBeVisible();
    await expect(page.getByText("Procurando uma mão...")).toBeVisible();

    // Hand outside the target zone.
    await setObservation(page, handAt(0.1, 0.1));
    await expect(page.getByText(/centralize-a na área/)).toBeVisible();

    // Hand inside, held still: completes after ~2s of stable observations.
    await setObservation(page, handAt(0.5, 0.5));
    await expect(
      page.getByText("Mantenha a mão parada por 2 segundos"),
    ).toBeVisible();
    await expect(
      page.getByText("Posicionamento estável confirmado!"),
    ).toBeVisible({ timeout: 8_000 });
    await expect(
      page.getByText(/não reconhece nem avalia sinais de Libras/),
    ).toBeVisible();

    // Retry without restarting the camera — clear the hand first so the
    // reset lands in the searching state deterministically.
    await setObservation(page, NO_HAND);
    await page.getByRole("button", { name: "Tentar novamente" }).click();
    await expect(page.getByText("Procurando uma mão...")).toBeVisible();
    await expect(page.getByText("Câmera ativa")).toBeVisible();

    // The flow can complete again after the manual reset.
    await setObservation(page, handAt(0.5, 0.5));
    await expect(
      page.getByText("Posicionamento estável confirmado!"),
    ).toBeVisible({ timeout: 8_000 });
  });

  test("aligns the positioning zone with the mirrored video frame", async ({
    page,
  }) => {
    await page.goto("/laboratorio/maos");
    await activateCamera(page);
    await expect(page.getByText("Câmera ativa")).toBeVisible();
    await page.waitForFunction(
      () => (document.querySelector("video")?.videoWidth ?? 0) > 0,
    );

    // The overlay must sit exactly where normalized coordinates land after
    // object-contain letterboxing and the -scale-x-100 mirror — recomputed
    // independently here rather than trusting the component's own math.
    const metrics = await page.evaluate(() => {
      const video = document.querySelector("video");
      const zone = document.querySelector('[data-testid="guidance-zone"]');
      if (!video || !zone) return null;
      const scale = Math.min(
        video.clientWidth / video.videoWidth,
        video.clientHeight / video.videoHeight,
      );
      const displayWidth = video.videoWidth * scale;
      const displayHeight = video.videoHeight * scale;
      const offsetX = (video.clientWidth - displayWidth) / 2;
      const offsetY = (video.clientHeight - displayHeight) / 2;
      const videoBox = video.getBoundingClientRect();
      const zoneBox = zone.getBoundingClientRect();
      return {
        zone: {
          left: zoneBox.left - videoBox.left,
          top: zoneBox.top - videoBox.top,
          width: zoneBox.width,
          height: zoneBox.height,
        },
        expected: {
          // Mirrored: normalized x maps to (1 - x), so left comes from xMax.
          left: offsetX + (1 - 0.65) * displayWidth,
          top: offsetY + 0.3 * displayHeight,
          width: 0.3 * displayWidth,
          height: 0.4 * displayHeight,
        },
      };
    });
    expect(metrics).not.toBeNull();
    expect(metrics!.zone.left).toBeCloseTo(metrics!.expected.left, 0);
    expect(metrics!.zone.top).toBeCloseTo(metrics!.expected.top, 0);
    expect(metrics!.zone.width).toBeCloseTo(metrics!.expected.width, 0);
    expect(metrics!.zone.height).toBeCloseTo(metrics!.expected.height, 0);
  });

  test("reports lost detection when the hand disappears mid-hold", async ({
    page,
  }) => {
    await page.goto("/laboratorio/maos");
    await activateCamera(page);
    await expect(page.getByText("Câmera ativa")).toBeVisible();

    await setObservation(page, handAt(0.5, 0.5));
    await expect(
      page.getByText("Mantenha a mão parada por 2 segundos"),
    ).toBeVisible();

    await setObservation(page, NO_HAND);
    await expect(page.getByText(/Perdemos a detecção/)).toBeVisible();
  });

  test("marks the guided practice usable at a 390px viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/laboratorio/maos");

    await expect(page.getByText("Prática guiada")).toBeVisible();
    await expect(page.getByText("Mostre uma mão dentro da área")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Ativar câmera" }),
    ).toBeVisible();

    // No horizontal overflow on the narrow viewport.
    const overflows = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflows).toBe(false);
  });
});

test.describe("guided practice — camera denied", () => {
  test("shows the denied state and keeps the guided panel honest", async ({
    page,
    context,
  }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
        configurable: true,
        value: () =>
          Promise.reject(new DOMException("denied", "NotAllowedError")),
      });
    });
    await page.goto("/laboratorio/maos");
    await activateCamera(page);

    await expect(page.getByText("Permissão negada")).toBeVisible();
    await expect(page.getByText(/Permissão de câmera negada/)).toBeVisible();
    // The guided attempt never starts without the camera.
    await expect(
      page.getByText("Mostre uma mão dentro da área"),
    ).toBeVisible();
    await expect(
      page.getByText("Posicionamento estável confirmado!"),
    ).toHaveCount(0);
  });
});
