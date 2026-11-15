import { Reveal } from "../ui/Reveal";
import { SpecimenGrid } from "../ui/SpecimenGrid";

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
        <SpecimenGrid />

        <p className="alphabet-catalog-note">
          As demonstrações visuais de cada letra estão em preparação e
          passarão por validação pedagógica antes de serem publicadas.
        </p>
      </Reveal>
    </section>
  );
}
