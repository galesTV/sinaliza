"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { IconUser } from "./icons";
import { SignOutButton } from "./sign-out-button";
import { useAuthSession } from "./use-auth-session";

/**
 * Session-aware header controls (desktop). While the session is being
 * resolved the guest controls stay in the layout but hidden, so there is
 * no width jump and no flash of the wrong state.
 */
export function HeaderAuth() {
  const { status } = useAuthSession();

  return (
    <div className="hidden items-center gap-2 md:flex" aria-label="Acesso à conta">
      {status === "user" ? (
        <>
          <Link
            href="/conta"
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground"
          >
            <IconUser className="h-4 w-4" />
            Conta
          </Link>
          <SignOutButton className="min-h-11 px-4 py-0 text-sm" />
        </>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2",
            status === "loading" && "invisible",
          )}
        >
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-medium text-muted transition-colors duration-200 hover:bg-surface hover:text-foreground"
          >
            Entrar
          </Link>
          <Link href="/cadastro" className="btn-primary min-h-11 px-4 py-0 text-sm">
            Criar conta
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Bottom-nav item (mobile): "Entrar" → /login for guests, "Conta" → /conta
 * when signed in. Same visual contract as the other nav items.
 */
export function BottomNavAuth({ pathname }: { pathname: string }) {
  const { status } = useAuthSession();
  const signedIn = status === "user";

  const href = signedIn ? "/conta" : "/login";
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <li className="flex-1">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex min-h-14 flex-col items-center justify-center gap-1 text-xs transition-colors duration-200",
          active
            ? "font-semibold text-accent"
            : "font-medium text-muted hover:text-foreground",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0 h-0.5 w-10 rounded-full transition-colors duration-200",
            active ? "bg-accent" : "bg-transparent",
          )}
        />
        <IconUser className="h-5 w-5" />
        {signedIn ? "Conta" : "Entrar"}
      </Link>
    </li>
  );
}
