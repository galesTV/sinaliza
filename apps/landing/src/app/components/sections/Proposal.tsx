import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const pillars = [
  {
    number: "01",
    label: "APRENDER",
    title: "Aprender os fundamentos.",
    description:
      "Conteúdo visual organizado em trilhas e lições, começando pelo alfabeto manual e avançando para o vocabulário básico.",
    detail: "Conteúdo estruturado",
    symbol: "A",
    className: "journey-step-learning",
  },
  {
    number: "02",
    label: "PRATICAR",
    title: "Praticar faz parte.",
    description:
      "Exercícios e atividades contextualizadas, pensados para aproximar o aprendizado da prática cotidiana.",
    detail: "Exercícios guiados",
    symbol: "P",
    className: "journey-step-practice",
  },
  {
    number: "03",
    label: "EVOLUIR",
    title: "Evoluir a cada passo.",
    description:
      "Acompanhamento da jornada para construir conhecimento e confiança na comunicação.",
    detail: "Progresso e continuidade",
    symbol: "E",
    className: "journey-step-evolution",
  },
];

export function Proposal() {
  return (
    <section id="proposta" className="journey-section">
      <Reveal className="journey-heading">
        <span className="eyebrow">02 — A proposta</span>

        <h2 className="journey-title">
          Conhecimento que ganha vida{" "}
          <span className="gradient-text">na prática.</span>
        </h2>

        <p className="journey-description">
          A proposta do Sinaliza organiza o aprendizado de Libras em uma
          jornada única: conteúdo, prática e progresso caminhando juntos.
        </p>
      </Reveal>

      <StaggerGroup className="journey-track">
        {pillars.map((pillar) => (
          <StaggerItem
            className={`journey-step ${pillar.className}`}
            key={pillar.number}
          >
            <div className="journey-step-visual">
              <span className="journey-step-number">{pillar.number}</span>

              <div className="journey-step-symbol" aria-hidden="true">
                <span>{pillar.symbol}</span>
              </div>
            </div>

            <div className="journey-step-content">
              <span className="journey-step-label">{pillar.label}</span>

              <h3>{pillar.title}</h3>

              <p>{pillar.description}</p>

              <span className="journey-step-detail">
                <span className="journey-detail-dot" />
                {pillar.detail}
              </span>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal className="journey-note">
        <span className="journey-note-icon" aria-hidden="true">
          ✳
        </span>

        <p>
          Aprender uma língua também é conhecer sua cultura. A tecnologia pode
          apoiar essa jornada, mas a experiência humana e o contato com a
          comunidade surda são indispensáveis.
        </p>
      </Reveal>

      <Reveal>
        <p className="journey-disclaimer">
          Esta é a proposta de aprendizagem do Sinaliza — uma plataforma de
          ensino, não um tradutor. Os recursos são apresentados conforme seu
          desenvolvimento e validação.
        </p>
      </Reveal>
    </section>
  );
}
