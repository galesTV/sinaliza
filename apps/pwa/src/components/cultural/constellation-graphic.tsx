import type { CulturalCategory } from "@/data/cultural-catalog-model";

export function ConstellationGraphic({
  variant,
  className = "",
}: {
  variant: CulturalCategory | "home";
  className?: string;
}) {
  const nodes = {
    home: [[18, 62], [48, 30], [82, 48], [118, 22], [146, 58], [94, 76]],
    history: [[14, 68], [52, 26], [92, 58], [144, 20]],
    curiosity: [[30, 58], [72, 22], [112, 62], [142, 28], [88, 78]],
    personality: [[44, 50], [82, 30], [104, 58], [136, 34]],
    library: [[30, 70], [30, 34], [74, 58], [112, 28], [140, 62]],
  }[variant];

  return (
    <svg viewBox="0 0 160 96" fill="none" aria-hidden="true" className={className}>
      <path
        d={nodes.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ")}
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.34"
      />
      {nodes.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r={index % 2 === 0 ? 3 : 5} stroke="currentColor" strokeWidth="1.4" opacity="0.55" />
          <circle cx={x} cy={y} r="1.3" fill="currentColor" opacity="0.8" />
        </g>
      ))}
      {variant === "library" && [28, 52, 76].map((x) => (
        <path key={x} d={`M${x} 82h52l10 8H${x + 10}z`} stroke="currentColor" strokeWidth="1.4" opacity="0.32" />
      ))}
      {variant === "curiosity" && <circle cx="72" cy="22" r="18" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />}
      {variant === "personality" && <circle cx="82" cy="38" r="24" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />}
    </svg>
  );
}
