import type { DemoConstellationState } from "@/lib/demo-constellation";
import { demoNodeStates } from "@/lib/demo-constellation";
import { cn } from "@/lib/utils";

export const DEMO_CONSTELLATION_LABEL =
  "Constelação demonstrativa — ilustração de como sua evolução poderá ser representada. Esta experiência não registra progresso nas trilhas.";

const NODE_TONE: Record<string, string> = {
  locked: "text-muted/45",
  current: "text-accent",
  passed: "text-primary-soft",
  correct: "text-success",
  complete: "text-highlight",
};

function nodePosition(index: number, count: number) {
  if (count <= 1) return { x: 120, y: 64 };
  const ratio = index / (count - 1);
  return {
    x: 24 + ratio * 192,
    y: 68 - Math.sin(ratio * Math.PI) * 30 + (index % 2) * 8,
  };
}

function nodeLabel(state: string, index: number) {
  switch (state) {
    case "correct":
      return `Etapa ${index + 1}: exercício demonstrativo correto`;
    case "complete":
      return `Etapa ${index + 1}: parte da simulação concluída`;
    case "current":
      return `Etapa ${index + 1}: etapa atual`;
    case "passed":
      return `Etapa ${index + 1}: etapa percorrida`;
    default:
      return `Etapa ${index + 1}: ainda não revelada`;
  }
}


/** Compact always-visible projection for the runner header. The labelled
 * figure remains the primary explanation; this strip makes correct-answer
 * feedback perceptible while the learner is on the exercise step. */
export function DemoConstellationMini({
  state,
  exerciseStepIndexes,
}: {
  state: DemoConstellationState;
  exerciseStepIndexes: readonly number[];
}) {
  const nodes = demoNodeStates(state, exerciseStepIndexes);
  const width = Math.max(32, nodes.length * 20);
  return (
    <span
      data-testid="demo-constellation-mini"
      data-correct={state.correctExercises}
      data-completed={state.completed ? "true" : "false"}
      className="flex min-h-6 items-center gap-2"
    >
      <svg
        viewBox={`0 0 ${width} 18`}
        role="img"
        aria-label="Evolução visual demonstrativa resumida — não registra progresso"
        className="h-4.5 w-auto"
      >
        {nodes.slice(1).map((nodeState, index) => {
          const x1 = 10 + index * 20;
          const x2 = 10 + (index + 1) * 20;
          const active = nodeState !== "locked" && nodes[index] !== "locked";
          return (
            <line
              key={`mini-edge-${index}`}
              x1={x1}
              y1={9}
              x2={x2}
              y2={9}
              stroke="currentColor"
              strokeWidth={1.4}
              strokeDasharray={active ? undefined : "2 3"}
              className={active ? "text-primary-soft/70" : "text-muted/30"}
            />
          );
        })}
        {nodes.map((nodeState, index) => {
          const x = 10 + index * 20;
          const solved = nodeState === "correct" || nodeState === "complete";
          return (
            <g key={index} data-mini-node={index} data-state={nodeState}>
              <circle
                cx={x}
                cy={9}
                r={nodeState === "current" ? 5.5 : 4.5}
                fill="var(--color-surface-elevated)"
                stroke="currentColor"
                strokeWidth={1.3}
                strokeDasharray={nodeState === "locked" ? "2 2" : undefined}
                className={NODE_TONE[nodeState]}
              />
              {nodeState !== "locked" &&
                (solved ? (
                  <path
                    d={`M${x - 1.8} 9l1.2 1.2 2.3-2.3`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    className={NODE_TONE[nodeState]}
                  />
                ) : (
                  <circle cx={x} cy={9} r={1.8} fill="currentColor" className={NODE_TONE[nodeState]} />
                ))}
            </g>
          );
        })}
      </svg>
      <span className="text-[10px] font-medium tabular-nums text-muted">
        {state.correctExercises}/{state.totalExercises}
      </span>
    </span>
  );
}

/**
 * Small SVG projection of the guided demo's ephemeral state. It borrows
 * the constellation language (points, connections, state by shape and
 * brightness) without touching the real constellation projection.
 */
export function DemoConstellation({
  state,
  exerciseStepIndexes,
  compact = false,
}: {
  state: DemoConstellationState;
  exerciseStepIndexes: readonly number[];
  compact?: boolean;
}) {
  const nodes = demoNodeStates(state, exerciseStepIndexes).map(
    (nodeState, index) => ({
      ...nodePosition(index, state.stepCount),
      index,
      state: nodeState,
    }),
  );
  const activeEdges = nodes.slice(1).filter((node) => {
    return node.state !== "locked";
  }).length;

  return (
    <figure
      data-testid="demo-constellation"
      data-completed={state.completed ? "true" : "false"}
      data-correct={state.correctExercises}
      data-furthest-step={state.furthestStep}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-accent/25 bg-surface p-4",
        compact ? "sm:p-4" : "sm:p-5",
      )}
    >
      <figcaption className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          Constelação demonstrativa
        </span>
        <span className="text-xs leading-relaxed text-muted">
          Ilustração de como sua evolução poderá ser representada. Esta
          experiência não registra progresso nas trilhas.
        </span>
      </figcaption>

      <svg
        viewBox="0 0 240 126"
        role="img"
        aria-label={DEMO_CONSTELLATION_LABEL}
        className="h-auto w-full max-w-72 self-center overflow-visible"
      >
        {nodes.slice(1).map((node) => {
          const previous = nodes[node.index - 1];
          const active = node.state !== "locked" && previous.state !== "locked";
          return (
            <line
              key={`edge-${node.index}`}
              x1={previous.x}
              y1={previous.y}
              x2={node.x}
              y2={node.y}
              stroke="currentColor"
              strokeWidth={active ? 1.5 : 1}
              strokeDasharray={active ? undefined : "2 4"}
              className={cn(
                "transition-all duration-500 motion-reduce:transition-none",
                active ? "text-primary-soft/70" : "text-muted/25",
                state.completed && active && "text-highlight/75",
              )}
            />
          );
        })}

        {state.completed && (
          <g className="text-highlight">
            <circle cx={120} cy={108} r={13} fill="none" stroke="currentColor" strokeOpacity={0.45} />
            <path
              d="M120 98l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.2-4.6-4.3 6.3-.8z"
              fill="currentColor"
            />
          </g>
        )}

        {nodes.map((node) => {
          const solved = node.state === "correct" || node.state === "complete";
          return (
            <g
              key={node.index}
              data-demo-node={node.index}
              data-state={node.state}
              className={cn(
                "transition-all duration-500 motion-reduce:transition-none",
                NODE_TONE[node.state],
              )}
            >
              {solved && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={12}
                  fill="currentColor"
                  opacity={0.16}
                  className="demo-node-pulse motion-reduce:animate-none"
                />
              )}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.state === "current" ? 9 : 7.5}
                fill="var(--color-surface)"
                stroke="currentColor"
                strokeWidth={node.state === "locked" ? 1 : 1.5}
                strokeDasharray={node.state === "locked" ? "2.5 3" : undefined}
              />
              {node.state === "locked" ? (
                <circle cx={node.x} cy={node.y} r={2.5} fill="currentColor" opacity={0.5} />
              ) : solved ? (
                <path
                  d={`M${node.x - 2.6} ${node.y}l1.8 1.8 3.4-3.4`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx={node.x} cy={node.y} r={3.5} fill="currentColor" />
              )}
              <title>{nodeLabel(node.state, node.index)}</title>
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] leading-relaxed text-muted">
        <span>
          {state.correctExercises} de {state.totalExercises} exercícios
          demonstrativos corretos
        </span>
        <span>{activeEdges} conexões reveladas</span>
      </div>
      <span className="sr-only">
        {state.completed
          ? "Constelação demonstrativa formada. Nenhum progresso oficial foi registrado."
          : `${state.correctExercises} exercícios demonstrativos corretos.`}
      </span>
    </figure>
  );
}
