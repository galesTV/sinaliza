"use client";

import Link from "next/link";
import { ConceptCanvas } from "./ConceptCanvas";
import type { ConceptId } from "./scenes";

const CONCEPTS: Record<
  ConceptId,
  {
    name: string;
    material: string;
    silhouette: string;
    lede: string;
    title: string;
    accent: string;
  }
> = {
  a: {
    name: "Conceito A — Corpo do sinal",
    material: "Vidro fumê, resina e luz interna controlada",
    silhouette: "Cápsula vertical com íris/aperture e núcleo âmbar",
    lede: "Uma escultura translúcida guarda a topologia de 21 landmarks do MediaPipe como estrutura interna — referência de visão computacional, não um sinal de Libras.",
    title: "Corpo do sinal",
    accent: "Translúcido orgânico",
  },
  b: {
    name: "Conceito B — Estratos do gesto",
    material: "Cerâmica, metal escovado, latão e negativos profundos",
    silhouette: "Coluna segmentada de anéis elípticos com nós físicos",
    lede: "A mesma rede de landmarks vira uma coluna construída: cada ponto é um nó físico, cada conexão um tirante escuro, e a luz raspa as camadas.",
    title: "Gesto em camadas",
    accent: "Material estratificado",
  },
};

const SHOTS: Record<ConceptId, string[]> = {
  a: ["hero", "low", "aperture", "silhouette"],
  b: ["hero", "low", "strata", "detail"],
};

function normalizeConcept(value?: string): ConceptId | null {
  if (value === "a" || value === "b") return value;
  return null;
}

function IndexView() {
  return (
    <main className="v4-index">
      <header className="v4-indexHeader">
        <p className="v4-eyebrow">Sinaliza · V4 art direction · Phase A</p>
        <h1 className="v4-indexTitle">
          Dois corpos para o mesmo sinal
        </h1>
        <p className="v4-indexLede">
          Exploração visual isolada em <code>/experience-v4</code>. A experiência
          atual em <code>/experience</code> permanece intacta para comparação.
        </p>
      </header>

      <section className="v4-conceptGrid" aria-label="Conceitos V4">
        {(Object.keys(CONCEPTS) as ConceptId[]).map((concept) => {
          const data = CONCEPTS[concept];
          return (
            <article key={concept} className="v4-conceptCard" data-concept={concept}>
              <div className="v4-conceptMeta">
                <span>{data.accent}</span>
                <span>{data.material}</span>
              </div>
              <h2>{data.name}</h2>
              <p>{data.silhouette}</p>
              <p>{data.lede}</p>
              <div className="v4-conceptActions">
                <Link href={`/experience-v4?concept=${concept}&shot=hero&view=composition`}>
                  Hero composition
                </Link>
                {SHOTS[concept].map((shot) => (
                  <Link
                    key={shot}
                    href={`/experience-v4?concept=${concept}&shot=${shot}&view=study`}
                  >
                    {shot}
                  </Link>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <footer className="v4-indexFooter">
        <span>Fase A apenas — sem implementação do vertical slice.</span>
        <span>21 landmarks MediaPipe = referência de CV, não Libras.</span>
      </footer>
    </main>
  );
}

function HeroCopy({ concept }: { concept: ConceptId }) {
  const data = CONCEPTS[concept];
  const [lineOne, ...rest] = data.title.split(" ");
  const lineTwo = rest.join(" ");
  return (
    <div className="v4-heroCopy" data-concept={concept}>
      <p className="v4-eyebrow">
        Sinaliza · V4 · {concept === "a" ? "conceito A" : "conceito B"}
      </p>
      <h1 className="v4-title">
        {lineOne}
        <br />
        <em>{lineTwo}</em>
      </h1>
      <p className="v4-lede">{data.lede}</p>
      <div className="v4-meta">
        <span>Phase A hero</span>
        <span>21 landmarks · MediaPipe topology</span>
        <span>referência de CV, não sinal</span>
      </div>
    </div>
  );
}

function StudyCaption({ concept, shot }: { concept: ConceptId; shot: string }) {
  const data = CONCEPTS[concept];
  return (
    <div className="v4-studyCaption">
      <strong>{data.name}</strong>
      <span>{shot}</span>
      <small>camera study · fase A</small>
    </div>
  );
}

export function V4Study({
  concept: conceptProp,
  shot: shotProp,
  view: viewProp,
}: {
  concept?: string;
  shot?: string;
  view?: string;
}) {
  const concept = normalizeConcept(conceptProp);
  if (!concept) return <IndexView />;

  const shot = shotProp?.trim() || "hero";
  const view = viewProp === "composition" ? "composition" : "study";

  return (
    <main className="v4-shot" data-v4-view={view}>
      <ConceptCanvas concept={concept} shot={shot} view={view} />
      {view === "composition" ? (
        <HeroCopy concept={concept} />
      ) : (
        <StudyCaption concept={concept} shot={shot} />
      )}
    </main>
  );
}
