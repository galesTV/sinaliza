"use client";

import { cn } from "@/lib/utils";

interface AuthFieldProps {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  inputMode?: "email" | "text";
  disabled?: boolean;
}

/**
 * Labeled auth input with accessible error wiring (`aria-invalid` +
 * `aria-describedby`) and visible validation text — no color-only cues.
 */
export function AuthField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  error,
  hint,
  inputMode,
  disabled,
}: AuthFieldProps) {
  const describedBy = [
    error ? `${id}-erro` : null,
    hint ? `${id}-dica` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "min-h-11 w-full rounded-xl border bg-surface px-4 text-sm text-foreground outline-none transition-colors duration-200 placeholder:text-muted/70",
          error
            ? "border-destructive/70"
            : "border-border focus:border-accent/60",
          disabled && "opacity-60",
        )}
      />
      {hint && (
        <p id={`${id}-dica`} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-erro`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
