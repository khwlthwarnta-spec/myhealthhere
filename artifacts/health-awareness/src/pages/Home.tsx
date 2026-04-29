import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Determinants } from "@/components/sections/Determinants";
import { Curriculum } from "@/components/sections/Curriculum";
import { Outcomes } from "@/components/sections/Outcomes";
import { DiscoverYourself } from "@/components/sections/DiscoverYourself";
import { AIAssistant } from "@/components/sections/AIAssistant";

export default function Home() {
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
      <AIAssistant />
    </div>
  );
}
