import { Eyebrow } from "@/components/eyebrow";

export function CulturalPageHeader({
  eyebrow = "Explorar",
  title,
  description,
  titleId,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  titleId: string;
}) {
  return (
    <header className="relative flex flex-col gap-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-0 hidden opacity-70 sm:block"
      >
        <span className="absolute right-20 top-8 h-2 w-2 rounded-full bg-accent shadow-[0_0_14px_rgba(53,201,232,0.7)]" />
        <span className="absolute right-36 top-20 h-1.5 w-1.5 rounded-full bg-primary-soft/80" />
        <span className="absolute right-8 top-28 h-2.5 w-2.5 rounded-full bg-highlight/90 shadow-[0_0_14px_rgba(240,168,72,0.55)]" />
        <span className="absolute right-12 top-12 h-px w-32 rotate-[24deg] bg-gradient-to-r from-primary/0 via-primary/50 to-accent/0" />
        <span className="absolute right-6 top-24 h-px w-28 -rotate-[18deg] bg-gradient-to-r from-accent/0 via-accent/40 to-primary/0" />
      </div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1
        id={titleId}
        className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h1>
      <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
        {description}
      </p>
    </header>
  );
}
