import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExperienceSceneLoader } from "./ExperienceSceneLoader";

export const metadata: Metadata = {
  title: "Experiência Sinaliza — O gesto",
  description:
    "Experiência isolada do Ato 1 da nova direção criativa do Sinaliza: a topologia de 21 landmarks do MediaPipe converge em escala monumental sob tipografia editorial.",
  robots: { index: false, follow: false },
};

export default function ExperiencePrototype() {
  return (
    <>
      <a href="#xp-copy-01" className="xp-skip">
        Ir para o conteúdo
      </a>

      <div className="xp-stage" data-xp-stage>
        <div className="xp-sticky">
          <ExperienceSceneLoader />

          <header className="xp-header">
            <span className="xp-brand">Sinaliza</span>
            <span className="xp-brand-tag">ato 01 · o gesto</span>
          </header>

          <main className="xp-copy">
            <section className="xp-copy-block xp-copy-01" id="xp-copy-01">
              <p className="xp-eyebrow">
                <span className="xp-state-index">01</span>Ato um — O gesto
              </p>
              <h1 className="xp-title xp-title-01">
                Toda comunicação
                <br />
                começa com um{" "}
                <span className="gradient-text">
                  gesto<span className="xp-period">.</span>
                </span>
              </h1>
              <p className="xp-lead">
                Antes das palavras, há o movimento. O Sinaliza nasce dessa
                ideia: tornar o aprendizado de Libras uma experiência visual e
                acessível.
              </p>
              <p className="xp-caption">
                Estrutura abstrata inspirada na topologia de 21 pontos do
                MediaPipe — referência tecnológica, não um sinal de Libras.
              </p>
            </section>

            <section className="xp-copy-block xp-copy-02">
              <p className="xp-eyebrow">
                <span className="xp-state-index">02</span>A conexão
              </p>
              <h2 className="xp-title xp-title-02">
                O gesto cria conexões.{" "}
                <span className="gradient-text">
                  As conexões constroem aprendizado.
                </span>
              </h2>
              <p className="xp-lead">
                Cada ponto que se conecta é um passo na jornada — da observação
                à prática, da prática ao domínio da língua.
              </p>
            </section>

            <section className="xp-copy-block xp-copy-03">
              <p className="xp-eyebrow">
                <span className="xp-state-index">03</span>O aprendizado
              </p>
              <h2 className="xp-title xp-title-03">
                O aprendizado acontece na{" "}
                <span className="gradient-text">prática.</span>
              </h2>
              <p className="xp-lead">
                O Sinaliza acompanha a mão real, no espaço real — tecnologia a
                serviço da língua de sinais.
              </p>
              <p className="xp-caption">
                Interface real do PWA do Sinaliza — plataforma de
                aprendizado de Libras, não um tradutor de sinais.
              </p>
            </section>
            <figure className="xp-product">
              <div className="xp-product-frame xp-product-main">
                <Image
                  src="/experience/pwa-home.webp"
                  alt="Tela inicial do PWA Sinaliza: jornada em Libras com trilhas de aprendizagem"
                  width={1280}
                  height={800}
                />
                <span className="xp-product-tag">
                  <i>01</i>Início — sua jornada
                </span>
              </div>
              <div className="xp-product-frame xp-product-a">
                <Image
                  src="/experience/pwa-trilhas.webp"
                  alt="Trilhas de aprendizagem do Sinaliza: alfabeto manual e vocabulário básico"
                  width={1280}
                  height={800}
                />
                <span className="xp-product-tag">
                  <i>02</i>Trilhas de aprendizagem
                </span>
              </div>
              <div className="xp-product-frame xp-product-b">
                <Image
                  src="/experience/pwa-alfabeto.webp"
                  alt="Trilha Alfabeto manual: módulos com as 26 configurações de mão"
                  width={1280}
                  height={800}
                />
                <span className="xp-product-tag">
                  <i>03</i>Alfabeto manual
                </span>
              </div>
              <figcaption className="xp-product-caption">
                Capturas reais do PWA em produção local — rotas /, /trilhas
                e /trilhas/alfabeto.
              </figcaption>
            </figure>
          </main>

          <p className="xp-scroll-hint">
            <span className="xp-scroll-hint-line" />
            Role para continuar
          </p>
        </div>
      </div>

      <footer className="xp-footer">
        <p>
          Protótipo isolado do hero — a landing atual permanece intacta.
        </p>
        <Link href="/" className="hero-secondary-button">
          Voltar para a página inicial
        </Link>
      </footer>
    </>
  );
}
