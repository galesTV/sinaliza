export type EditorialSvgMotif =
  | "diversity-orbits"
  | "parallel-structures"
  | "visual-rhythm"
  | "monogram"
  | "academic"
  | "literary";

function motifProps(className?: string) {
  return {
    className,
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    focusable: false,
  } as const;
}

export function EditorialMotif({
  motif,
  className,
}: {
  motif: EditorialSvgMotif;
  className?: string;
}) {
  if (motif === "diversity-orbits") {
    return (
      <svg viewBox="0 0 150 116" {...motifProps(className)}>
        <g stroke="currentColor" vectorEffect="non-scaling-stroke">
          <circle cx="43" cy="48" r="24" strokeOpacity=".78" />
          <ellipse cx="43" cy="48" rx="11" ry="24" transform="rotate(15 43 48)" strokeOpacity=".48" />
          <circle cx="60" cy="31" r="3" fill="currentColor" stroke="none" />

          <circle cx="108" cy="38" r="24" strokeOpacity=".72" />
          <ellipse cx="108" cy="38" rx="11" ry="24" transform="rotate(55 108 38)" strokeOpacity=".44" />
          <circle cx="125" cy="21" r="3" fill="currentColor" stroke="none" />

          <circle cx="80" cy="86" r="24" strokeOpacity=".66" />
          <ellipse cx="80" cy="86" rx="11" ry="24" transform="rotate(95 80 86)" strokeOpacity=".4" />
          <circle cx="97" cy="69" r="3" fill="currentColor" stroke="none" />

          <path d="M4 88 C18 96 28 103 39 114" strokeOpacity=".22" strokeDasharray="2 5" />
          <path d="M124 72 C137 79 143 87 149 98" strokeOpacity=".2" strokeDasharray="2 5" />
        </g>
      </svg>
    );
  }

  if (motif === "parallel-structures") {
    return (
      <svg viewBox="0 0 150 116" {...motifProps(className)}>
        <g fill="currentColor">
          <rect x="12" y="24" width="35" height="11" rx="5.5" />
          <rect x="27" y="50" width="35" height="11" rx="5.5" opacity=".78" />
          <rect x="42" y="76" width="35" height="11" rx="5.5" opacity=".56" />
        </g>
        <g stroke="currentColor" vectorEffect="non-scaling-stroke" strokeLinejoin="round">
          <path d="M96 22 L140 54 L111 98 Z M96 22 L111 98 L84 76 L140 54" />
          <g fill="currentColor" stroke="none">
            <circle cx="96" cy="22" r="3" />
            <circle cx="140" cy="54" r="3" />
            <circle cx="111" cy="98" r="3" />
            <circle cx="84" cy="76" r="3" />
          </g>
        </g>
      </svg>
    );
  }

  if (motif === "visual-rhythm") {
    return (
      <svg viewBox="0 0 150 116" {...motifProps(className)}>
        <circle cx="75" cy="58" r="39" stroke="currentColor" strokeOpacity=".22" vectorEffect="non-scaling-stroke" />
        <g
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          <path d="M8 29 Q40 1 75 29 T142 29" opacity=".96" />
          <path d="M8 43 Q40 15 75 43 T142 43" opacity=".82" />
          <path d="M8 57 Q40 29 75 57 T142 57" opacity=".68" />
          <path d="M8 71 Q40 43 75 71 T142 71" opacity=".54" />
          <path d="M8 85 Q40 57 75 85 T142 85" opacity=".4" />
        </g>
      </svg>
    );
  }

  if (motif === "monogram") {
    return (
      <svg viewBox="0 0 150 116" {...motifProps(className)}>
        <g stroke="currentColor" vectorEffect="non-scaling-stroke">
          <circle cx="98" cy="57" r="40" strokeOpacity=".24" />
          <circle cx="98" cy="57" r="29" strokeOpacity=".44" />
          <path d="M12 95 H138" strokeOpacity=".35" />
          <path d="M12 21 H76" strokeOpacity=".18" />
        </g>
      </svg>
    );
  }

  if (motif === "academic") {
    return (
      <svg viewBox="0 0 150 116" {...motifProps(className)}>
        <g stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke">
          <circle cx="72" cy="43" r="29" strokeOpacity=".68" />
          <circle cx="89" cy="57" r="29" strokeOpacity=".68" />
          <circle cx="106" cy="71" r="29" strokeOpacity=".68" />
          <path d="M14 18 H136" strokeOpacity=".32" />
          <path d="M14 101 H136" strokeOpacity=".32" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 150 116" {...motifProps(className)}>
      <g stroke="currentColor" vectorEffect="non-scaling-stroke" strokeLinejoin="round">
        <path d="M75 16 L84 43 L111 52 L84 61 L75 88 L66 61 L39 52 L66 43 Z" strokeWidth="1.25" />
        <path d="M22 83 Q48 70 75 91 Q102 70 128 83 L128 94 Q102 81 75 102 Q48 81 22 94 Z" />
        <path d="M29 36 H36 M32.5 32.5 V39.5" strokeOpacity=".68" />
        <path d="M116 36 H123 M119.5 32.5 V39.5" strokeOpacity=".68" />
        <path d="M43 23 H50 M46.5 19.5 V26.5" strokeOpacity=".54" />
        <path d="M102 23 H109 M105.5 19.5 V26.5" strokeOpacity=".54" />
      </g>
    </svg>
  );
}
