import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
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
    default: "Sinaliza — Aprender Libras transforma conexões",
    template: "%s | Sinaliza",
  },
  description:
    "Uma nova experiência para aprender Língua Brasileira de Sinais. Aprenda, pratique e evolua com uma jornada visual e interativa.",
  applicationName: "Sinaliza",
  openGraph: {
    title: "Sinaliza — Aprender Libras transforma conexões",
    description:
      "Uma experiência visual e interativa para aprender Língua Brasileira de Sinais.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
