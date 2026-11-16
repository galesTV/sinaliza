import type { Metadata } from "next";
import "../V4Study.css";
import { ArticulationLab } from "../ArticulationLab";

export const instant = false;

export const metadata: Metadata = {
  title: "Sinaliza — V4 articulation proof",
  description:
    "Prova isolada de articulação da mão skinned em /experience-v4: neutro, flexão parcial, oposição do polegar e retorno, com pausa e scrub.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePhase(value: string | string[] | undefined) {
  const raw = first(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.min(1, Math.max(0, parsed));
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const phase = parsePhase(params.phase);
  const playing = first(params.playing) !== "0";

  return <ArticulationLab initialPhase={phase} autoplay={playing} />;
}
