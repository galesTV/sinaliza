import type { Metadata } from "next";
import "./V4Study.css";
import { V4Study } from "./V4Study";

export const instant = false;

export const metadata: Metadata = {
  title: "Sinaliza — V4 art direction study",
  description:
    "Estudo isolado de direção de arte para a experiência Sinaliza: dois conceitos de escultura do sinal, sem alterar a experiência atual.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};

  return (
    <V4Study
      concept={first(params.concept)}
      shot={first(params.shot)}
      view={first(params.view)}
    />
  );
}
