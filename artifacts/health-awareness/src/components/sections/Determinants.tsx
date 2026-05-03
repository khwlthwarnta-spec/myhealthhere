import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Activity, Leaf, Apple, Brain, Sun } from "lucide-react";

const determinants = [
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "الصحة الشخصية",
    description: "العوامل الوراثية والتاريخ الصحي العائلي الذي يشكل أساس بنيتك الجسدية."
  },
  {
    icon: <Activity className="w-8 h-8 text-secondary" />,
    title: "نمط الحياة",
    description: "الخيارات اليومية من النوم والعمل والترفيه التي تؤثر بشكل مباشر على جودة حياتك."
  },
  {
    icon: <Leaf className="w-8 h-8 text-green-500" />,
    title: "البيئة",
    description: "المحيط الذي تعيش فيه، بما في ذلك جودة الهواء والماء والمساحات الخضراء المتاحة."
  },
  {
    icon: <Apple className="w-8 h-8 text-red-400" />,
    title: "التغذية",
    description: "ما تستهلكه يومياً من أطعمة ومشروبات تبني خلايا جسمك وتزوده بالطاقة."
  },
  {
    icon: <Sun className="w-8 h-8 text-yellow-500" />,
    title: "النشاط البدني",
    description: "الحركة وممارسة الرياضة التي تعزز قوة العضلات وكفاءة الجهاز الدوري."
  },
  {
    icon: <Brain className="w-8 h-8 text-purple-400" />,
    title: "الصحة النفسية",
    description: "حالتك العاطفية وقدرتك على التعامل مع ضغوط الحياة وبناء علاقات إيجابية."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export function Determinants() {
  return (
    <section id="determinants" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            محددات الصحة
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            صحتك ليست مجرد غياب للمرض، بل هي نتاج تفاعل معقد لعدة عوامل في حياتك. دعنا نستكشف أهم هذه المحددات.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {determinants.map((item, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="glow-card h-full bg-card/50 backdrop-blur-sm border-white/20 dark:border-white/10 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="p-4 rounded-full bg-background/80 shadow-sm mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
