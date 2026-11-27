import { ConstellationGraphic } from "./constellation-graphic";

export function CulturalEmptyState({
  categoryLabel,
}: {
  categoryLabel: string;
}) {
  return (
    <section
      aria-labelledby="cultural-empty-title"
      className="relative overflow-hidden rounded-[1.75rem] border border-dashed border-border bg-surface/45 p-6 sm:p-8"
    >
      <ConstellationGraphic
        variant="home"
        className="pointer-events-none absolute -right-6 -top-6 h-32 w-52 text-accent opacity-30"
      />
      <div className="relative flex max-w-xl flex-col gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Espaço cultural em preparação
        </p>
        <h2 id="cultural-empty-title" className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Novos conteúdos em preparação
        </h2>
        <p className="text-sm leading-relaxed text-muted sm:text-base">
          A seção de {categoryLabel} ainda está sendo preparada. Quando novos
          conteúdos estiverem prontos, você poderá descobri-los aqui.
        </p>
      </div>
    </section>
  );
}
