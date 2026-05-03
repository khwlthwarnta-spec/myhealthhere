import { useRef, useState, useCallback, useEffect } from "react";

const SCROLL_SPEED = 5;

export function useAutoScrollTour() {
  const [isActive, setIsActive] = useState(false);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(false);

  const stopTour = useCallback(() => {
    activeRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    document.documentElement.classList.remove("auto-scrolling");
    setIsActive(false);
  }, []);

  const startTour = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsActive(true);
    document.documentElement.classList.add("auto-scrolling");

    const tick = () => {
      if (!activeRef.current) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 2) {
        activeRef.current = false;
        document.documentElement.classList.remove("auto-scrolling");
        setIsActive(false);
        rafRef.current = null;
        return;
      }

      window.scrollBy({ top: SCROLL_SPEED, behavior: "instant" });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      document.documentElement.classList.remove("auto-scrolling");
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { startTour, stopTour, isActive };
}
