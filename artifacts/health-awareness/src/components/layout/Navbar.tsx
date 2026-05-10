import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useSpring } from "framer-motion";
import { HealthLogo } from "./HealthLogo";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const isDarkMode = document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b shadow-sm" : "bg-transparent"
      }`}
    >
      <motion.div
        className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-primary to-violet-500 origin-left"
        style={{ scaleX }}
      />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HealthLogo />
          <a
            href="https://api.codemagic.io//artifacts/.eJwVwcuWQzAAANB_6d45TSvKoosQgzKpeLazcVDUq0SRmq-fM_fuKvRPZYiAQfVFCRO2RXpwQIlyUmTghg2b5PvDfoygyI6pO28TTU3XI4jJdA82_2N6LJlsPBscYL3WtaT81q6taA99E2lDd1FDNFqjNxa30OrYYn9agebHlyJJl-sEl9NvDBbHyHvQ8lcEY_HJin3OeAUjuMxcFvOe1Flervs3PyBNnIIMvVf400bvTvEzX0vrLsXPhSTloaaeIBuSjbnYgHaIheLKc1IH5AS92Rmw08rZFiv8VuOQryCAX0zRYdWnOuZmuMQwDhgNVUtz7ird0NqslkvP590fvjVhhg.jSBZ2A9uoHXeg44xaI-aHJAt9Yg"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3ddc84]/50 bg-[#3ddc84]/10 hover:bg-[#3ddc84]/20 text-xs font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#3ddc84" className="flex-shrink-0">
              <path d="M17.523 15.341c-.609 0-1.104.497-1.104 1.104 0 .608.495 1.103 1.104 1.103.608 0 1.103-.495 1.103-1.103 0-.607-.495-1.104-1.103-1.104m-11.046 0c-.608 0-1.104.497-1.104 1.104 0 .608.496 1.103 1.104 1.103.608 0 1.103-.495 1.103-1.103 0-.607-.495-1.104-1.103-1.104m11.41-6.023l1.944-3.367a.405.405 0 0 0-.148-.552.406.406 0 0 0-.553.149L17.13 8.992C15.823 8.348 14.351 7.988 12.787 7.988c-1.565 0-3.038.36-4.343 1.004L6.444 5.548a.406.406 0 0 0-.553-.15.406.406 0 0 0-.149.553l1.945 3.367C4.738 10.643 2.958 13.038 2.958 15.836h18.084c0-2.798-1.78-5.193-4.685-6.518"/>
            </svg>
            حمّل التطبيق
          </a>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
