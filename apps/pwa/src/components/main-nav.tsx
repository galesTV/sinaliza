"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { IconHome, IconRoute } from "./icons";

interface NavItem {
  href: string;
  label: string;
  icon: typeof IconHome;
  isActive: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
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
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegação principal" className="hidden md:block">
      <ul className="flex items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-sm transition-colors duration-200",
                  active
                    ? "bg-surface-elevated font-semibold text-accent"
                    : "font-medium text-muted hover:bg-surface hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-accent" : "bg-transparent",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {NAV_ITEMS.map((item) => {
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
      </ul>
    </nav>
  );
}
