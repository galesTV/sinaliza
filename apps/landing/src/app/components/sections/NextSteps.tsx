import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const groups = [
  {
    status: "Existe hoje",
    variant: "today",
    items: [
      "Interface da plataforma com trilhas e lições estruturadas",
      "Laboratório experimental de captura e visualização de mãos",
      "Prova de conceito de visão computacional em projeto separado",
    ],
  },
  {
    status: "Em construção",
    variant: "building",
    items: [
      "Conteúdo pedagógico em validação",
      "Exercícios e atividades das trilhas",
      "Contas e acompanhamento de progresso",
    ],
  },
  {
    status: "Visão",
    variant: "vision",
    items: [
      "Prática assistida por visão computacional integrada às lições",
      "Novas trilhas e conteúdo de vocabulário",
      "Experiências cada vez mais acessíveis e interativas",
    ],
  },
];

export function NextSteps() {
  return (
    <section id="futuro" className="nextsteps-section">
      <Reveal className="nextsteps-intro">
        <span className="eyebrow">06 — Próximos passos</span>

        <h2 className="nextsteps-title">
          O que existe, o que vem a seguir{" "}
          <span className="gradient-text">e para onde vamos.</span>
        </h2>
      </Reveal>

      <StaggerGroup className="nextsteps-grid">
        {groups.map((group) => (
          <StaggerItem className="nextsteps-group" key={group.status}>
            <span
              className={`nextsteps-status nextsteps-status--${group.variant}`}
            >
              <span className="nextsteps-status-dot" />
              {group.status}
            </span>

            <ul className="nextsteps-list">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <Reveal>
        <p className="nextsteps-note">
          Esta é a direção de desenvolvimento do projeto. As etapas podem
          evoluir conforme a validação da experiência de aprendizagem —
          incluindo a consulta pedagógica prevista para novembro de 2026.
        </p>
      </Reveal>
    </section>
  );
}
