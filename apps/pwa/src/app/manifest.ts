import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sinaliza",
    short_name: "Sinaliza",
    description:
      "Plataforma de aprendizagem de Língua Brasileira de Sinais (Libras).",
    lang: "pt-BR",
    start_url: "/",
    display: "standalone",
    background_color: "#10172b",
    theme_color: "#10172b",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/brand/sinaliza-icone-pwa.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
