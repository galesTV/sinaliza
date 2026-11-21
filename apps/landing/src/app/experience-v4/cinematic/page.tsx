import type { Metadata } from "next";
import Image from "next/image";
import "../Cinematic.css";
import { CinematicHero } from "../CinematicHero";

export const metadata: Metadata = {
  title: "Sinaliza — V4 cinematic hero",
  description:
    "Fatia vertical isolada do hero cinematográfico: nascimento, materialização, gesto e transição da mão anatômica, dirigidos pelo scroll nativo.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main className="v4c-page">
      <CinematicHero>
        <p className="v4c-ghost" aria-hidden="true">
          Libras
        </p>

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

      <section className="v4c-next" aria-labelledby="v4c-next-title">
        <p className="v4c-nextTag">Placeholder temporário · fora do escopo</p>
        <h2 id="v4c-next-title" className="v4c-nextTitle">
          Ato 2 — A Conexão
        </h2>
        <p className="v4c-nextBody">
          Esta seção ainda não foi implementada. A fatia vertical da Fase C
          termina aqui; o conteúdo real do próximo ato será definido após a
          aprovação do hero.
        </p>
      </section>
    </main>
  );
}
