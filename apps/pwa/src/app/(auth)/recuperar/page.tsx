import type { Metadata } from "next";

import { RequestResetForm } from "@/components/auth/request-reset-form";
import { Eyebrow } from "@/components/eyebrow";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function RecuperarPage() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Eyebrow>Conta</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Recuperar senha
        </h1>
        <p className="text-sm leading-relaxed text-muted">
          Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos
          um link para redefinir a senha.
        </p>
      </div>
      <RequestResetForm />
    </>
  );
}
