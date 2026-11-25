import Image from "next/image";
import { PWA_URL } from "../../lib/site";
import "./FutureAct.css";

const nodes = [
  [95, 436, 2.4], [162, 370, 3.7], [221, 467, 2.1], [270, 334, 2.7],
  [306, 415, 5], [338, 264, 2.3], [378, 360, 2.8], [416, 290, 3.8],
  [433, 185, 2.6], [474, 343, 2.4], [520, 268, 6.2], [548, 385, 2.8],
  [571, 166, 3.2], [599, 322, 3.6], [632, 237, 4.2], [666, 387, 2.4],
  [691, 170, 2.3], [737, 257, 3.6], [766, 112, 4.4], [807, 191, 2.6],
  [849, 145, 2.4],
] as const;

function Constellation() {
  return (
    <div className="v4c-future-field" aria-hidden="true">
      <svg viewBox="0 0 900 560" focusable="false" className="v4c-future-stars" data-v4c-reveal="constellation">
        <defs>
          <linearGradient id="v4c-future-light" x1="0%" y1="95%" x2="98%" y2="12%">
            <stop stopColor="#7164e9" />
            <stop offset=".45" stopColor="#5ba8ff" />
            <stop offset=".72" stopColor="#a1f3ff" />
            <stop offset="1" stopColor="#9078ff" />
          </linearGradient>
          <radialGradient id="v4c-future-halo">
            <stop stopColor="#a1f3ff" stopOpacity=".76" />
            <stop offset=".26" stopColor="#35c9e8" stopOpacity=".32" />
            <stop offset="1" stopColor="#4585ea" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="v4c-future-depth" fill="none" stroke="#9693f9">
          <path d="M44 454C155 291 415 122 705 88c117-14 177 15 169 61-20 125-401 319-664 359C102 524 43 500 44 454Z" />
          <path d="M103 204c62-74 267-97 449-43 168 50 291 141 256 219-37 83-266 98-454 42C177 369 38 280 103 204Z" strokeDasharray="1 7" />
          <path d="M75 308 201 189 395 105 571 166 803 74M133 494 306 415 564 463 737 257 871 277" strokeDasharray="2 7" />
          <path d="M36 370h.1M82 242h.1M115 123h.1M157 310h.1M182 134h.1M199 526h.1M239 113h.1M248 254h.1M285 199h.1M352 497h.1M384 446h.1M441 127h.1M456 493h.1M468 74h.1M536 96h.1M537 451h.1M607 458h.1M637 83h.1M674 290h.1M739 353h.1M761 68h.1M800 330h.1M834 218h.1M868 91h.1" strokeLinecap="round" strokeWidth="3" />
        </g>
        <g className="v4c-future-formation">
          <path
            d="M95 436 162 370 221 467 306 415 270 334 162 370M270 334 338 264 416 290 378 360 306 415 474 343 433 185 338 264M433 185 571 166 520 268 416 290 474 343 548 385 666 387 599 322 548 385M599 322 632 237 571 166 691 170 766 112 807 191 849 145M766 112 737 257 632 237 691 170M807 191 737 257 666 387"
            fill="none"
            stroke="url(#v4c-future-light)"
            strokeOpacity=".46"
          />
          <path
            className="v4c-future-thread"
            d="M95 436 162 370 270 334 306 415 378 360 416 290 520 268 599 322 632 237 737 257 807 191 849 145"
            pathLength="1"
            fill="none"
            stroke="url(#v4c-future-light)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g fill="url(#v4c-future-halo)">
            <circle cx="306" cy="415" r="31" />
            <circle cx="520" cy="268" r="56" />
            <circle cx="632" cy="237" r="26" />
            <circle cx="766" cy="112" r="30" />
          </g>
          <g fill="none" stroke="#9de4ff">
            <circle cx="520" cy="268" r="18" opacity=".65" />
            <circle cx="520" cy="268" r="29" opacity=".36" strokeDasharray="2 6" />
            <circle cx="306" cy="415" r="12" opacity=".42" />
          </g>
          <g fill="url(#v4c-future-light)">
            {nodes.map(([x, y, radius]) => (
              <circle key={x} cx={x} cy={y} r={radius} />
            ))}
          </g>
          <circle cx="520" cy="268" r="3.5" fill="#f4f6fc" />
        </g>
      </svg>
    </div>
  );
}

export function FutureAct() {
  return (
    <section className="v4c-future" aria-labelledby="v4c-act5-title">
      <div className="v4c-future-scene v4c-future-width">
        <header className="v4c-future-intro">
          <p className="v4c-eyebrow" data-v4c-reveal="eyebrow">Ato 5 · O Futuro</p>
          <h2 id="v4c-act5-title" className="v4c-future-title" data-v4c-reveal="title">
            O futuro se constrói com <span>novas conexões.</span>
          </h2>
          <p className="v4c-future-copy" data-v4c-reveal="copy">
            O Sinaliza nasce para apoiar os primeiros passos no aprendizado de
            Libras. Queremos construir uma experiência que aproxime pessoas,
            incentive a prática e amplie possibilidades de aprendizagem.
          </p>
        </header>
        <Constellation />
      </div>

      <div className="v4c-future-invite v4c-future-width">
        <div>
          <h3 data-v4c-reveal="title">Dê o primeiro passo.</h3>
          <p className="v4c-future-copy" data-v4c-reveal="copy">
            Conheça a versão inicial do Sinaliza e explore uma nova forma de
            começar a aprender Libras.
          </p>
        </div>
        <div className="v4c-future-action" data-v4c-reveal="cta">
          <a href={PWA_URL} className="v4c-future-cta">
            Experimente o Sinaliza <span aria-hidden="true">↗</span>
          </a>
          <p>Versão inicial em desenvolvimento</p>
        </div>
      </div>
    </section>
  );
}

export function CinematicFooter() {
  return (
    <footer className="v4c-future-footer">
      <div className="v4c-future-width">
        <div className="v4c-future-brand">
          <Image src="/brand/sinaliza-horizontal.svg" alt="Sinaliza" width={160} height={48} />
          <p>Aprender. Praticar. Evoluir.</p>
        </div>
        <div className="v4c-future-footnotes">
          <span>Versão inicial</span>
          <a href="https://github.com/galesTV/sinaliza">
            Projeto no GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
