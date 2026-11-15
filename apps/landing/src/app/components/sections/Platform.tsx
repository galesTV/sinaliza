import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const facts = [
  {
    title: "Trilhas de aprendizagem",
    description:
      "O alfabeto manual é a primeira trilha, organizada em módulos e lições estruturadas.",
  },
  {
    title: "Laboratório experimental",
    description:
      "Captura e visualização de mãos no navegador, em desenvolvimento ativo.",
  },
  {
    title: "Painel do estudante",
    description:
      "Acompanhamento da jornada e indicadores de progresso em evolução.",
  },
];

export function Platform() {
  return (
    <section id="plataforma" className="platform-section">
      <Reveal className="platform-intro">
        <span className="eyebrow">03 — A plataforma</span>

        <h2 className="platform-title">
          O produto já existe —{" "}
          <span className="gradient-text">e está crescendo.</span>
        </h2>

        <p className="platform-description">
          O Sinaliza já tem uma base funcional em desenvolvimento: trilhas de
          aprendizagem, lições estruturadas e um laboratório experimental de
          captura de mãos.
        </p>
      </Reveal>

      <div className="platform-grid">
        <Reveal className="platform-evidence" delay={0.08}>
          <div className="placeholder-frame">
            <span className="placeholder-badge">Evidências do produto</span>

            <p>
              Capturas da plataforma serão apresentadas aqui, direto do
              aplicativo em desenvolvimento.
            </p>
          </div>
        </Reveal>

        <StaggerGroup className="platform-facts" as="ol">
          {facts.map((fact) => (
            <StaggerItem className="platform-fact" key={fact.title} as="li">
              <strong>{fact.title}</strong>
              <span>{fact.description}</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
