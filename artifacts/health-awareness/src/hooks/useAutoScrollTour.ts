import { useRef, useState, useCallback } from "react";

const SECTION_IDS = ["determinants", "curriculum", "outcomes", "discover"] as const;
const NAVBAR_OFFSET = 72;
const CHARS_SCALE = 4;
const MIN_DURATION_MS = 1400;
const MAX_DURATION_MS = 7000;

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const id = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { clearTimeout(id); reject(new DOMException("Aborted", "AbortError")); });
  });
}

function smoothScrollTo(
  targetY: number,
  duration: number,
  signal: AbortSignal,
  easeFn: (t: number) => number = easeInOutCubic
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const startY = window.scrollY;
    const distance = targetY - startY;
    if (Math.abs(distance) < 2) { resolve(); return; }
    const startTime = performance.now();

    function frame(now: number) {
      if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
      const elapsed = Math.min(now - startTime, duration);
      const progress = easeFn(elapsed / duration);
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

function setFocusedSection(id: string | null) {
  SECTION_IDS.forEach(sid => {
    const el = document.getElementById(sid);
    if (el) el.classList.toggle("tour-focused", sid === id);
  });
  if (id) {
    document.documentElement.classList.add("tour-active");
  } else {
    document.documentElement.classList.remove("tour-active");
    SECTION_IDS.forEach(sid => document.getElementById(sid)?.classList.remove("tour-focused"));
  }
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

        setFocusedSection(id);
        setProgress({ sectionIndex: i, sectionId: id, totalSections: SECTION_IDS.length });

        const textLength = measureTextLength(el);
        const sectionTop = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET;
        const sectionHeight = el.offsetHeight;
        const viewportH = window.innerHeight;

        // Phase 1: Quick snap to top of section (speed based on distance)
        const distToTop = Math.abs(sectionTop - window.scrollY);
        const snapDuration = Math.max(400, Math.min(900, distToTop * 0.8));
        await smoothScrollTo(sectionTop, snapDuration, controller.signal, easeOutQuart);

        // Brief pause to let eyes focus
        await sleep(220, controller.signal);

        // Phase 2: Slowly scroll THROUGH the section based on text length
        const scrollableHeight = Math.max(0, sectionHeight - viewportH + NAVBAR_OFFSET + 48);

        if (scrollableHeight > 60) {
          // Long section: scroll through all content
          const scrollDuration = Math.min(
            MAX_DURATION_MS,
            Math.max(MIN_DURATION_MS, MIN_DURATION_MS + textLength * CHARS_SCALE)
          );
          await smoothScrollTo(sectionTop + scrollableHeight, scrollDuration, controller.signal, easeInOutCubic);
          await sleep(280, controller.signal);
        } else {
          // Short section: pause proportional to content density
          const pauseMs = Math.min(3500, Math.max(1200, textLength * 1.8));
          await sleep(pauseMs, controller.signal);
        }
      }
    } catch {
      // Aborted by user
    } finally {
      setFocusedSection(null);
      setIsActive(false);
      setProgress(null);
      abortRef.current = null;
    }
  }, [isActive]);

  const stopTour = useCallback(() => {
    abortRef.current?.abort();
    setFocusedSection(null);
    setIsActive(false);
    setProgress(null);
  }, []);

  return { startTour, stopTour, isActive, progress };
}
