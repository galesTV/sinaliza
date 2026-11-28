"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { getBrowserThemeStore } from "@/lib/theme-store";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

import {
  IconCheck,
  IconChevronDown,
  IconMonitor,
  IconMoon,
  IconSun,
} from "./icons";

const OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof IconSun;
}> = [
  { value: "light", label: "Claro", icon: IconSun },
  { value: "dark", label: "Escuro", icon: IconMoon },
  { value: "system", label: "Sistema", icon: IconMonitor },
];

function subscribeTheme(onStoreChange: () => void) {
  return getBrowserThemeStore()?.subscribe(onStoreChange) ?? (() => {});
}

function getClientThemeSnapshot() {
  return getBrowserThemeStore()?.getSnapshot() ?? null;
}

function getServerThemeSnapshot() {
  return null;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function ThemeSelect() {
  const snapshot = useSyncExternalStore(
    subscribeTheme,
    getClientThemeSnapshot,
    getServerThemeSnapshot,
  );
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const selectedIndex = Math.max(
    0,
    OPTIONS.findIndex((option) => option.value === snapshot?.preference),
  );
  const selected = snapshot ? OPTIONS[selectedIndex] : null;
  const SelectedIcon = selected?.icon ?? IconMonitor;

  useIsomorphicLayoutEffect(() => {
    getBrowserThemeStore()?.reapply();
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    itemRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  function openMenu(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function closeMenu({ returnFocus = false } = {}) {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }

  function selectPreference(preference: ThemePreference) {
    getBrowserThemeStore()?.setPreference(preference);
    closeMenu({ returnFocus: true });
  }

  function handleButtonKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (open) {
        setActiveIndex((activeIndex + 1) % OPTIONS.length);
      } else {
        openMenu();
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (open) {
        setActiveIndex((activeIndex + OPTIONS.length - 1) % OPTIONS.length);
      } else {
        openMenu(OPTIONS.length - 1);
      }
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      closeMenu({ returnFocus: true });
    }
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu({ returnFocus: true });
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((activeIndex + 1) % OPTIONS.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((activeIndex + OPTIONS.length - 1) % OPTIONS.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(OPTIONS.length - 1);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={
          selected ? `Tema: ${selected.label}` : "Selecionar tema"
        }
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[10px] border border-border bg-control-quiet px-2.5 text-sm font-medium text-muted transition-colors duration-200 hover:bg-control-quiet-hover hover:text-foreground sm:px-3"
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={handleButtonKeyDown}
      >
        <SelectedIcon className="h-4 w-4" aria-hidden="true" />
        <span className="max-w-18 truncate">{selected?.label ?? "Tema"}</span>
        <IconChevronDown
          className={cn(
            "hidden h-3.5 w-3.5 transition-transform duration-200 sm:block",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Preferência de tema"
          className="absolute right-0 top-[calc(100%+0.45rem)] z-50 min-w-44 rounded-xl border border-border bg-surface-elevated p-1.5 text-foreground shadow-[var(--shadow-elevated)]"
          onKeyDown={handleMenuKeyDown}
        >
          {OPTIONS.map((option, index) => {
            const checked = option.value === snapshot?.preference;
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                tabIndex={index === activeIndex ? 0 : -1}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150",
                  checked
                    ? "bg-control-quiet-hover font-semibold text-accent"
                    : "font-medium text-muted hover:bg-control-quiet hover:text-foreground",
                )}
                onClick={() => selectPreference(option.value)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="flex-1">{option.label}</span>
                {checked ? (
                  <IconCheck className="h-4 w-4" aria-hidden="true" />
                ) : null}
                {checked ? <span className="sr-only">selecionado</span> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
