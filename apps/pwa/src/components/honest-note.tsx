import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { IconClock } from "./icons";

/**
 * Honest status note — a dashed panel that states plainly what is pending,
 * preliminary, experimental, or not built yet (AGENTS.md §3/§18; MASTER.md
 * §10 "labeled, never disguised").
 *
 * Two presentations, both `role="note"`:
 * - with `title`: a panel (icon tile + title + body) for pending/empty
 *   content slots;
 * - without `title`: a compact note (small leading icon + muted line) for
 *   footnote-level disclosures.
 *
 * Deliberately not a generic alert: no tones, no actions, no `role="alert"`.
 */
export function HonestNote({
  title,
  icon,
  children,
  className,
}: {
  title?: string;
  /** Replaces the default clock glyph; pass a sized icon element. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const titled = Boolean(title);

  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3.5 rounded-2xl border border-dashed border-border bg-surface/50",
        titled ? "p-6" : "p-5",
        className,
      )}
    >
      {titled ? (
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-surface-elevated text-muted"
        >
          {icon ?? <IconClock className="h-5 w-5" />}
        </span>
      ) : (
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-muted">
          {icon ?? <IconClock className="h-4 w-4" />}
        </span>
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        {titled && (
          <p className="text-sm font-semibold text-foreground">{title}</p>
        )}
        <div className="text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
