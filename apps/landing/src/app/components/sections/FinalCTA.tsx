import { Reveal } from "../ui/Reveal";

export function FinalCTA() {
  return (
    <section
      id="encerramento"
      className="final-cta-section"
      aria-labelledby="final-cta-title"
    >
      <div className="final-cta-container">
        <div className="final-cta-glow" aria-hidden="true" />

        <Reveal className="final-cta-content" duration={0.65} distance={16}>
          <span className="eyebrow">07 — O próximo passo</span>

          <h2 id="final-cta-title" className="final-cta-title">
            Aprender Libras é ampliar{" "}
            <span className="gradient-text">possibilidades de conexão.</span>
          </h2>

          <p className="final-cta-description">
            Estamos construindo uma nova experiência de aprendizagem,
            aproximando educação, tecnologia e comunicação.
          </p>

          <div className="final-cta-actions">
            <a
              href="https://github.com/galesTV/sinaliza"
              target="_blank"
              rel="noopener noreferrer"
              className="final-cta-primary"
            >
              Conheça o projeto no GitHub
              <span aria-hidden="true">↗</span>
            </a>

            <a href="#tecnologia" className="final-cta-secondary">
              Explore a tecnologia
              <span aria-hidden="true" className="final-cta-arrow">
                ↓
              </span>
            </a>
          </div>

          <span className="final-cta-note">
            Sinaliza — um projeto em construção.
          </span>
        </Reveal>
      </div>
    </section>
  );
}
