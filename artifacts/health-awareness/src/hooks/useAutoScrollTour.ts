import { useRef, useState, useCallback } from "react";

const SECTION_IDS = ["determinants", "curriculum", "outcomes", "discover"] as const;

function setFocusedSection(id: string | null) {
  SECTION_IDS.forEach((sid) => {
    const el = document.getElementById(sid);
    if (el) el.classList.toggle("tour-focused", sid === id);
  });
  if (id) document.documentElement.classList.add("tour-active");
  else document.documentElement.classList.remove("tour-active");
}

export type AutoScrollProgress = {
  sectionIndex: number;
  sectionId: string;
  totalSections: number;
};

export function useAutoScrollTour() {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState<AutoScrollProgress | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const startTour = useCallback(() => {
    if (isActive) return;
    setIsActive(true);
    setProgress({ sectionIndex: 0, sectionId: "determinants", totalSections: SECTION_IDS.length });
    setFocusedSection("determinants");
  }, [isActive]);

  const stopTour = useCallback(() => {
    abortRef.current?.abort();
    setFocusedSection(null);
    setIsActive(false);
    setProgress(null);
  }, []);

  return { startTour, stopTour, isActive, progress };
}
