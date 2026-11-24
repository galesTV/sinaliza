// Constellation verification — reusable browser checks (no extra deps;
// Playwright is already a devDependency). Run the production server first:
//   npx next start -p 3100
//   node scripts/verify-constellation.mjs
// Env: BASE_URL (default http://localhost:3100), SHOT_DIR (default ../../shots).
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = process.env.SHOT_DIR ?? "/home/ubuntu/shots";
const results = [];
const check = (name, ok, detail = "") =>
  results.push(`${ok ? "PASS" : "FAIL"} ${name} ${detail}`);

const browser = await chromium.launch();
const shot = (page, name) =>
  page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

async function checkViewport(page, label) {
  // Global overflow is reported for information only: a known app-shell
  // header issue (~69px at 768px, present on every page incl. /entrar)
  // is outside the constellation's scope.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  results.push(`INFO ${label}: document overflow ${overflow}px`);

  // The constellation's own section must never overflow.
  const sectionOv = await page.evaluate(() => {
    const section = document.querySelector('section[aria-labelledby="learning-constellation-title"]');
    if (!section) return 0;
    const r = section.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    return Math.max(0, r.right - vw, 0 - r.left);
  });
  check(`${label}: constellation section inside viewport`, sectionOv <= 0, `(${sectionOv}px)`);

  const boxes = await page.locator('svg a[href*="/trilhas/"]').evaluateAll((els) =>
    els.filter((el) => el.checkVisibility()).map((a) => {
      const r = a.getBoundingClientRect();
      return Math.min(r.width, r.height);
    }),
  );
  check(
    `${label}: visible star hit areas >=44px`,
    boxes.length > 0 && boxes.every((v) => v >= 44),
    `(${boxes.length} links, min=${Math.min(...boxes).toFixed(1)}px)`,
  );

  // labels inside their figure (no clipping at the viewBox edges)
  const clipped = await page
    .locator('svg[role="group"][aria-label^="Constelação"]')
    .evaluateAll((svgs) => {
      let bad = 0;
      for (const svg of svgs) {
        if (!svg.checkVisibility()) continue;
        const s = svg.getBoundingClientRect();
        for (const t of svg.querySelectorAll("text")) {
          const r = t.getBoundingClientRect();
          if (r.left < s.left - 1 || r.right > s.right + 1) bad++;
        }
      }
      return bad;
    });
  check(`${label}: no labels clipped at figure edges`, clipped === 0, `(${clipped})`);
}

// ---------- Desktop home ----------
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
let page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });

const groups = page.locator('svg[role="group"][aria-label^="Constelação"]');
check("home desktop: two constellation groups", (await groups.count()) === 2);
await checkViewport(page, "home desktop");

// skip link: invisible until focused, moves focus to sentinel
await page.keyboard.press("Tab");
for (let i = 0; i < 40; i++) {
  const isSkip = await page.evaluate(() =>
    document.activeElement?.textContent?.includes("Pular a constelação"),
  );
  if (isSkip) break;
  await page.keyboard.press("Tab");
}
const skipFocused = await page.evaluate(() =>
  document.activeElement?.textContent?.includes("Pular a constelação"),
);
check("home: skip link reachable by keyboard", skipFocused === true);
if (skipFocused) {
  const skipVisible = await page.evaluate(() =>
    document.activeElement?.checkVisibility(),
  );
  check("home: skip link visible when focused", skipVisible === true);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  const landed = await page.evaluate(() =>
    document.activeElement?.id?.startsWith("constellation-end-"),
  );
  check("home: skip link moves focus past the figure", landed === true);
}

// keyboard: tab to a star, drawn ring visible, no rectangular outline
for (let i = 0; i < 60; i++) {
  const onStar = await page.evaluate(
    () => document.activeElement?.matches?.('svg a[href*="/trilhas/"]'),
  );
  if (onStar) break;
  await page.keyboard.press("Tab");
}
// The ring fades in via CSS transition — poll until it settles instead of
// sampling at a fixed delay (a mid-fade sample flakes below 0.9).
await page
  .waitForFunction(
    () => {
      const a = document.activeElement;
      const ring = a?.querySelector('[class*="opacity-0"]');
      return (
        a?.matches(":focus-visible") &&
        ring &&
        parseFloat(getComputedStyle(ring).opacity) > 0.9
      );
    },
    { timeout: 3000, polling: 100 },
  )
  .catch(() => null);
const focusRing = await page.evaluate(() => {
  const a = document.activeElement;
  if (!a?.matches(":focus-visible")) return { ok: false, why: "no :focus-visible" };
  const outline = getComputedStyle(a).outlineStyle;
  const ring = a.querySelector('[class*="opacity-0"]');
  const opacity = ring ? parseFloat(getComputedStyle(ring).opacity) : 0;
  return {
    ok: opacity > 0.9 && outline === "none",
    why: `outline=${outline} ring=${ring ? opacity : "none"}`,
  };
});
check("home: drawn ring visible, no rectangular outline", focusRing.ok === true, focusRing.why);
await shot(page, "p7h-home-desktop-focus");

// star → module anchor
const firstHref = await page.locator('svg a[href*="/trilhas/"]').first().getAttribute("href");
await page.locator('svg a[href*="/trilhas/"]').first().click();
await page.waitForLoadState("networkidle");
check("home: star navigates to module anchor", page.url().includes("#"), `(${page.url()})`);
const anchorSlug = firstHref.split("#")[1];
const cardBox = await page.locator(`li#${anchorSlug}`).boundingBox();
const vh = page.viewportSize()?.height ?? 0;
check(
  "path: module card visible below header",
  !!cardBox && cardBox.y > 80 && cardBox.y < vh,
  `y=${cardBox?.y?.toFixed(0)} vh=${vh}`,
);
await shot(page, "p7h-path-anchor-landing");
await ctx.close();

// ---------- Home mobile 390 + 320 ----------
for (const w of [390, 320]) {
  ctx = await browser.newContext({ viewport: { width: w, height: 844 } });
  page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await checkViewport(page, `home ${w}`);
  await page.locator('svg[role="group"]:visible').first().scrollIntoViewIfNeeded();
  await shot(page, `p7h-home-mobile-${w}`);
  await ctx.close();
}

// ---------- Path page: desktop (wide figure) + mobile (compact) ----------
ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
page = await ctx.newPage();
await page.goto(BASE + "/trilhas/alfabeto", { waitUntil: "networkidle" });
const wideCount = await page.locator('svg[role="group"].sm\\:block, svg[role="group"][class*="sm:block"]').count();
const visibleFigures = await page.locator('svg[role="group"]').evaluateAll((els) =>
  els.filter((el) => el.checkVisibility()).length,
);
check("path desktop: exactly one figure visible", visibleFigures === 1, `(${visibleFigures}, wide=${wideCount})`);
const stars = await page.locator('svg a[href*="/trilhas/alfabeto#"]').evaluateAll((els) =>
  els.filter((el) => el.checkVisibility()).length,
);
check("path desktop: 6 visible stars", stars === 6, `(${stars})`);
await checkViewport(page, "path desktop");
const noSelfTitle = await page.locator('div.flex.flex-col.gap-2\\.5 > a[href="/trilhas/alfabeto"]').count();
check("path desktop: no redundant self-link title", noSelfTitle === 0);
await page.locator('svg[role="group"]:visible').first().scrollIntoViewIfNeeded();
await shot(page, "p7h-path-desktop");
await ctx.close();

ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
page = await ctx.newPage();
await page.goto(BASE + "/trilhas/alfabeto", { waitUntil: "networkidle" });
await checkViewport(page, "path mobile");
await page.locator('svg[role="group"]:visible').first().scrollIntoViewIfNeeded();
await shot(page, "p7h-path-mobile-390");
await ctx.close();

// ---------- Tablet ----------
ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
page = await ctx.newPage();
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await checkViewport(page, "home tablet(768)");
await page.locator('svg[role="group"]:visible').first().scrollIntoViewIfNeeded();
await shot(page, "p7h-home-tablet");
await ctx.close();

await browser.close();
console.log(results.join("\n"));
const failed = results.some((r) => r.startsWith("FAIL"));
console.log(failed ? "HAS FAILURES" : "ALL PASS");
if (failed) process.exitCode = 1;
