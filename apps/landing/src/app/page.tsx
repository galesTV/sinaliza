const colors = [
  {
    name: "Azul profundo",
    hex: "#10172B",
    description: "Fundo principal",
  },
  {
    name: "Violeta",
    hex: "#6957E8",
    description: "Identidade e ação",
  },
  {
    name: "Ciano",
    hex: "#35C9E8",
    description: "Destaques e detalhes",
  },
  {
    name: "Branco gelo",
    hex: "#F4F6FC",
    description: "Texto principal",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <a href="#" className="brand" aria-label="Sinaliza - início">
          <span className="brand-symbol" aria-hidden="true">
            <span>S</span>
          </span>

          <span className="brand-name">sinaliza</span>
        </a>

        <span className="topbar-label">HACKBRASIL 2026</span>
      </header>

      <section className="hero-preview">
        <div>
          <span className="eyebrow">Aprender transforma conexões</span>

          <h1 className="hero-title">
            Um novo jeito de aprender{" "}
            <span className="gradient-text">Libras.</span>
          </h1>

          <p className="hero-description">
            Uma experiência de aprendizagem visual e interativa, criada para
            aproximar pessoas da Língua Brasileira de Sinais e tornar o
            aprendizado mais acessível.
          </p>

          <a href="#identidade" className="hero-action">
            Conheça nossa identidade
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div
          className="visual-panel"
          aria-label="Elemento visual conceitual da identidade Sinaliza"
        >
          <div className="visual-panel-content">
            <span className="visual-panel-label">Comunicação conecta</span>

            <div className="visual-symbol" aria-hidden="true">
              S
            </div>

            <div className="visual-panel-caption">
              <span>Aprender · Praticar · Evoluir</span>

              <span className="visual-indicator">Sinaliza</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section id="identidade">
        <div className="section-heading">
          <span className="eyebrow">01 — Identidade visual</span>

          <h2>Uma identidade com propósito.</h2>

          <p>
            Cores que equilibram tecnologia, confiança, acessibilidade e
            expressividade.
          </p>
        </div>

        <div className="palette-grid">
          {colors.map((color) => (
            <article className="palette-card" key={color.hex}>
              <div
                className="palette-color"
                style={{ backgroundColor: color.hex }}
                aria-label={`Cor ${color.name}`}
              />

              <div className="palette-info">
                <strong>{color.name}</strong>
                <span>{color.hex}</span>
                <span>{color.description}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="section-divider" />

      <section>
        <div className="section-heading">
          <span className="eyebrow">02 — Tipografia</span>

          <h2>Clareza em cada palavra.</h2>

          <p>
            Duas famílias tipográficas com papéis diferentes, trabalhando juntas
            para criar hierarquia visual.
          </p>
        </div>

        <div className="typography-grid">
          <article className="type-card">
            <span className="type-card-label">Sora — Display</span>

            <h3>Aprender é conectar.</h3>

            <p>
              Utilizada em títulos, chamadas e elementos de destaque da
              identidade.
            </p>
          </article>

          <article className="type-card">
            <span className="type-card-label">Inter — Interface</span>

            <p>
              A comunicação começa quando existe espaço para aprender,
              compreender e compartilhar.
            </p>

            <p>
              Utilizada em textos, navegação e elementos funcionais da
              plataforma.
            </p>
          </article>
        </div>
      </section>

      <div className="section-divider" />

      <footer className="preview-footer">
        <span>Sinaliza © 2026</span>
        <span>Uma nova experiência para aprender Libras.</span>
      </footer>
    </main>
  );
}
