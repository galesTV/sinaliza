"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ConstellationField({ children }: { children: ReactNode }) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const stars = field?.querySelector("svg");
    const formation = stars?.querySelector(".v4c-future-formation");
    if (!field || !stars || !formation || typeof IntersectionObserver === "undefined") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hasViewTimeline = CSS.supports("animation-timeline", "view()");
    let visible = false;

    const syncAmbient = () => {
      if (reducedMotion.matches) {
        delete field.dataset.ambient;
        return;
      }

      if (!visible || document.hidden) {
        if (field.dataset.ambient === "running") field.dataset.ambient = "paused";
        return;
      }

      const { top, height, bottom } = field.getBoundingClientRect();
      const viewportHeight = document.documentElement.clientHeight;
      if (top >= viewportHeight || bottom <= 0) {
        if (field.dataset.ambient === "running") field.dataset.ambient = "paused";
        return;
      }

      // entry 100% is when the field first fits in, or first covers, the scrollport.
      const settle = hasViewTimeline ? formation.getAnimations().find(
        (animation) => animation instanceof CSSAnimation && animation.animationName === "v4c-future-settle",
      ) : undefined;
      const forming = hasViewTimeline && (
        top > Math.max(0, viewportHeight - height) ||
        (settle && settle.effect?.getComputedTiming().progress !== 1)
      );
      const revealing = stars.dataset.v4cRevealState === "pending" ||
        stars.getAnimations().some(({ playState }) => playState === "running" || playState === "paused");

      if (forming || revealing) {
        delete field.dataset.ambient;
      } else if (field.dataset.ambient !== "running") {
        field.dataset.ambient = "running";
      }
    };

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAmbient();
    });
    const size = new ResizeObserver(syncAmbient);
    const reveal = new MutationObserver(syncAmbient);
    intersection.observe(field);
    size.observe(field);
    reveal.observe(stars, { attributes: true, attributeFilter: ["data-v4c-reveal-state"] });
    stars.addEventListener("animationend", syncAmbient);
    stars.addEventListener("animationcancel", syncAmbient);
    window.addEventListener("scroll", syncAmbient, { passive: true });
    window.addEventListener("resize", syncAmbient);
    document.addEventListener("visibilitychange", syncAmbient);
    reducedMotion.addEventListener("change", syncAmbient);

    return () => {
      intersection.disconnect();
      size.disconnect();
      reveal.disconnect();
      stars.removeEventListener("animationend", syncAmbient);
      stars.removeEventListener("animationcancel", syncAmbient);
      window.removeEventListener("scroll", syncAmbient);
      window.removeEventListener("resize", syncAmbient);
      document.removeEventListener("visibilitychange", syncAmbient);
      reducedMotion.removeEventListener("change", syncAmbient);
      delete field.dataset.ambient;
    };
  }, []);

  return <div ref={fieldRef} className="v4c-future-field" aria-hidden="true">{children}</div>;
}
