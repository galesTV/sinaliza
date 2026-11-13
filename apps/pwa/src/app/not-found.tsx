import Link from "next/link";

import { Eyebrow } from "@/components/eyebrow";

export default function NotFound() {
  return (
    <div className="flex min-h-[50dvh] flex-col items-start justify-center gap-5">
      <Eyebrow>Erro 404</Eyebrow>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Página não encontrada
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-[11px] border border-primary/35 bg-primary/10 px-5 text-sm font-semibold text-primary-soft transition-colors duration-200 hover:border-primary/60"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
