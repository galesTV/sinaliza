import Image from "next/image";
import { Reveal } from "../ui/Reveal";

export function Hero() {
  return (
    <section id="inicio" className="landing-hero">
      <Reveal className="hero-content" duration={0.65} distance={14}>
        <div className="hero-badge">
          <span className="hero-badge-indicator" />
          Projeto participante do HackBrasil 2026
        </div>

        <h1 className="landing-hero-title">
          Aprender Libras é abrir espaço para{" "}
          <span className="gradient-text">novas conexões.</span>
        </h1>

        <p className="landing-hero-description">
          Estamos desenvolvendo uma plataforma de aprendizagem de Língua
          Brasileira de Sinais que busca combinar conteúdos visuais,
          experiências práticas e tecnologia para tornar o aprendizado mais
          acessível.
        </p>

        <div className="hero-actions">
          <a href="#projeto" className="hero-primary-button">
            Descubra o Sinaliza
            <span aria-hidden="true">↗</span>
          </a>

          <a href="#demonstracao" className="hero-secondary-button">
            Conheça a demonstração
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="hero-supporting-text">
          <span className="hero-supporting-line" />
          Aprender. Praticar. Conectar.
        </div>
      </Reveal>

      <Reveal
        className="hero-visual"
        role="img"
        ariaLabel="Ilustração conceitual da jornada de aprendizagem do Sinaliza"
        delay={0.12}
        duration={0.7}
        distance={12}
      >
        <div className="hero-visual-glow" />

        <div className="hero-orbit hero-orbit-outer" />
        <div className="hero-orbit hero-orbit-inner" />

        <div className="hero-visual-center">
          <Image
            src="/brand/sinaliza-simbolo.svg"
            alt=""
            width={112}
            height={112}
            priority
            className="hero-center-symbol"
          />
          <span className="hero-center-label">SINALIZA</span>
        </div>

        <div className="journey-card journey-card-top">
          <span className="journey-card-icon journey-icon-learning">01</span>

          <div>
            <strong>Aprender</strong>
            <span>Descubra novos sinais</span>
          </div>
        </div>

        <div className="journey-card journey-card-right">
          <span className="journey-card-icon journey-icon-practice">02</span>

          <div>
            <strong>Praticar</strong>
            <span>Aprenda fazendo</span>
          </div>
        </div>

        <div className="journey-card journey-card-bottom">
          <span className="journey-card-icon journey-icon-progress">03</span>

          <div>
            <strong>Evoluir</strong>
            <span>Acompanhe sua jornada</span>
          </div>
        </div>

        <span className="hero-visual-caption">Uma jornada de aprendizagem</span>
      </Reveal>
    </section>
  );
}
