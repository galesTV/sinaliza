import { expect, test, type Page } from "@playwright/test";

const THEME_KEY = "sinaliza.theme-preference.v1";
const PROGRESS_KEY = "sinaliza.progress.v1";

function themeButton(page: Page) {
  return page.getByRole("button", { name: /^Tema:/ });
}

async function openThemeMenu(page: Page) {
  await themeButton(page).click();
  return page.getByRole("menu", { name: "Preferência de tema" });
}

test("defaults to dark and exposes one header selector outside the bottom nav", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeButton(page)).toHaveAccessibleName("Tema: Escuro");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#10172b",
  );

  const bottomNav = page.locator("nav.fixed");
  await expect(bottomNav.getByRole("button", { name: /Tema/ })).toHaveCount(0);
});

test("selects light, persists after reload and survives client-side navigation", async ({
  page,
}) => {
  await page.goto("/");
  const menu = await openThemeMenu(page);
  await menu.getByRole("menuitemradio", { name: /^Claro/ }).click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(themeButton(page)).toHaveAccessibleName("Tema: Claro");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#F6FAF9",
  );
  expect(await page.evaluate((key) => localStorage.getItem(key), THEME_KEY)).toBe(
    "light",
  );

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(themeButton(page)).toHaveAccessibleName("Tema: Claro");

  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("link", { name: "Trilhas" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/trilhas$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.goto("/laboratorio");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("system follows prefers-color-scheme dynamically", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, "system"),
    THEME_KEY,
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(themeButton(page)).toHaveAccessibleName("Tema: Sistema");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("invalid stored preferences fall back to dark without throwing", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, "high-contrast"),
    THEME_KEY,
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeButton(page)).toHaveAccessibleName("Tema: Escuro");
  expect(pageErrors).toEqual([]);
});

test("supports keyboard operation, focus return and no keyboard trap", async ({ page }) => {
  await page.goto("/");
  const button = themeButton(page);
  await button.focus();
  await page.keyboard.press("ArrowDown");

  const menu = page.getByRole("menu", { name: "Preferência de tema" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitemradio", { name: /^Escuro/ })).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitemradio", { name: /^Sistema/ })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(menu.getByRole("menuitemradio", { name: /^Claro/ })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(menu).not.toBeVisible();
  await expect(button).toBeFocused();
  await expect(button).toHaveAccessibleName("Tema: Claro");

  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(button).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(button).not.toBeFocused();
});

test("closes on outside click and does not write auth or progress keys", async ({
  page,
}) => {
  await page.goto("/");
  const menu = await openThemeMenu(page);
  await expect(menu).toBeVisible();
  await page.locator("main").click();
  await expect(menu).not.toBeVisible();

  await openThemeMenu(page);
  await page
    .getByRole("menuitemradio", { name: /^Claro/ })
    .click();
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toContain(THEME_KEY);
  expect(keys).not.toContain(PROGRESS_KEY);
  expect(keys.some((key) => key.startsWith("sb-"))).toBe(false);
});

test("does not emit hydration errors when a stored light preference is bootstrapped", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, "light"),
    THEME_KEY,
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(themeButton(page)).toHaveAccessibleName("Tema: Claro");

  const relevant = [...consoleErrors, ...pageErrors].filter((message) =>
    /hydration|hydrat|did not match/i.test(message),
  );
  expect(relevant).toEqual([]);
});

test("offline fallback applies the persisted preference without React hydration", async ({
  page,
}) => {
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, "light"),
    THEME_KEY,
  );
  await page.goto("/offline.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#F6FAF9",
  );
  await expect(page.getByRole("heading", { name: "Você está offline" })).toBeVisible();
});

test("applies persisted light before hydration under network throttling", async ({
  page,
  context,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "one throttled browser run is sufficient");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 450,
    downloadThroughput: 48 * 1024,
    uploadThroughput: 24 * 1024,
  });
  await page.addInitScript(
    (key) => window.localStorage.setItem(key, "light"),
    THEME_KEY,
  );

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(
    page.getByRole("button", { name: "Selecionar tema" }),
  ).toBeVisible();
  const screenshot = await page.screenshot();
  await testInfo.attach("light-before-hydration-throttled", {
    body: screenshot,
    contentType: "image/png",
  });

  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(resolve)),
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
});

test("header selector does not create horizontal overflow on small mobile widths", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await expect(themeButton(page)).toBeVisible();
  const measurements = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.innerWidth);
});
