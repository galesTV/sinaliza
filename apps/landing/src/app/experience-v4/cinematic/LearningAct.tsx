import Image from "next/image";
import type { ReactNode } from "react";
import "./LearningAct.css";

const shots = {
  dashboard: {
    width: 1620,
    height: 1011,
    mobileHeight: 1700,
    alt: "Tela inicial da PWA no modo convidado, com o primeiro passo pelo alfabeto manual e o acesso às trilhas.",
  },
  modules: {
    width: 1275,
    height: 705,
    mobileHeight: 856,
    alt: "Seção de módulos da trilha de vocabulário. As atividades aparecem com o status Em preparação.",
  },
  lesson: {
    width: 1080,
    height: 760,
    mobileHeight: 1158,
    alt: "Segundo passo da demonstração de lição, com uma pergunta de múltipla escolha sobre como avançar na interface.",
  },
} as const;

function ProductShot({
  shot,
  children,
}: {
  shot: keyof typeof shots;
  children: ReactNode;
}) {
  const { width, height, mobileHeight, alt } = shots[shot];
  const src = `/experience-v4/learning/${shot}`;

  return (
    <figure className="v4c-learning-figure">
      <picture className="v4c-learning-screen">
        <source
          media="(max-width: 599px)"
          srcSet={`${src}-mobile.webp`}
          width={780}
          height={mobileHeight}
        />
        <Image
          src={`${src}.webp`}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          unoptimized
        />
      </picture>
      <figcaption className="v4c-learning-caption">{children}</figcaption>
    </figure>
  );
}

export function LearningAct() {
  return (
    <section className="v4c-learning" aria-labelledby="v4c-act3-title">
      <div className="v4c-learning-inner">
        <article className="v4c-learning-dashboard">
          <header className="v4c-learning-opening">
            <div>
              <p className="v4c-eyebrow">Ato 3 · O Aprendizado</p>
              <h2 id="v4c-act3-title" className="v4c-learning-title">
                Seu aprendizado <span>começa aqui.</span>
              </h2>
            </div>
            <p className="v4c-learning-copy">
              Na tela inicial do Sinaliza, você encontra por onde começar:
              pelo alfabeto manual ou explorando as trilhas.
            </p>
          </header>
          <ProductShot shot="dashboard">Início da PWA · Modo convidado</ProductShot>
        </article>

        <article className="v4c-learning-moment v4c-learning-modules">
          <header className="v4c-learning-intro">
            <p className="v4c-eyebrow">Trilhas e módulos</p>
            <h3 className="v4c-learning-heading">Um caminho para aprender.</h3>
            <p className="v4c-learning-copy">
              Cada trilha organiza um tema em módulos. Na de vocabulário, por
              exemplo, o percurso começa com saudações e apresentações. As
              lições mostradas ainda estão em preparação.
            </p>
          </header>
          <ProductShot shot="modules">Trilha de vocabulário · Módulos em preparação</ProductShot>
        </article>

        <article className="v4c-learning-moment v4c-learning-lesson">
          <header className="v4c-learning-intro">
            <p className="v4c-eyebrow">Demonstração de lição</p>
            <h3 className="v4c-learning-heading">Aprenda no seu ritmo.</h3>
            <p className="v4c-learning-copy">
              A demonstração alterna explicações e perguntas de múltipla
              escolha, com retorno após a resposta e espaço para tentar de novo.
              É uma prévia experimental da interface, sem conteúdo de Libras.
            </p>
          </header>
          <ProductShot shot="lesson">Interface experimental · Exercício de demonstração</ProductShot>
        </article>

        <p className="v4c-learning-bridge">
          <span className="v4c-bridgeLabel">A seguir</span>
          <span className="v4c-learning-bridgeTitle">A Prática</span>
          <span className="v4c-bridgeRule" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
