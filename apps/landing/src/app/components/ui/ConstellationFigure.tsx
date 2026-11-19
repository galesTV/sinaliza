/**
 * Constellation motif — the Sinaliza visual language: nodes (units),
 * edges (connections) and trajectories (journeys over time).
 *
 * This is a deliberately abstract figure, NOT a hand: the real
 * 21-landmark topology belongs to the hand-tracking overlay
 * (`HandVisualization`), and fake hand constellations could be
 * mistaken for Libras sign references (design-system MASTER.md §1).
 *
 * Pure SVG, deterministic and `aria-hidden` — decoration only.
 * The node-by-node draw is CSS-driven and only runs under
 * `prefers-reduced-motion: no-preference`.
 */

type NodeTone = "soft" | "accent" | "highlight";

interface ConstellationNode {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly tone: NodeTone;
}

const NODES: readonly ConstellationNode[] = [
  { x: 70, y: 408, r: 3, tone: "soft" },
  { x: 108, y: 356, r: 3, tone: "soft" },
  { x: 96, y: 250, r: 3, tone: "soft" },
  { x: 130, y: 150, r: 3.5, tone: "soft" },
  { x: 210, y: 92, r: 2.5, tone: "soft" },
  { x: 280, y: 70, r: 3, tone: "accent" },
  { x: 340, y: 105, r: 2.5, tone: "soft" },
  { x: 300, y: 150, r: 3, tone: "soft" },
  { x: 370, y: 185, r: 3.5, tone: "highlight" },
  { x: 430, y: 130, r: 2.5, tone: "soft" },
  { x: 180, y: 420, r: 2.5, tone: "soft" },
  { x: 300, y: 400, r: 2.5, tone: "soft" },
  { x: 400, y: 330, r: 3, tone: "accent" },
  { x: 240, y: 230, r: 4, tone: "accent" },
];

const TERMINAL = 13;

const EDGES: readonly (readonly [number, number])[] = [
  // Main trajectory — the journey ascending to the terminal node.
  [0, 1],
  [1, 2],
  [2, 3],
  [3, TERMINAL],
  // Upper arc — a second path arriving at the terminal node.
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, TERMINAL],
  // Lower arc — relationships off the main path.
  [1, 10],
  [10, 11],
  [11, 12],
  [12, 8],
  // Scatter.
  [6, 9],
];

const TONE_FILL: Record<NodeTone, string> = {
  soft: "var(--primary-soft)",
  accent: "var(--accent)",
  highlight: "var(--highlight)",
};

export function ConstellationFigure({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 460"
      fill="none"
      role="presentation"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx={NODES[TERMINAL].x}
        cy={NODES[TERMINAL].y}
        r={92}
        stroke="var(--accent)"
        strokeOpacity={0.16}
        strokeWidth={1}
        className="constellation-ring"
      />
      {EDGES.map(([from, to], index) => (
        <line
          key={`${from}-${to}`}
          x1={NODES[from].x}
          y1={NODES[from].y}
          x2={NODES[to].x}
          y2={NODES[to].y}
          stroke="var(--primary-soft)"
          strokeOpacity={0.32}
          strokeWidth={1.2}
          pathLength={1}
          className="constellation-edge"
          style={{ "--d": `${0.08 + index * 0.035}s` } as React.CSSProperties}
        />
      ))}
      {NODES.map((node, index) => (
        <circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={node.r}
          fill={TONE_FILL[node.tone]}
          fillOpacity={node.tone === "soft" ? 0.75 : 1}
          className="constellation-node"
          style={{ "--d": `${0.15 + index * 0.03}s` } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}
