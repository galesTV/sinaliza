"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";

/**
 * Signs out through the browser client (cookies cleared by @supabase/ssr)
 * and lands on the public home page. `router.refresh()` re-renders any
 * server components so no authenticated UI lingers.
 */
export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    if (pending) return;
    setPending(true);
    try {
      if (isSupabaseConfigured()) {
        const client = createClient();
        try {
          const { error } = await client.auth.signOut();
          if (error) throw error;
        } catch {
          // Revocation failed (offline/server error): clear the local
          // session anyway so no credentials linger on this device.
          await client.auth.signOut({ scope: "local" }).catch(() => {});
        }
      }
      router.replace("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className={cn("btn-secondary", className)}
    >
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}
