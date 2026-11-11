"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HandVisualization = dynamic(
  () =>
    import("./HandVisualization").then((module) => module.HandVisualization),
  {
    ssr: false,
    loading: () => (
      <div className="hand-visualization-placeholder" aria-hidden="true" />
    ),
  },
);

export function LazyHandVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px",
      },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="hand-visualization-slot">
      {shouldLoad ? (
        <HandVisualization />
      ) : (
        <div className="hand-visualization-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}
