import type { Metadata } from "next";

import { ExploreHome } from "@/components/cultural/explore-home";
import { getPublicCulturalEntries } from "@/data/cultural-public";

export const metadata: Metadata = {
  title: "Explorar cultura",
  description:
    "Descoberta cultural do Sinaliza: história, curiosidades, personalidades e biblioteca cultural relacionadas ao universo da Libras.",
};

export default function ExplorePage() {
  return <ExploreHome entries={getPublicCulturalEntries()} />;
}
