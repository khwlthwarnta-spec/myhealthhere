import { useEffect } from "react";

export function useGlowObserver() {
  useEffect(() => {
    let activeCard: Element | null = null;

    // Observer for entering the center zone — triggers glow
    const enterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Remove glow from previous active card
            if (activeCard && activeCard !== entry.target) {
              activeCard.classList.remove("glow-active");
            }
            entry.target.classList.add("glow-active");
            activeCard = entry.target;
          }
        });
      },
      {
        // Only trigger when card is roughly centered on screen
        threshold: 0,
        rootMargin: "-30% 0px -30% 0px",
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
