import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  const scrollToNext = () => {
    document.getElementById("determinants")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-background overflow-hidden">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            x: [0, -15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-20 left-[10%] w-80 h-80 bg-secondary/10 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-20 dark:opacity-10 mix-blend-overlay"></div>
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
            افهم محددات الصحة،<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">ابنِ حياة أفضل</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            رحلتك نحو الوعي الصحي تبدأ هنا. اكتشف كيف تؤثر عاداتك اليومية، بيئتك، ونمط حياتك على صحتك العامة، وتعلم كيف تتخذ قرارات تبني مستقبلاً أقوى.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button 
              size="lg" 
              className="rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-primary text-primary-foreground"
              onClick={scrollToNext}
            >
              ابدأ الاستكشاف
              <ArrowLeft className="mr-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
