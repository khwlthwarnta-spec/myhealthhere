import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Square } from "lucide-react";
import { useAutoScrollTour } from "@/hooks/useAutoScrollTour";

const SECTION_LABELS: Record<string, string> = {
  determinants: "محددات الصحة",
  curriculum: "خطة التعلّم",
  outcomes: "نتائج التعلّم",
  discover: "اكتشف نفسك",
};

export function Hero() {
  const { startTour, stopTour, isActive, progress } = useAutoScrollTour();

  const handleDiscover = () => {
    if (isActive) { stopTour(); return; }
    startTour();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], x: [0, -15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-[10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 dark:opacity-10 mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-4 z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            افهم محددات الصحة،<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              ابنِ حياة أفضل
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            رحلتك نحو الوعي الصحي تبدأ هنا. اكتشف كيف تؤثر عاداتك اليومية، بيئتك، ونمط حياتك على صحتك
            العامة، وتعلم كيف تتخذ قرارات تبني مستقبلاً أقوى.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <Button
              size="lg"
              onClick={handleDiscover}
              className={`rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${
                isActive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isActive ? (
                <>
                  <Square className="mr-2 h-5 w-5 fill-current" />
                  إيقاف التمرير
                </>
              ) : (
                <>
                  ابدأ الاستكشاف
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </>
              )}
            </Button>

            {/* Progress indicator shown only during tour */}
            <AnimatePresence>
              {isActive && progress && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <span>التمرير نحو: <strong className="text-foreground">{SECTION_LABELS[progress.sectionId]}</strong></span>
                  </div>
                  {/* Dots progress */}
                  <div className="flex gap-2">
                    {Array.from({ length: progress.totalSections }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i < progress.sectionIndex
                            ? "bg-primary w-6"
                            : i === progress.sectionIndex
                            ? "bg-primary w-10"
                            : "bg-muted w-6"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating stop pill — visible while scrolling and hero is out of viewport */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={stopTour}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-background/90 backdrop-blur border border-border shadow-xl text-sm font-semibold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
            >
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-primary"
              />
              {progress ? SECTION_LABELS[progress.sectionId] : "جاري التمرير"}
              <span className="mx-1 text-muted-foreground">·</span>
              <Square className="w-3.5 h-3.5 fill-current" />
              إيقاف
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
