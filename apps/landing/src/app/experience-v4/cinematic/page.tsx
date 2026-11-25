import type { Metadata } from "next";
import Image from "next/image";
import "../Cinematic.css";
import { CinematicHero } from "../CinematicHero";
import { LearningAct } from "./LearningAct";
import { PracticeAct, PRACTICE_CANVAS_ID } from "./PracticeAct";
import { CinematicFooter, FutureAct } from "./FutureAct";

export const metadata: Metadata = {
  title: "Sinaliza — V4 cinematic experience",
  description:
    "Experiência cinematográfica do Sinaliza: O Gesto, A Conexão, O Aprendizado, A Prática e O Futuro.",
  robots: { index: false, follow: false },
};

function CinematicJourney() {
  return (
    <main className="v4c-page">
      {/* The poster starts hidden so the live intro never flashes the formed
          hand; without scripting it is the static composition and must show. */}
      <noscript>
        <style>{".v4c .v4c-poster { opacity: 1; }"}</style>
      </noscript>
      <CinematicHero
        backdrop={<p className="v4c-ghost">Libras</p>}
        practiceCanvasId={PRACTICE_CANVAS_ID}
        connection={
          <div className="v4c-actInner">
            <header className="v4c-actIntro v4c-reveal">
              <p className="v4c-eyebrow">Ato 2 · A Conexão</p>
              <h2 id="v4c-act2-title" className="v4c-actTitle">
                Uma língua.{" "}
                <span className="v4c-titleAccent">
                  Novas possibilidades de conexão.
                </span>
              </h2>
              <p className="v4c-actText">
                A Língua Brasileira de Sinais tem estrutura e gramática
                próprias. É vivida todos os dias pela comunidade surda
                brasileira — e aprender Libras é um jeito de chegar mais perto.
              </p>
            </header>

            <div className="v4c-actBlock v4c-reveal">
              <h3 className="v4c-actHeading">Começar nem sempre é simples.</h3>
              <p className="v4c-actText">
                Quem quer aprender nem sempre encontra por onde começar, um
                percurso organizado ou um espaço para praticar no próprio
                ritmo.
              </p>
            </div>

            <div className="v4c-actBlock v4c-reveal">
              <h3 className="v4c-actHeading">
                Uma língua não se aprende apenas memorizando.
              </h3>
              <p className="v4c-actText">
                Aprender Libras pede contexto, contato e prática. Nenhuma
                plataforma substitui professores, intérpretes ou a convivência
                com pessoas surdas.
              </p>
            </div>

            <p className="v4c-actClosing v4c-reveal">
              O Sinaliza nasce para apoiar esse começo.
            </p>

            <p className="v4c-actBridge v4c-reveal">
              <span className="v4c-bridgeLabel">A seguir</span>
              <span className="v4c-bridgeTitle">O Aprendizado</span>
              <span className="v4c-bridgeRule" aria-hidden="true" />
            </p>
          </div>
        }
      >
        <header className="v4c-bar">
          <Image
            src="/brand/sinaliza-horizontal.svg"
            alt="Sinaliza"
            width={240}
            height={72}
            priority
            className="v4c-wordmark"
          />
          <span className="v4c-barNote">Estudo V4 · hero cinematográfico</span>
        </header>

        <div className="v4c-birth">
          <p className="v4c-birthLine">Tudo começa em um gesto.</p>
          <p className="v4c-cue">
            <span className="v4c-cueLine" aria-hidden="true" />
            Role para continuar
          </p>
        </div>

        <div className="v4c-hero">
          <p className="v4c-eyebrow">Plataforma de aprendizagem de Libras</p>
          <h1 id="v4c-title" className="v4c-title">
            Aprender Libras é abrir espaço para{" "}
            <span className="v4c-titleAccent">novas conexões.</span>
          </h1>
          <p className="v4c-lede">
            Estamos desenvolvendo uma plataforma de aprendizagem de Língua
            Brasileira de Sinais que busca combinar conteúdos visuais,
            experiências práticas e tecnologia para tornar o aprendizado mais
            acessível.
          </p>
        </div>

        <p className="v4c-note">
          <span className="v4c-noteIndex">21</span>
          <span>
            pontos de referência de visão computacional.
            <br />
            Estrutura experimental — não representam um sinal de Libras.
          </span>
        </p>

        <div className="v4c-bridge" aria-hidden="true">
          <span className="v4c-bridgeLabel">A seguir</span>
          <span className="v4c-bridgeTitle">A Conexão</span>
          <span className="v4c-bridgeRule" />
        </div>
      </CinematicHero>

      <LearningAct />
      <PracticeAct />
      <FutureAct />
    </main>
  );
}

export default function Page() {
  return (
    <>
      <CinematicJourney />
      <CinematicFooter />
    </>
  );
}
