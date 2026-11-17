import type { Metadata } from "next";

import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Eyebrow } from "@/components/eyebrow";

export const metadata: Metadata = {
  title: "Nova senha",
};

export default function NovaSenhaPage() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Eyebrow>Conta</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Definir nova senha
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Escolha uma nova senha para a sua conta.
        </p>
      </div>
      <UpdatePasswordForm />
    </>
  );
}
