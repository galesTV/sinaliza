"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { BottomNavAuth } from "./auth-nav";
import { IconCompass, IconFlask, IconHome, IconRoute } from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: typeof IconHome;
  isActive: (pathname: string) => boolean;
}

function getNavItems(showExplore: boolean): NavItem[] {
  return [
    {
      href: "/",
      label: "Início",
      icon: IconHome,
      isActive: (pathname) => pathname === "/",
    },
    {
      href: "/trilhas",
      label: "Trilhas",
      icon: IconRoute,
      isActive: (pathname) => pathname === "/trilhas" || pathname.startsWith("/trilhas/"),
    },
    ...(showExplore
      ? [
          {
            href: "/explorar",
            label: "Explorar",
            icon: IconCompass,
            isActive: (pathname: string) =>
              pathname === "/explorar" || pathname.startsWith("/explorar/"),
          },
        ]
      : []),
    {
      href: "/laboratorio",
      label: "Laboratório",
      icon: IconFlask,
      isActive: (pathname) =>
        pathname === "/laboratorio" || pathname.startsWith("/laboratorio/"),
    },
  ];
}

export function DesktopNav({ showExplore = false }: { showExplore?: boolean }) {
  const pathname = usePathname();
  const navItems = getNavItems(showExplore);

  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul className="flex items-center gap-2">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2.5 rounded-[10px] px-3 text-sm transition-colors duration-200 xl:px-4",
                  active
                    ? "bg-surface-elevated font-semibold text-accent"
                    : "font-medium text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                    active
                      ? "bg-accent shadow-[0_0_8px_var(--glow-accent-strong)]"
                      : "bg-border",
                  )}
                />
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="sr-only lg:hidden">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav({ showExplore = false }: { showExplore?: boolean }) {
  const pathname = usePathname();
  const navItems = getNavItems(showExplore);

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {navItems.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
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
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
        <BottomNavAuth pathname={pathname} />
      </ul>
    </nav>
  );
}
