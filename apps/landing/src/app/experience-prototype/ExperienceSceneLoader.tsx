"use client";

import dynamic from "next/dynamic";

const ExperienceScene = dynamic(
  () => import("./ExperienceScene").then((m) => m.ExperienceScene),
  { ssr: false },
);

export function ExperienceSceneLoader() {
  return <ExperienceScene />;
}
