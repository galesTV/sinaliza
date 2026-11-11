import { Reveal } from "../ui/Reveal";
import { StaggerGroup, StaggerItem } from "../ui/StaggerGroup";

const challenges = [
  {
    number: "01",
    title: "Memorizar não é compreender.",
    description:
      "Conhecer um sinal isoladamente não significa compreender como ele participa da comunicação.",
  },
  {
    number: "02",
    title: "O contexto faz diferença.",
    description:
      "Aprender uma língua envolve reconhecer significados, situações e formas de expressão.",
  },
  {
    number: "03",
    title: "A prática precisa fazer parte da jornada.",
    description:
      "O aprendizado ganha consistência quando o conhecimento pode ser revisitado e colocado em prática.",
  },
];

export function Challenge() {
  return (
    <section id="projeto" className="challenge-section">
      <Reveal className="challenge-intro">
        <span className="eyebrow">01 — O desafio</span>

        <h2 className="challenge-title">
          Uma língua não se aprende{" "}
          <span className="gradient-text">apenas memorizando.</span>
        </h2>

        <p className="challenge-description">
          Aprender Libras é desenvolver uma nova forma de compreender e
          compartilhar experiências. Isso exige mais do que conhecer sinais:
          exige contexto, contato e prática.
        </p>
      </Reveal>

      <div className="challenge-content">
        <Reveal className="challenge-statement">
          <span className="challenge-statement-mark" aria-hidden="true">
            “
          </span>

          <p>
            A comunicação começa quando o conhecimento deixa de ser apenas
            informação e passa a fazer sentido.
          </p>

          <span className="challenge-statement-caption">
            O aprendizado precisa ir além da memorização.
          </span>
        </Reveal>

        <StaggerGroup className="challenge-points">
          {challenges.map((challenge) => (
            <StaggerItem className="challenge-point" key={challenge.number}>
              <span className="challenge-number">{challenge.number}</span>

              <div>
                <h3>{challenge.title}</h3>
                <p>{challenge.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
