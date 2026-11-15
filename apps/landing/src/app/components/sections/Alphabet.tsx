import { Reveal } from "../ui/Reveal";

export function Alphabet() {
  return (
    <section id="alfabeto" className="alphabet-section">
      <Reveal className="alphabet-intro">
        <span className="eyebrow">04 — Alfabeto manual</span>

        <h2 className="alphabet-title">
          O alfabeto é o{" "}
          <span className="gradient-text">ponto de partida.</span>
        </h2>

        <p className="alphabet-description">
          A primeira trilha do Sinaliza é dedicada ao alfabeto manual de
          Libras, organizada em módulos e lições pensadas para quem está
          começando.
        </p>
      </Reveal>

      <Reveal className="alphabet-catalog" delay={0.08}>
        <div className="placeholder-frame placeholder-frame--wide">
          <span className="placeholder-badge">Catálogo em preparação</span>

          <span className="alphabet-range" aria-hidden="true">
            A — Z
          </span>

          <p>
            O conteúdo do catálogo será apresentado após a validação
            pedagógica do material.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
