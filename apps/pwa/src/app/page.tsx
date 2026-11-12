import Image from "next/image";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <Image
        src="/brand/sinaliza-horizontal.svg"
        alt="Sinaliza"
        width={260}
        height={72}
        priority
      />

      <div className="flex flex-col gap-4">
        <p className="font-display text-sm tracking-[0.3em] text-accent uppercase">
          Aprender Libras. Praticar. Evoluir.
        </p>
        <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl">
          Plataforma de aprendizagem em construção
        </h1>
        <p className="mx-auto max-w-xl text-base leading-relaxed text-muted">
          Em breve: alfabeto manual, vocabulário básico, lições interativas e
          acompanhamento do seu progresso — tudo organizado em uma jornada de
          aprendizagem acessível.
        </p>
      </div>

      <div
        className="flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 py-5 text-left"
        role="status"
        aria-label="Estado do projeto"
      >
        <div>
          <p className="text-sm font-medium text-foreground">
            Ambiente de desenvolvimento
          </p>
          <p className="text-sm text-muted">
            Scaffold inicial do aplicativo educacional.
          </p>
        </div>
        <span
          className="h-3 w-3 shrink-0 rounded-full bg-accent"
          aria-hidden="true"
        />
      </div>
    </main>
  );
}
