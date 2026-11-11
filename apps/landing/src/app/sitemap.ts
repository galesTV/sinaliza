import type { MetadataRoute } from "next";

const baseUrl = "https://sinaliza-eta.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
