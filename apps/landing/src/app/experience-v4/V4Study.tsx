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
    phase: "A" | "B";
  }
> = {
  "hand-wireframe": {
    name: "Tratamento A — Wireframe puro",
    material: "Malha triangular translúcida, sem preenchimento",
    silhouette: "Mão humana low-poly com 21 landmarks embutidos",
    lede: "A mesma anatomia aparece como topologia pura: triângulos cyan-violeta sobre navy, com landmarks como nós discretos.",
    title: "Wireframe puro",
    accent: "Topologia exposta",
    phase: "B",
  },
  "hand-anatomy": {
    name: "Tratamento B — Anatomia luminosa",
    material: "Superfície translúcida muito restrita + wireframe",
    silhouette: "Volume anatômico com sombreamento seletivo",
    lede: "Uma pele de vidro escuro revela curvatura da palma e dedos enquanto a malha triangular permanece legível.",
    title: "Anatomia luminosa",
    accent: "Superfície translúcida",
    phase: "B",
  },
  "hand-constellation": {
    name: "Tratamento C — Constelação de sinal",
    material: "Wireframe anatômico + grafo de landmarks",
    silhouette: "Nós e arestas MediaPipe integrados à mão",
    lede: "Os 21 landmarks viram uma constelação controlada sobre a anatomia — pulso de luz sutil, sem bloom pesado.",
    title: "Constelação de sinal",
    accent: "Propagação de luz",
    phase: "B",
  },
  a: {
    name: "Conceito A — Corpo do sinal",
    material: "Vidro fumê, resina e luz interna controlada",
    silhouette: "Cápsula vertical com íris/aperture e núcleo âmbar",
    lede: "Uma escultura translúcida guarda a topologia de 21 landmarks do MediaPipe como estrutura interna — referência de visão computacional, não um sinal de Libras.",
    title: "Corpo do sinal",
    accent: "Translúcido orgânico",
    phase: "A",
  },
  b: {
    name: "Conceito B — Estratos do gesto",
    material: "Cerâmica, metal escovado, latão e negativos profundos",
    silhouette: "Coluna segmentada de anéis elípticos com nós físicos",
    lede: "A mesma rede de landmarks vira uma coluna construída: cada ponto é um nó físico, cada conexão um tirante escuro, e a luz raspa as camadas.",
    title: "Gesto em camadas",
    accent: "Material estratificado",
    phase: "A",
  },
};

const PHASE_B_CONCEPTS: ConceptId[] = [
  "hand-wireframe",
  "hand-anatomy",
  "hand-constellation",
];

const PHASE_A_CONCEPTS: ConceptId[] = ["a", "b"];

const SHOTS: Record<ConceptId, string[]> = {
  "hand-wireframe": ["hero", "anatomy", "silhouette"],
  "hand-anatomy": ["hero", "anatomy", "silhouette"],
  "hand-constellation": ["hero", "anatomy", "silhouette"],
  a: ["hero", "low", "aperture", "silhouette"],
  b: ["hero", "low", "strata", "detail"],
};

function normalizeConcept(value?: string): ConceptId | null {
  if (
    value === "a" ||
    value === "b" ||
    value === "hand-wireframe" ||
    value === "hand-anatomy" ||
    value === "hand-constellation"
  ) {
    return value;
  }
  return null;
}

function ConceptActions({ concept }: { concept: ConceptId }) {
  const data = CONCEPTS[concept];
  if (data.phase === "B") {
    return (
      <div className="v4-conceptActions">
        {SHOTS[concept].map((shot) => (
          <Link
            key={shot}
            href={`/experience-v4?concept=${concept}&shot=${shot}&view=study`}
          >
            {shot}
          </Link>
        ))}
      </div>
    );
  }

  return (
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
  );
}

function ConceptCard({ concept }: { concept: ConceptId }) {
  const data = CONCEPTS[concept];
  return (
    <article className="v4-conceptCard" data-concept={concept} data-phase={data.phase}>
      <div className="v4-conceptMeta">
        <span>{data.accent}</span>
        <span>{data.material}</span>
      </div>
      <h2>{data.name}</h2>
      <p>{data.silhouette}</p>
      <p>{data.lede}</p>
      <ConceptActions concept={concept} />
    </article>
  );
}

function IndexView() {
  return (
    <main className="v4-index">
      <header className="v4-indexHeader">
        <p className="v4-eyebrow">Sinaliza · V4 art direction · Phase B</p>
        <h1 className="v4-indexTitle">A mão como escultura</h1>
        <p className="v4-indexLede">
          Estudo isolado em <code>/experience-v4</code>: uma mão humana
          low-poly em malha triangular, com três tratamentos do mesmo modelo
          anatômico. Os conceitos da Phase A permanecem preservados abaixo.
          A experiência atual em <code>/experience</code> não foi alterada.
        </p>
      </header>

      <section className="v4-phaseBlock" aria-label="Phase B hand treatments">
        <div className="v4-phaseHeader">
          <p className="v4-eyebrow">Phase B · wireframe hand</p>
          <h2>Três tratamentos, uma anatomia</h2>
        </div>
        <section className="v4-conceptGrid">
          {PHASE_B_CONCEPTS.map((concept) => (
            <ConceptCard key={concept} concept={concept} />
          ))}
        </section>
        <p className="v4-articulationLink">
          <Link href="/experience-v4/articulation">
            Abrir prova de articulação da mão →
          </Link>
        </p>
      </section>

      <section className="v4-phaseBlock" aria-label="Phase A archive">
        <div className="v4-phaseHeader">
          <p className="v4-eyebrow">Phase A archive</p>
          <h2>Conceitos anteriores preservados</h2>
        </div>
        <section className="v4-conceptGrid">
          {PHASE_A_CONCEPTS.map((concept) => (
            <ConceptCard key={concept} concept={concept} />
          ))}
        </section>
      </section>

      <footer className="v4-indexFooter">
        <span>Exploração visual apenas — sem scroll choreography.</span>
        <span>21 landmarks MediaPipe = referência de CV, não Libras.</span>
        <span>Mão: Godot XR Tools hand · CC0 1.0.</span>
      </footer>
    </main>
  );
}

function HeroCopy({ concept }: { concept: ConceptId }) {
  const data = CONCEPTS[concept];
  const [lineOne, ...rest] = data.title.split(" ");
  const lineTwo = rest.join(" ");
  return (
    <div className="v4-heroCopy" data-concept={concept} data-phase={data.phase}>
      <p className="v4-eyebrow">
        Sinaliza · V4 · Phase {data.phase} · {data.accent}
      </p>
      <h1 className="v4-title">
        {lineOne}
        <br />
        <em>{lineTwo}</em>
      </h1>
      <p className="v4-lede">{data.lede}</p>
      <div className="v4-meta">
        <span>Phase {data.phase} study</span>
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
      <small>camera study · phase {data.phase}</small>
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
