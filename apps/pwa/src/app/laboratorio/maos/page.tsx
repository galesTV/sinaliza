import type { Metadata } from "next";

import { Eyebrow } from "@/components/eyebrow";
import { HandLab } from "@/components/hand-lab";

export const metadata: Metadata = {
  title: "Laboratório — Detecção de mãos",
  description:
    "Experimento de visão computacional com MediaPipe Hand Landmarker: 21 pontos de referência da mão detectados no navegador.",
};

export default function HandLabPage() {
  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="lab-title" className="flex flex-col gap-6">
        <Eyebrow>Laboratório experimental</Eyebrow>
        <h1
          id="lab-title"
          className="max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl"
        >
          Detecção de mãos no navegador
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted">
          Um experimento isolado de visão computacional: a biblioteca{" "}
          <span className="font-medium text-foreground">
            MediaPipe Hand Landmarker
          </span>{" "}
          identifica até duas mãos no vídeo e desenha 21 pontos de referência
          (landmarks) e suas conexões em cada uma.
        </p>

        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-surface/50 p-6 sm:p-7">
          <h2 className="text-sm font-semibold text-foreground">
            O que este experimento é — e o que não é
          </h2>
          <ul className="flex max-w-2xl flex-col gap-2.5 text-sm leading-relaxed text-muted">
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Detecta a posição geométrica de pontos da mão em tempo real, sem
              interpretar o que eles significam.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Não reconhece sinais de Libras, não classifica gestos e não avalia
              a produção do usuário — é uma prova técnica, não um recurso
              pedagógico.
            </li>
            <li className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
              Todo o processamento acontece localmente no navegador; nenhuma
              imagem é gravada, enviada ou persistida.
            </li>
          </ul>
          <p className="text-xs leading-relaxed text-muted">
            Modelo: <code className="font-mono">hand_landmarker.task</code>{" "}
            (Google MediaPipe Models, licença Apache 2.0) · Pacote:{" "}
            <code className="font-mono">@mediapipe/tasks-vision@0.10.21</code>
          </p>
        </div>
      </section>

      <HandLab />
    </div>
  );
}
