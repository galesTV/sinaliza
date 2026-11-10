import { LazyHandVisualization } from "../ui/LazyHandVisualization";
import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const stages = [
  {
    number: "01",
    title: "Captura",
    description:
      "A câmera registra a mão e permite identificar sua presença no campo de visão.",
    tag: "Entrada visual",
  },
  {
    number: "02",
    title: "Representação",
    description:
      "Pontos de referência representam posições da mão, permitindo observar relações geométricas.",
    tag: "Landmarks",
  },
  {
    number: "03",
    title: "Análise",
    description:
      "Características selecionadas podem ser extraídas para apoiar exercícios e experimentos de aprendizagem.",
    tag: "Dados geométricos",
  },
];

export function Technology() {
  return (
    <section id="tecnologia" className="technology-section">
      <div className="technology-intro">
        <Reveal className="technology-copy">
          <span className="eyebrow">04 — Tecnologia aplicada</span>

          <h2 className="technology-title">
            Transformando movimentos em
            <span className="gradient-text"> possibilidades.</span>
          </h2>

          <p className="technology-description">
            O Sinaliza explora a visão computacional como ferramenta de apoio à
            aprendizagem. A partir da câmera, é possível identificar pontos de
            referência das mãos e estudar suas características geométricas.
          </p>

          <p className="technology-description technology-secondary">
            A proposta é aproximar tecnologia e educação sem perder de vista o
            que realmente importa: aprender uma língua e ampliar conexões.
          </p>

          <span className="technology-status">
            <span className="technology-status-dot" />
            Pesquisa e desenvolvimento em andamento
          </span>
        </Reveal>

        <Reveal className="technology-visual" delay={0.12}>
          <div className="technology-visual-glow" aria-hidden="true" />
          <LazyHandVisualization />
          <span className="technology-visual-caption">
            REPRESENTAÇÃO VISUAL CONCEITUAL
          </span>
        </Reveal>
      </div>

      <div className="technology-process">
        <Reveal className="technology-process-heading">
          <span className="eyebrow">DA IMAGEM À INFORMAÇÃO</span>
          <h3>O que acontece por trás da câmera?</h3>
        </Reveal>

        <StaggerGroup className="technology-stages">
          {stages.map((stage) => (
            <StaggerItem className="technology-stage" key={stage.number}>
              <span className="technology-stage-number">{stage.number}</span>
              <span className="technology-stage-tag">{stage.tag}</span>
              <h4>{stage.title}</h4>
              <p>{stage.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>

      <div id="demonstracao" className="technology-demo">
        <Reveal className="technology-demo-heading">
          <div>
            <span className="eyebrow">05 — Demonstração técnica</span>
            <h3>Da teoria para a prática.</h3>
          </div>

          <span className="technology-demo-badge">
            <span className="technology-status-dot" />
            Registro real em preparação
          </span>
        </Reveal>

        <Reveal className="technology-video-placeholder">
          <div className="technology-video-content">
            <div className="technology-video-icon" aria-hidden="true">
              <span>▶</span>
            </div>

            <h4>Uma demonstração real está a caminho.</h4>

            <p>
              Este espaço será preenchido com uma gravação da prova de conceito,
              mostrando a captura da mão e a identificação dos landmarks em
              tempo real.
            </p>
          </div>

          <span className="technology-video-ratio">16:9</span>
        </Reveal>

        <Reveal>
          <p className="technology-disclaimer">
            A visualização 3D é ilustrativa. Atualmente, a prova de conceito
            funciona como um experimento técnico independente, desenvolvido em
            Python com MediaPipe e OpenCV. Ela permite detectar mãos,
            identificar landmarks e extrair características geométricas. Esses
            recursos ainda não estão integrados à plataforma e servem como base
            para investigar futuras aplicações na aprendizagem de Libras. O
            reconhecimento completo de sinais ainda não está implementado.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
