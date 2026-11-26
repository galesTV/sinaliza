import { expect, type Page } from "@playwright/test";

/**
 * The focused element must be inside the document viewport and clear of the
 * sticky header and the fixed bottom navigation that can otherwise cover it.
 */
export async function expectActiveElementClearOfFixedChrome(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const element = document.activeElement;
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const topBoundary =
          document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
        const bottomBoundary = Array.from(
          document.querySelectorAll('nav[aria-label="Navegação principal"]'),
        ).reduce((boundary, nav) => {
          const style = window.getComputedStyle(nav);
          if (style.position !== "fixed" || style.display === "none") {
            return boundary;
          }
          const navRect = nav.getBoundingClientRect();
          if (navRect.bottom < window.innerHeight) return boundary;
          return Math.min(boundary, navRect.top);
        }, window.innerHeight);

        return rect.top >= topBoundary && rect.bottom <= bottomBoundary;
      }),
    )
    .toBe(true);
}
