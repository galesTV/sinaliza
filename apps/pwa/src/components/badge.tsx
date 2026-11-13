import { cn } from "@/lib/utils";

import { IconClock } from "./icons";

type BadgeTone = "neutral" | "accent" | "success";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "border-border bg-surface text-muted",
  accent: "border-accent/35 bg-accent/10 text-accent",
  success: "border-success/35 bg-success/10 text-success",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PlannedBadge({ className }: { className?: string }) {
  return (
    <Badge tone="accent" className={className}>
      <IconClock className="h-3 w-3" />
      Em breve
    </Badge>
  );
}
