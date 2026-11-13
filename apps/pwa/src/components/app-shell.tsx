import Image from "next/image";
import Link from "next/link";

import { BottomNav, DesktopNav } from "./main-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <header className="border-b border-border/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-[10px]"
            aria-label="Sinaliza — página inicial"
          >
            <Image
              src="/brand/sinaliza-horizontal.svg"
              alt="Sinaliza"
              width={120}
              height={36}
              priority
            />
          </Link>

          <div className="flex items-center gap-4">
            <DesktopNav />
            <span className="hidden rounded-full border border-border px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted sm:inline-block">
              Versão inicial
            </span>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-10 sm:px-8 md:pb-16"
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
