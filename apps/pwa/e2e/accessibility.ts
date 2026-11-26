import { expect, type Page } from "@playwright/test";

/**
 * The focused element must be inside the document viewport and clear of the
 * sticky header and the fixed bottom navigation that can otherwise cover it.
 */
export async function expectActiveElementClearOfFixedChrome(
  page: Page,
  focusBoxSelector?: string,
) {
  await expect
    .poll(() =>
      page.evaluate((selector) => {
        const element = document.activeElement;
        if (!element) return false;
        const focusBox = selector
          ? element.querySelector(selector)
          : element;
        if (!focusBox) return false;

        const rect = focusBox.getBoundingClientRect();
        const style = window.getComputedStyle(focusBox);
        const outlineWidth = parseFloat(style.outlineWidth) || 0;
        const outlineOffset = parseFloat(style.outlineOffset) || 0;
        const outlineAllowance =
          style.outlineStyle === "none"
            ? 0
            : Math.max(0, outlineWidth + outlineOffset);
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

        return (
          rect.top - outlineAllowance >= topBoundary &&
          rect.bottom + outlineAllowance <= bottomBoundary
        );
      }, focusBoxSelector),
    )
    .toBe(true);
}
