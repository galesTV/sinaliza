import Image from "next/image";
import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const facts = [
  {
    title: "Trilhas de aprendizagem",
    description:
      "O alfabeto manual é a primeira trilha, organizada em módulos e lições estruturadas.",
  },
  {
    title: "Laboratório experimental",
    description:
      "Captura e visualização de mãos no navegador, em desenvolvimento ativo.",
  },
  {
    title: "Painel do estudante",
    description:
      "Acompanhamento da jornada e indicadores de progresso em evolução.",
  },
];

const secondaryShots = [
  { src: "/platform/trilhas.webp", alt: "Página de trilhas de aprendizagem do Sinaliza", caption: "Trilhas de aprendizagem" },
  { src: "/platform/alfabeto.webp", alt: "Trilha do alfabeto manual com seus módulos", caption: "Trilha do alfabeto" },
  { src: "/platform/lab.webp", alt: "Laboratório experimental de detecção de mãos no navegador", caption: "Laboratório experimental" },
];

export function Platform() {
  return (
    <section id="plataforma" className="platform-section">
      <Reveal className="platform-intro">
        <span className="eyebrow">03 — A plataforma</span>

        <h2 className="platform-title">
          O produto já existe —{" "}
          <span className="gradient-text">e está crescendo.</span>
        </h2>

        <p className="platform-description">
          O Sinaliza já tem uma base funcional em desenvolvimento: trilhas de
          aprendizagem, lições estruturadas e um laboratório experimental de
          captura de mãos.
        </p>
      </Reveal>

      <div className="platform-grid">
        <Reveal className="platform-evidence" delay={0.08}>
          <figure className="shot shot-featured">
            <Image
              src="/platform/dashboard.webp"
              alt="Painel inicial do Sinaliza com trilhas de aprendizagem"
              width={1440}
              height={960}
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <figcaption>
              Painel do estudante — captura do aplicativo em desenvolvimento
            </figcaption>
          </figure>

          <ul className="shot-row">
            {secondaryShots.map((shot) => (
              <li className="shot" key={shot.src}>
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={1440}
                  height={960}
                  sizes="(max-width: 800px) 33vw, 18vw"
                />
                <span className="shot-caption">{shot.caption}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <StaggerGroup className="platform-facts" as="ol">
          {facts.map((fact) => (
            <StaggerItem className="platform-fact" key={fact.title} as="li">
              <strong>{fact.title}</strong>
              <span>{fact.description}</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
