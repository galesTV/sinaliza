"use client";

import { useEffect, useRef } from "react";

// Registro real do PoC do Sinaliza. Em reduced-motion o vídeo não
// autoplaya: fica no primeiro frame, com controls para o visitante.
export function ProductMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (
      video &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches
    ) {
      void video.play();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      className="xp-product-video"
      src="/videos/sinaliza-poc.mp4"
      muted
      loop
      playsInline
      controls
      preload="metadata"
      disablePictureInPicture
    />
  );
}
