import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ExperienceSceneLoader } from "./ExperienceSceneLoader";
import { ProductMedia } from "./ProductMedia";

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
                Aprender Libras é uma{" "}
                <span className="gradient-text">jornada.</span>
              </h2>
              <p className="xp-lead">
                Explore trilhas organizadas em módulos curtos, no seu próprio
                ritmo. O conteúdo de cada lição está em preparação.
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

            <section className="xp-copy-block xp-copy-04">
              <p className="xp-eyebrow">
                <span className="xp-state-index">04</span>A prática
              </p>
              <h2 className="xp-title xp-title-04">
                O gesto,{" "}
                <span className="gradient-text">observado em tempo real.</span>
              </h2>
              <p className="xp-lead">
                Um protótipo experimental em Python rastreia 21 pontos da mão
                por segundo e classifica configurações estáticas treinadas —
                instrumento de pesquisa, separado do PWA.
              </p>
              <p className="xp-caption">
                Não reconhece Libras, não traduz sinais, não avalia fluência —
                registro real do laboratório de visão computacional.
              </p>
            </section>

            <figure className="xp-lab">
              <div className="xp-lab-frame">
                <ProductMedia />
                <span className="xp-product-tag xp-lab-tag-1">
                  <i>01</i>21 landmarks por mão
                </span>
                <span className="xp-product-tag xp-lab-tag-2">
                  <i>02</i>Classificação por amostras
                </span>
                <span className="xp-product-tag xp-lab-tag-3">
                  <i>03</i>Experimental — fora do PWA
                </span>
              </div>
              <figcaption className="xp-product-caption xp-lab-caption">
                Protótipo independente de visão computacional — Python,
                OpenCV e MediaPipe.
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
