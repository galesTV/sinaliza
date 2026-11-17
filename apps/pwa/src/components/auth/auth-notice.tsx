"use client";

import { cn } from "@/lib/utils";

/**
 * Live region for form-level auth messages (errors from redirects or
 * submit failures). `role="alert"` announces changes without moving focus.
 */
export function AuthNotice({ message }: { message: string | null }) {
  return (
    <div aria-live="assertive">
      {message && (
        <div
          role="alert"
          className={cn(
            "rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3",
            "text-sm leading-relaxed text-foreground",
          )}
        >
          {message}
        </div>
      )}
    </div>
  );
}
