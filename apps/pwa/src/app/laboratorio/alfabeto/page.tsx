import type { Metadata } from "next";
import Link from "next/link";

import {
  ValidationStatusBadge,
} from "@/components/draft-preview";
import { Eyebrow } from "@/components/eyebrow";
import { HonestNote } from "@/components/honest-note";
import { IconArrowRight, IconFlask } from "@/components/icons";
import {
  alphabetSpecimens,
  getSpecimenUrl,
} from "@/data/alphabet-specimens";

export const metadata: Metadata = {
  title: "Laboratório — Curadoria do alfabeto manual",
  description:
    "Espécimes visuais do alfabeto manual de Libras em curadoria: demonstrações ainda não validadas e sem licença de uso confirmada.",
  robots: { index: false, follow: false },
};

export default function AlphabetSpecimensPage() {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="specimens-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="specimens-title"
          className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
        >
          Curadoria do alfabeto manual
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Espécimes visuais das primeiras letras em curadoria — demonstrações
          ainda em produção, aguardando revisão linguística e confirmação de
          licenças.
        </p>

        <HonestNote
          title="O que estas prévias são — e o que não são"
          icon={<IconFlask className="h-5 w-5" />}
        >
          <ul className="flex max-w-2xl flex-col gap-2.5">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Espaço de revisão dos espécimes visuais catalogados para o
              alfabeto manual — cada item mostra seu estado de validação.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não é conteúdo publicado: as lições de letras permanecem como
              planejadas e a navegação aqui não registra progresso.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Mídia só aparece em prévia com evidência de autorização
              registrada; publicação como lição continua exigindo
              validação especializada da versão atual.
            </li>
          </ul>
        </HonestNote>
      </section>

      <ul className="flex flex-col gap-3" aria-label="Espécimes catalogados">
        {alphabetSpecimens.map((specimen) => (
          <li key={specimen.id}>
            <Link
              href={getSpecimenUrl(specimen.letter)}
              className="group flex min-h-11 items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:bg-white/[0.04]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-2.5">
                  <span className="font-display text-base font-semibold text-foreground">
                    {specimen.title}
                  </span>
                  <ValidationStatusBadge status={specimen.validationStatus} />
                </span>
                <span className="text-sm text-muted">
                  {specimen.media
                    ? "Demonstração disponível para revisão."
                    : "Mídia em produção — licença não confirmada."}
                </span>
              </span>
              <IconArrowRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
