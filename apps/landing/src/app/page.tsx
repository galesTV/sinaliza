import { Navbar } from "./components/layout/Navbar";
import { Hero } from "./components/sections/Hero";
import { Challenge } from "./components/sections/Challenge";
import { Proposal } from "./components/sections/Proposal";
import { Platform } from "./components/sections/Platform";
import { Alphabet } from "./components/sections/Alphabet";
import { Technology } from "./components/sections/Technology";
import { NextSteps } from "./components/sections/NextSteps";
import { FinalCTA } from "./components/sections/FinalCTA";
import { Footer } from "./components/layout/Footer";

export default function Home() {
  return (
    <>
      <div className="page-shell">
        <Navbar />

        <main id="conteudo">
          <Hero />

          <div className="section-divider" />

          <Challenge />

          <div className="section-divider" />

          <Proposal />

          <div className="section-divider" />

          <Platform />

          <div className="section-divider" />

          <Alphabet />

          <div className="section-divider" />

          <Technology />

          <div className="section-divider" />

          <NextSteps />

          <div className="section-divider" />

          <FinalCTA />
        </main>
      </div>

      <Footer />
    </>
  );
}
