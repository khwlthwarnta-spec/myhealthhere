import { useEffect } from "react";

export function useGlowObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("glow-active");
          } else {
            entry.target.classList.remove("glow-active");
          }
        });
      },
      {
        threshold: 0.25,
        rootMargin: "-5% 0px -5% 0px",
      }
    );

    const observe = () => {
      const cards = document.querySelectorAll(".glow-card");
      cards.forEach((card) => observer.observe(card));
    };

    observe();

    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
