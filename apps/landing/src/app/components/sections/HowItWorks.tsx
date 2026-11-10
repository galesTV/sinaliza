const steps = [
  {
    number: "01",
    label: "PRIMEIRO CONTATO",
    title: "Aprender",
    description:
      "Explore os fundamentos da Libras por meio de conteúdos visuais organizados, começando pelo alfabeto e avançando para o vocabulário básico.",
    detail: "Conhecimento e descoberta",
    symbol: "A",
    className: "journey-step-learning",
  },
  {
    number: "02",
    label: "MÃO NA MASSA",
    title: "Praticar",
    description:
      "Desenvolva seu conhecimento com exercícios e atividades contextualizadas, pensados para aproximar o aprendizado da prática cotidiana.",
    detail: "Experimentação e prática",
    symbol: "P",
    className: "journey-step-practice",
  },
  {
    number: "03",
    label: "SEGUIR EM FRENTE",
    title: "Evoluir",
    description:
      "Acompanhe sua jornada de aprendizagem e descubra novas possibilidades para ampliar seu conhecimento e sua confiança na comunicação.",
    detail: "Continuidade e desenvolvimento",
    symbol: "E",
    className: "journey-step-evolution",
  },
];

export function HowItWorks() {
  return (
    <section id="jornada" className="journey-section">
      <div className="journey-heading">
        <span className="eyebrow">03 — A jornada</span>

        <h2 className="journey-title">
          Todo aprendizado começa com um passo.
          <span className="gradient-text"> O próximo é seu.</span>
        </h2>

        <p className="journey-description">
          Uma experiência pensada para acompanhar diferentes momentos do
          aprendizado: do primeiro contato com os sinais à prática e à
          construção de novos conhecimentos.
        </p>
      </div>

      <div className="journey-track">

        {steps.map((step) => (
          <article
            className={`journey-step ${step.className}`}
            key={step.number}
          >
            <div className="journey-step-visual">
              <span className="journey-step-number">{step.number}</span>

              <div className="journey-step-symbol" aria-hidden="true">
                <span>{step.symbol}</span>
              </div>
            </div>

            <div className="journey-step-content">
              <span className="journey-step-label">{step.label}</span>

              <h3>{step.title}</h3>

              <p>{step.description}</p>

              <span className="journey-step-detail">
                <span className="journey-detail-dot" />
                {step.detail}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="journey-note">
        <span className="journey-note-icon" aria-hidden="true">
          ✳
        </span>

        <p>
          Aprender uma língua também é conhecer sua cultura. A tecnologia pode
          apoiar essa jornada, mas a experiência humana e o contato com a
          comunidade surda são indispensáveis.
        </p>
      </div>

      <p className="journey-disclaimer">
        Esta é a jornada de aprendizagem proposta pelo Sinaliza. Os recursos
        serão apresentados conforme seu desenvolvimento.
      </p>
    </section>
  );
}
