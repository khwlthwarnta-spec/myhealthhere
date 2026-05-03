import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Determinants } from "@/components/sections/Determinants";
import { Curriculum } from "@/components/sections/Curriculum";
import { Outcomes } from "@/components/sections/Outcomes";
import { DiscoverYourself } from "@/components/sections/DiscoverYourself";
import { useGlowObserver } from "@/hooks/useGlowObserver";

export default function Home() {
  useGlowObserver();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Determinants />
        <Curriculum />
        <Outcomes />
        <DiscoverYourself />
      </main>
      <Footer />
    </div>
  );
}
