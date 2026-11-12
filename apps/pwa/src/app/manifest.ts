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
        src: "/brand/sinaliza-icone-pwa.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
