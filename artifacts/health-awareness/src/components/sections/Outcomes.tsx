import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Target, AlertTriangle, TrendingUp } from "lucide-react";

function Counter({ end, label, duration = 2 }: { end: number, label: string, duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
        {count}%
      </div>
      <div className="text-sm md:text-base text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

const outcomes = [
  {
    icon: <Target className="w-10 h-10 text-primary" />,
    title: "فهم الصحة الشخصية",
    description: "إدراك عميق لاحتياجات جسمك وقدراته.",
    stat: 95,
    statLabel: "زيادة في الوعي الذاتي"
  },
  {
    icon: <AlertTriangle className="w-10 h-10 text-secondary" />,
    title: "التعرّف على المخاطر الصحية",
    description: "القدرة على التنبؤ بالمشكلات قبل حدوثها والوقاية منها.",
    stat: 80,
    statLabel: "انخفاض في المخاطر"
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-accent-foreground" />,
    title: "تحسين العادات اليومية",
    description: "تطبيق خطوات عملية لبناء نمط حياة مستدام.",
    stat: 100,
    statLabel: "تغيير إيجابي"
  }
];

export function Outcomes() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            نتائج التعلّم
          </motion.h2>
          <p className="text-muted-foreground">ماذا ستحقق بنهاية هذا الفصل؟</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {outcomes.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
            >
              <Card className="h-full border-none shadow-lg bg-background/50 hover:bg-background transition-colors duration-300">
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="mb-6 p-4 rounded-2xl bg-muted/50">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground mb-8">{item.description}</p>
                  
                  <div className="mt-auto w-full pt-6 border-t border-border/50">
                    <Counter end={item.stat} label={item.statLabel} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
