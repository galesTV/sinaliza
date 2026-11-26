"use client";

import { useEffect, useRef, type ReactNode } from "react";
import "./CinematicReveals.css";

export function CinematicReveals({ children }: { children: ReactNode }) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (
      !main ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const candidates = main.querySelectorAll("[data-v4c-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (entry.target.hasAttribute("data-v4c-reveal-state")) {
            entry.target.setAttribute("data-v4c-reveal-state", "playing");
          }
        }
      },
      { rootMargin: "0px 0px -28px" },
    );

    // Preserve content already on screen after the hero lays out or restores a fragment.
    const frame = requestAnimationFrame(() => {
      const viewportHeight = document.documentElement.clientHeight;
      const upcoming = Array.from(candidates).filter(
        (element) =>
          !element.matches(":focus-within") &&
          element.getBoundingClientRect().top >= viewportHeight,
      );
      for (const element of upcoming) {
        element.setAttribute("data-v4c-reveal-state", "pending");
        observer.observe(element);
      }
    });

    const settleFocusedReveal = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest("[data-v4c-reveal-state]");
      if (!element) return;
      observer.unobserve(element);
      element.removeAttribute("data-v4c-reveal-state");
    };
    main.addEventListener("focusin", settleFocusedReveal);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      main.removeEventListener("focusin", settleFocusedReveal);
      for (const element of candidates) element.removeAttribute("data-v4c-reveal-state");
    };
  }, []);

  return <main ref={mainRef} className="v4c-page">{children}</main>;
}
