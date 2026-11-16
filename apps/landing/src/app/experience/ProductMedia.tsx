"use client";

import { useEffect, useRef } from "react";

// Registro real do PoC de visão computacional (Python + MediaPipe).
// Lazy: com preload="none" o navegador não baixa o mp4 até o Ato 4;
// o poster mantém o quadro preenchido. O autoplay só dispara quando o
// usuário de fato chega ao ato — e nunca em reduced-motion (controls).
export function ProductMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const stage = document.querySelector<HTMLElement>("[data-xp-stage]");
    if (!video || !stage) return;

    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;

    const onScroll = () => {
      const rect = stage.getBoundingClientRect();
      const p = -rect.top / Math.max(1, rect.height - window.innerHeight);
      if (p > 0.8) {
        if (motionOk && video.paused) void video.play();
      } else if (!video.paused) {
        video.pause();
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <video
      ref={videoRef}
      className="xp-lab-video"
      src="/videos/sinaliza-poc.mp4"
      poster="/experience/poc-poster.webp"
      muted
      loop
      playsInline
      controls
      preload="none"
      disablePictureInPicture
    />
  );
}
