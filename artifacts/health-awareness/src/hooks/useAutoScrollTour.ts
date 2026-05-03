import { useRef, useState, useCallback } from "react";

const SECTION_IDS = ["determinants", "curriculum", "outcomes", "discover"] as const;

const NAVBAR_OFFSET = 72;
const MIN_DURATION_MS = 1000;
const MAX_DURATION_MS = 5500;
const CHARS_SCALE = 3.2;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(id); reject(new DOMException("Aborted", "AbortError")); });
  });
}

function smoothScrollTo(targetY: number, duration: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) { resolve(); return; }
    const startTime = performance.now();

    function frame(now: number) {
      if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
      const elapsed = Math.min(now - startTime, duration);
      const progress = easeInOutCubic(elapsed / duration);
      window.scrollTo(0, startY + distance * progress);
      if (elapsed < duration) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function measureTextLength(el: HTMLElement): number {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let text = "";
  let node: Node | null;
  while ((node = walker.nextNode())) {
    text += node.textContent ?? "";
  }
  return text.replace(/\s+/g, " ").trim().length;
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

  const startTour = useCallback(async () => {
    if (isActive) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsActive(true);

    try {
      for (let i = 0; i < SECTION_IDS.length; i++) {
        const id = SECTION_IDS[i];
        if (controller.signal.aborted) break;

        const el = document.getElementById(id);
        if (!el) continue;

        setProgress({ sectionIndex: i, sectionId: id, totalSections: SECTION_IDS.length });

        const textLength = measureTextLength(el);
        const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET);
        const scrollDuration = Math.min(
          MAX_DURATION_MS,
          Math.max(MIN_DURATION_MS, MIN_DURATION_MS + textLength * CHARS_SCALE)
        );

        await smoothScrollTo(targetY, scrollDuration, controller.signal);
        await sleep(350, controller.signal);
      }
    } catch {
    } finally {
      setIsActive(false);
      setProgress(null);
      abortRef.current = null;
    }
  }, [isActive]);

  const stopTour = useCallback(() => {
    abortRef.current?.abort();
    setIsActive(false);
    setProgress(null);
  }, []);

  return { startTour, stopTour, isActive, progress };
}
