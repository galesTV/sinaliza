import type { HAND_POSES } from "./handPoses";

export type PracticeCommand = keyof typeof HAND_POSES | "sequence";

const LABELS: Record<PracticeCommand, string> = {
  sequence: "Sequência",
  flexed: "Flexão conjunta",
  extended: "Extensão",
  index: "Indicador",
  middle: "Médio",
  ring: "Anelar",
  little: "Mínimo",
  thumb: "Polegar",
  relaxed: "Restaurar",
};

/** Mounted outside the decorative canvas host, only for a live ?debug session. */
export function mountPracticeDiagnostics(host: HTMLElement, run: (command: PracticeCommand) => void) {
  const panel = document.createElement("fieldset");
  panel.className = "v4c-practice-debug";
  const legend = document.createElement("legend");
  legend.textContent = "Diagnóstico de articulação";
  const controls = document.createElement("div");
  const status = document.createElement("output");
  const counter = document.createElement("span");
  counter.setAttribute("aria-hidden", "true");

  for (const command of Object.keys(LABELS) as PracticeCommand[]) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = LABELS[command];
    button.addEventListener("click", () => run(command));
    controls.append(button);
  }

  panel.append(legend, controls, status, counter);
  host.after(panel);
  return {
    update(command: PracticeCommand, moving: boolean, queued: boolean, frames: number) {
      const label = command === "relaxed" ? "Repouso" : LABELS[command];
      const state = label + (moving ? " · em movimento" : " · estável");
      if (status.textContent !== state) status.textContent = state;
      counter.textContent = `Quadros: ${frames} · ciclo ${queued ? "ativo" : "ocioso"}`;
    },
    remove: () => panel.remove(),
  };
}
