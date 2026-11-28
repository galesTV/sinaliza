export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-accent">
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_var(--glow-accent-strong)]"
      />
      {children}
    </p>
  );
}
