import Image from "next/image";
import Link from "next/link";

import { isExploreNavigationAvailable } from "@/data/explore-availability";

import { HeaderAuth } from "./auth-nav";
import { BottomNav, DesktopNav } from "./main-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const showExplore = isExploreNavigationAvailable();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
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
            <DesktopNav showExplore={showExplore} />
            <HeaderAuth />
            <span className="hidden rounded-full border border-border px-3 py-1.5 text-[11px] font-medium tracking-wide text-muted sm:inline-block">
              Versão inicial
            </span>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-5 pb-28 pt-10 sm:px-8 md:pb-16"
      >
        {children}
      </main>

      <BottomNav showExplore={showExplore} />
    </div>
  );
}
