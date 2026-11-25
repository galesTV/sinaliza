import Image from "next/image";
import "./PracticeAct.css";

export const PRACTICE_CANVAS_ID = "v4c-practice-canvas";

export function PracticeAct() {
  return (
    <section className="v4c-practice" aria-labelledby="v4c-act4-title">
      <div className="v4c-practice-inner">
        <div className="v4c-practice-opening">
          <header>
            <p className="v4c-eyebrow" data-v4c-reveal="eyebrow">Ato 4 · A Prática</p>
            <h2 id="v4c-act4-title" className="v4c-practice-title" data-v4c-reveal="title">
              Aprender também é <span>praticar.</span>
            </h2>
            <p className="v4c-practice-copy" data-v4c-reveal="copy">
              Explore movimentos e configurações da mão com auxílio da tecnologia.
            </p>
          </header>
          <figure className="v4c-practice-model">
            <div id={PRACTICE_CANVAS_ID} className="v4c-practice-visual" aria-hidden="true">
              <Image
                src="/experience-v4/cinematic-poster.webp"
                alt=""
                width={487}
                height={520}
                loading="lazy"
                unoptimized
              />
            </div>
            <figcaption className="v4c-practice-key">
              <span aria-hidden="true" data-v4c-reveal="landmarks">21</span>
              <p data-v4c-reveal="copy">
                <strong>21 pontos de referência</strong>
                <br />
                São referências geométricas da mão, não sinais de Libras.
              </p>
              <span className="v4c-srOnly">
                Na representação tridimensional, os pontos se distribuem do
                punho às pontas dos dedos, conectados por linhas que acompanham
                cada dedo, como na topologia usada pela visão computacional.
              </span>
            </figcaption>
          </figure>
        </div>

        <div className="v4c-practice-lab">
          <header>
            <p className="v4c-eyebrow" data-v4c-reveal="eyebrow">Experimentação</p>
            <h3 className="v4c-practice-heading" data-v4c-reveal="title">Observe. Experimente. Pratique.</h3>
            <p className="v4c-practice-copy" data-v4c-reveal="copy">
              O laboratório experimental permite acompanhar pontos de referência
              da mão em tempo real e explorar como a visão computacional pode
              apoiar experiências de aprendizagem.
            </p>
          </header>
          <figure className="v4c-practice-evidence">
            <picture data-v4c-reveal="screen">
              <source
                media="(max-width: 599px)"
                srcSet="/experience-v4/practice/lab-mobile.webp"
                width={700}
                height={936}
              />
              <Image
                src="/experience-v4/practice/lab.webp"
                alt="Prévia da câmera no laboratório da PWA, com a câmera desligada e os botões de controle visíveis."
                width={1634}
                height={1178}
                loading="lazy"
                unoptimized
              />
            </picture>
            <figcaption data-v4c-reveal="caption">Laboratório de mãos · Recurso experimental.</figcaption>
          </figure>
        </div>

        <div className="v4c-practice-close">
          <h3 className="v4c-practice-heading" data-v4c-reveal="title">Tecnologia como apoio.</h3>
          <p className="v4c-practice-copy" data-v4c-reveal="copy">
            O rastreamento experimental de mãos não reconhece nem avalia a
            fluência em Libras. A tecnologia é um recurso complementar à
            aprendizagem.
          </p>
        </div>

        <p className="v4c-practice-bridge">
          <span className="v4c-bridgeLabel" data-v4c-reveal="eyebrow">A seguir</span>
          <span className="v4c-bridgeTitle" data-v4c-reveal="title">O Futuro</span>
          <span className="v4c-bridgeRule" data-v4c-reveal="rule" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
