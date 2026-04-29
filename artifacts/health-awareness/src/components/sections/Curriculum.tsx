import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const curriculum = [
  {
    title: "نمط الحياة الصحي",
    description: "بناء عادات يومية مستدامة تعزز الحيوية وتؤخر الشيخوخة."
  },
  {
    title: "الأمراض المعدية",
    description: "فهم طرق انتقال العدوى وأساليب الوقاية الفعالة لحماية نفسك ومجتمعك."
  },
  {
    title: "الأمراض غير المعدية",
    description: "التعرف على الأمراض المزمنة مثل السكري وأمراض القلب وكيفية تقليل مخاطرها."
  },
  {
    title: "التوعية الصحية العامة",
    description: "نشر المعرفة وتصحيح المفاهيم الخاطئة حول الصحة في المجتمع."
  },
  {
    title: "محددات الصحة",
    description: "تحليل العوامل البيئية والاجتماعية والشخصية المؤثرة على صحتنا."
  }
];

export function Curriculum() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Decorative background art */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -z-10 opacity-30 dark:opacity-10 pointer-events-none">
        <img src="/wellness-art.png" alt="" className="w-96 max-w-full h-auto object-contain" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            خطة التعلّم
          </motion.h2>
          <p className="text-muted-foreground">خارطة طريق مبسطة لفهم شامل للصحة العامة</p>
        </div>

        <div className="relative border-r-2 border-primary/20 dark:border-primary/30 pr-8 ml-4 md:ml-0 md:pr-12">
          {curriculum.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative mb-12 last:mb-0"
            >
              {/* Timeline Dot */}
              <div className="absolute -right-[41px] md:-right-[57px] top-1 w-6 h-6 rounded-full bg-background border-4 border-primary flex items-center justify-center z-10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              
              <div className="bg-card/60 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
