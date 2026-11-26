"use client";

import { useEffect, useRef, type ReactNode } from "react";

const START_VISIBILITY = 0.9;

export function ConstellationField({ children }: { children: ReactNode }) {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    const stars = field?.querySelector("svg");
    const thread = stars?.querySelector(".v4c-future-thread");
    if (
      !field || !stars || !thread ||
      typeof IntersectionObserver === "undefined" ||
      typeof ResizeObserver === "undefined" ||
      typeof MutationObserver === "undefined" ||
      typeof stars.getAnimations !== "function"
    ) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersecting = false;

    const clearMotion = () => {
      delete field.dataset.formation;
      delete field.dataset.ambient;
    };

    const pauseMotion = () => {
      if (field.dataset.formation === "running") field.dataset.formation = "paused";
      if (field.dataset.ambient === "running") field.dataset.ambient = "paused";
    };

    const syncMotion = () => {
      if (reducedMotion.matches) {
        clearMotion();
        return;
      }

      field.dataset.formation ??= "waiting";
      const phase = field.dataset.formation;
      if (document.hidden) {
        pauseMotion();
        return;
      }
      if (!intersecting && phase === "waiting") return;

      const { top, height, bottom } = stars.getBoundingClientRect();
      const viewportHeight = document.documentElement.clientHeight;
      // Rearm only after the artwork is well below the viewport, back toward Act 4.
      if (top >= viewportHeight + Math.min(180, height * 0.45)) {
        field.dataset.formation = "waiting";
        delete field.dataset.ambient;
        return;
      }
      if (!intersecting || top >= viewportHeight || bottom <= 0) {
        pauseMotion();
        return;
      }

      if (phase === "complete") {
        if (field.dataset.ambient !== "running") field.dataset.ambient = "running";
        return;
      }
      if (phase === "waiting") {
        const visibleHeight = Math.min(bottom, viewportHeight) - Math.max(top, 0);
        const sufficientlyVisible = visibleHeight >= Math.min(height, viewportHeight) * START_VISIBILITY;
        const revealing = stars.dataset.v4cRevealState === "pending" ||
          stars.getAnimations().some(({ playState }) => playState === "running" || playState === "paused");
        if (!sufficientlyVisible || revealing) return;
      }

      if (phase !== "running") field.dataset.formation = "running";
    };

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target === thread && event.animationName === "v4c-future-connect" &&
          (field.dataset.formation === "running" || field.dataset.formation === "paused")) {
        field.dataset.formation = "complete";
        syncMotion();
      } else if (event.target === stars) {
        syncMotion();
      }
    };
    const onAnimationCancel = (event: AnimationEvent) => {
      if (event.target === stars) syncMotion();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      syncMotion();
    }, { threshold: [0, START_VISIBILITY] });
    const size = new ResizeObserver(syncMotion);
    const reveal = new MutationObserver(syncMotion);

    intersection.observe(stars);
    size.observe(stars);
    reveal.observe(stars, { attributes: true, attributeFilter: ["data-v4c-reveal-state"] });
    stars.addEventListener("animationend", onAnimationEnd);
    stars.addEventListener("animationcancel", onAnimationCancel);
    window.addEventListener("scroll", syncMotion, { passive: true });
    window.addEventListener("resize", syncMotion);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);
    syncMotion();

    return () => {
      intersection.disconnect();
      size.disconnect();
      reveal.disconnect();
      stars.removeEventListener("animationend", onAnimationEnd);
      stars.removeEventListener("animationcancel", onAnimationCancel);
      window.removeEventListener("scroll", syncMotion);
      window.removeEventListener("resize", syncMotion);
      document.removeEventListener("visibilitychange", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
      clearMotion();
    };
  }, []);

  return <div ref={fieldRef} className="v4c-future-field" aria-hidden="true">{children}</div>;
}
