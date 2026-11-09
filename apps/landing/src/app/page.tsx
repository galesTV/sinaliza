import { Navbar } from "./components/layout/Navbar";
import { Hero } from "./components/sections/Hero";
import { Challenge } from "./components/sections/Challenge";
import { Solution } from "./components/sections/Solution";

export default function Home() {
  return (
    <main className="page-shell">
      <Navbar />

      <Hero />

      <div className="section-divider" />

      <Challenge />

      <div className="section-divider" />

      <Solution />
    </main>
  );
}
