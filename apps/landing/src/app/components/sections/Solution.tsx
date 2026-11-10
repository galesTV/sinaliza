const pillars = [
  {
    number: "01",
    label: "CONHECIMENTO",
    title: "Aprender com significado.",
    description:
      "A ideia é organizar o aprendizado de Libras em conteúdos visuais e acessíveis, começando pelo alfabeto e pelo vocabulário básico.",
    symbol: "A",
    className: "solution-card-learning",
  },
  {
    number: "02",
    label: "EXPERIÊNCIA",
    title: "Praticar faz parte do caminho.",
    description:
      "A proposta é oferecer exercícios e atividades contextualizadas para aproximar o estudante da prática, tornando o aprendizado mais participativo.",
    symbol: "P",
    className: "solution-card-practice",
  },
  {
    number: "03",
    label: "TECNOLOGIA",
    title: "Tecnologia como aliada.",
    description:
      "A pesquisa explora visão computacional e análise de características das mãos como recursos experimentais para apoiar futuras experiências de aprendizagem.",
    symbol: "T",
    className: "solution-card-technology",
  },
];

export function Solution() {
  return (
    <section id="como-funciona" className="solution-section">
      <div className="solution-heading">
        <div>
          <span className="eyebrow">02 — A proposta</span>

          <h2 className="solution-title">
            Conhecimento que ganha vida na{" "}
            <span className="gradient-text">prática.</span>
          </h2>
        </div>

        <p className="solution-description">
          O Sinaliza propõe uma jornada que conecta conteúdo, experiência e
          tecnologia para aproximar mais pessoas da Língua Brasileira de Sinais.
        </p>
      </div>

      <div className="solution-grid">
        {pillars.map((pillar) => (
          <article
            className={`solution-card ${pillar.className}`}
            key={pillar.number}
          >
            <div className="solution-card-top">
              <span className="solution-card-number">{pillar.number}</span>

              <span className="solution-card-symbol" aria-hidden="true">
                {pillar.symbol}
              </span>
            </div>

            <div className="solution-card-content">
              <span className="solution-card-label">{pillar.label}</span>

              <h3>{pillar.title}</h3>

              <p>{pillar.description}</p>
            </div>

            <div className="solution-card-line" />
          </article>
        ))}
      </div>

      <p className="solution-note">
        A tecnologia complementa a experiência de aprendizagem. O contato com a
        língua e com a comunidade surda continua sendo essencial.
      </p>
    </section>
  );
}
