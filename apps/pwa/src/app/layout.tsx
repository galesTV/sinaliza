import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import { AppShell } from "@/components/app-shell";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: {
    default: "Sinaliza — Aprender Libras. Praticar. Evoluir.",
    template: "%s | Sinaliza",
  },
  description:
    "Plataforma de aprendizagem de Língua Brasileira de Sinais: alfabeto, vocabulário, exercícios e progresso.",
  applicationName: "Sinaliza",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
