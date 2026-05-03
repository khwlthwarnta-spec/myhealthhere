import { useRef, useState, useCallback, useEffect } from "react";

const SCROLL_SPEED = 3.5;

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
    setIsActive(false);
  }, []);

  const startTour = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsActive(true);

    const tick = () => {
      if (!activeRef.current) return;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (window.scrollY >= maxScroll - 2) {
        activeRef.current = false;
        setIsActive(false);
        rafRef.current = null;
        return;
      }

      window.scrollBy(0, SCROLL_SPEED);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { startTour, stopTour, isActive };
}
