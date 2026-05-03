import { useEffect } from "react";

export function useGlowObserver() {
  useEffect(() => {
    let activeCard: Element | null = null;

    const enterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (activeCard && activeCard !== entry.target) {
              activeCard.classList.remove("glow-active");
            }
            entry.target.classList.add("glow-active");
            activeCard = entry.target;
          }
        });
      },
      {
        // Trigger only when card reaches the middle 50% of the screen
        threshold: 0,
        rootMargin: "-50% 0px -50% 0px",
      }
    );

    const observe = () => {
      const cards = document.querySelectorAll(".glow-card");
      cards.forEach((card) => enterObserver.observe(card));
    };

    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      enterObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
