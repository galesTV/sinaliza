import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const milestones = [
  {
    number: "01",
    eyebrow: "O ponto de partida",
    title: "Fundamentos",
    description:
      "Construir uma base acessível para quem está começando a aprender Libras, com alfabeto e vocabulário básico.",
    status: "Escopo definido",
    statusType: "planned",
  },
  {
    number: "02",
    eyebrow: "Uma jornada de aprendizagem",
    title: "Aprendizagem",
    description:
      "Desenvolver aulas estruturadas, exercícios contextualizados e atividades que conectem conhecimento e prática.",
    status: "Planejado",
    statusType: "planned",
  },
  {
    number: "03",
    eyebrow: "Experimentação tecnológica",
    title: "Pesquisa em visão computacional",
    description:
      "Investigação de captura por câmera, detecção de mãos, landmarks e características geométricas como base para futuras experiências de prática.",
    status: "PoC independente existente",
    statusType: "prototype",
  },
  {
    number: "04",
    eyebrow: "O que vem depois",
    title: "Expansão",
    description:
      "Ampliar o conteúdo, acompanhar a evolução dos estudantes e explorar novas possibilidades de aprendizagem.",
    status: "Visão futura",
    statusType: "future",
  },
];

export function Roadmap() {
  return (
    <section id="futuro" className="roadmap-section">
      <div className="roadmap-container">
        <Reveal className="roadmap-heading">
          <span className="eyebrow">06 — O futuro do Sinaliza</span>

          <h2 className="roadmap-title">
            Estamos construindo{" "}
            <span className="gradient-text">novas formas de aprender.</span>
          </h2>

          <p className="roadmap-description">
            O Sinaliza começa com o essencial, mas nasce com uma visão maior:
            tornar o aprendizado de Libras cada vez mais acessível, interativo e
            conectado à experiência de quem aprende.
          </p>
        </Reveal>

        <StaggerGroup className="roadmap-list" as="ol" staggerDelay={0.14}>
          {milestones.map((milestone) => (
            <StaggerItem
              className="roadmap-item"
              key={milestone.number}
              as="li"
              duration={0.55}
            >
              <div className="roadmap-marker" aria-hidden="true">
                <span>{milestone.number}</span>
              </div>

              <article className="roadmap-card">
                <span className="roadmap-eyebrow">{milestone.eyebrow}</span>

                <h3>{milestone.title}</h3>

                <p>{milestone.description}</p>

                <span
                  className={`roadmap-status roadmap-status--${milestone.statusType}`}
                >
                  <span className="roadmap-status-dot" />
                  {milestone.status}
                </span>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal>
          <p className="roadmap-note">
            O roadmap representa a direção de desenvolvimento do projeto. As
            etapas e funcionalidades poderão evoluir conforme a validação da
            experiência de aprendizagem. Já existe uma prova de conceito
            independente que experimenta a detecção de mãos, a identificação de
            landmarks e a extração de características geométricas. A integração
            desses recursos à experiência de aprendizagem ainda está em
            desenvolvimento.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
