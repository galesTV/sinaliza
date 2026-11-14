/**
 * Constellation motif — the Sinaliza visual language: nodes (units),
 * edges (connections) and trajectories (journeys over time).
 *
 * This is a deliberately abstract figure, NOT a hand: the real
 * 21-landmark topology belongs to the hand-tracking overlays
 * (see `hand-lab`), and fake hand constellations could be mistaken
 * for Libras sign references (design-system/sinaliza/MASTER.md §1).
 *
 * Pure SVG, deterministic and `aria-hidden` — decoration only.
 */

type NodeTone = "soft" | "accent" | "highlight";

interface ConstellationNode {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly tone: NodeTone;
}

const NODES: readonly ConstellationNode[] = [
  { x: 24, y: 164, r: 3, tone: "soft" },
  { x: 66, y: 140, r: 3, tone: "soft" },
  { x: 104, y: 150, r: 3, tone: "soft" },
  { x: 142, y: 118, r: 3, tone: "accent" },
  { x: 186, y: 126, r: 3, tone: "soft" },
  { x: 224, y: 92, r: 3, tone: "soft" },
  { x: 268, y: 66, r: 4, tone: "highlight" },
  { x: 78, y: 72, r: 2.5, tone: "soft" },
  { x: 120, y: 44, r: 2.5, tone: "accent" },
  { x: 170, y: 40, r: 2.5, tone: "soft" },
  { x: 250, y: 140, r: 2.5, tone: "soft" },
  { x: 296, y: 116, r: 2.5, tone: "accent" },
];

const EDGES: readonly (readonly [number, number])[] = [
  // Main trajectory — the journey ascending to the highlighted node.
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  // Secondary branches — relationships off the main path.
  [1, 7],
  [7, 8],
  [8, 9],
  [9, 5],
  [4, 10],
  [10, 11],
];

const TONE_FILL: Record<NodeTone, string> = {
  soft: "#c7c0ff",
  accent: "#35c9e8",
  highlight: "#f0a848",
};

export function ConstellationFigure({ className }: { className?: string }) {
  const terminal = NODES[6];

  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      {EDGES.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={NODES[from].x}
          y1={NODES[from].y}
          x2={NODES[to].x}
          y2={NODES[to].y}
          stroke="#c7c0ff"
          strokeOpacity={0.32}
          strokeWidth={1.2}
        />
      ))}
      <circle
        cx={terminal.x}
        cy={terminal.y}
        r={9}
        stroke="#f0a848"
        strokeOpacity={0.35}
        strokeWidth={1.2}
      />
      {NODES.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill={TONE_FILL[node.tone]}
          fillOpacity={node.tone === "soft" ? 0.75 : 1}
        />
      ))}
    </svg>
  );
}
