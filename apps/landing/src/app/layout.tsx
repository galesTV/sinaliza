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

const siteTitle = "Sinaliza — Aprenda Libras, pratique e evolua";

const siteDescription =
  "Descubra uma nova forma de aprender Língua Brasileira de Sinais. Estude o alfabeto, explore vocabulário e desenvolva sua prática com uma experiência visual e interativa.";

export const metadata: Metadata = {
  title: {
    default: siteTitle,
    template: "%s | Sinaliza",
  },
  description: siteDescription,
  applicationName: "Sinaliza",
  creator: "Sinaliza",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName: "Sinaliza",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
