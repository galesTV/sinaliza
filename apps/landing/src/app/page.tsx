import { Navbar } from "./components/layout/Navbar";
import { Hero } from "./components/sections/Hero";
import { Challenge } from "./components/sections/Challenge";
import { Solution } from "./components/sections/Solution";
import { HowItWorks } from "./components/sections/HowItWorks";
import { Technology } from "./components/sections/Technology";
import { Roadmap } from "./components/sections/Roadmap";
import { FinalCTA } from "./components/sections/FinalCTA";
import { Footer } from "./components/layout/Footer";

export default function Home() {
  return (
    <>
      <main className="page-shell">
        <Navbar />

        <Hero />

        <div className="section-divider" />

        <Challenge />

        <div className="section-divider" />

        <Solution />

        <div className="section-divider" />

        <HowItWorks />

        <div className="section-divider" />

        <Technology />

        <div className="section-divider" />

        <Roadmap />

        <div className="section-divider" />

        <FinalCTA />
      </main>

      <Footer />
    </>
  );
}
