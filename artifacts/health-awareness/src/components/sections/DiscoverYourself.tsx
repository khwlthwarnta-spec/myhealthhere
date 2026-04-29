import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink, Sparkles, Loader2, Activity, Flame, Info, Apple, Utensils } from "lucide-react";

const formSchema = z.object({
  city: z.string().min(2, "الرجاء إدخال اسم مدينة صحيح"),
  weight: z.number().min(30, "الوزن غير منطقي").max(300, "الوزن غير منطقي"),
  height: z.number().min(100, "الطول غير منطقي").max(250, "الطول غير منطقي"),
  age: z.number().min(10, "العمر يجب أن يكون أكثر من 10").max(100, "العمر غير منطقي"),
});

type FormData = z.infer<typeof formSchema>;

export function DiscoverYourself() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [season, setSeason] = useState<"صيف" | "شتاء">("صيف");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
    }
  });

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    if ([11, 12, 1, 2, 3].includes(month)) {
      setSeason("شتاء");
    } else {
      setSeason("صيف");
    }
  }, []);

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate loading
    setTimeout(() => {
      const heightInMeters = data.height / 100;
      const bmi = data.weight / (heightInMeters * heightInMeters);
      
      let bmiClass = "";
      if (bmi < 18.5) bmiClass = "نقص وزن";
      else if (bmi < 25) bmiClass = "طبيعي";
      else if (bmi < 30) bmiClass = "زيادة وزن";
      else bmiClass = "سمنة";

      // BMR Mifflin-St Jeor (assuming average for generic calculation, typically varies by gender)
      // We'll use a generic average multiplier
      const bmr = (10 * data.weight) + (6.25 * data.height) - (5 * data.age) + 5; 
      const calories = Math.round(bmr * 1.55); // moderate activity

      setResults({
        bmi: bmi.toFixed(1),
        bmiClass,
        calories,
        data
      });
      
      setIsSubmitting(false);
    }, 2000);
  };

  const resetForm = () => {
    setResults(null);
    form.reset();
  };

  return (
    <section className="py-32 relative flex items-center justify-center min-h-[60vh]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-primary/5" />
      
      <div className="container mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) setTimeout(resetForm, 300);
            setIsOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="relative overflow-hidden group rounded-full px-12 py-8 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-15px_hsl(var(--primary))] transition-all duration-500 hover:-translate-y-2"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  اكتشف نفسك
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 border-none bg-background/95 backdrop-blur-xl">
              <div className="p-6 md:p-8">
                <DialogTitle className="text-2xl font-bold mb-2">تحليلك الصحي الشخصي</DialogTitle>
                <DialogDescription className="text-muted-foreground mb-6">
                  أدخل بياناتك للحصول على نصائح مخصصة لنمط حياتك وتغذيتك.
                </DialogDescription>

                <AnimatePresence mode="wait">
                  {!results && !isSubmitting && (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={form.handleSubmit(onSubmit)} 
                      className="space-y-6 text-right"
                    >
                      <div className="flex justify-end mb-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium">
                          الموسم الحالي: {season} {season === "صيف" ? "☀️" : "❄️"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city">المدينة</Label>
                          <Input id="city" {...form.register("city")} className="bg-background/50 text-right" placeholder="مثال: الرياض" />
                          {form.formState.errors.city && <p className="text-xs text-destructive">{form.formState.errors.city.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">العمر</Label>
                          <Input id="age" type="number" {...form.register("age", { valueAsNumber: true })} className="bg-background/50 text-right" placeholder="بالسنوات" />
                          {form.formState.errors.age && <p className="text-xs text-destructive">{form.formState.errors.age.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">الوزن (كغ)</Label>
                          <Input id="weight" type="number" step="0.1" {...form.register("weight", { valueAsNumber: true })} className="bg-background/50 text-right" placeholder="مثال: 70" />
                          {form.formState.errors.weight && <p className="text-xs text-destructive">{form.formState.errors.weight.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">الطول (سم)</Label>
                          <Input id="height" type="number" {...form.register("height", { valueAsNumber: true })} className="bg-background/50 text-right" placeholder="مثال: 175" />
                          {form.formState.errors.height && <p className="text-xs text-destructive">{form.formState.errors.height.message}</p>}
                        </div>
                      </div>

                      <Button type="submit" className="w-full py-6 text-lg rounded-xl mt-4">
                        احصل على تحليلك الشخصي
                      </Button>
                    </motion.form>
                  )}

                  {isSubmitting && (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 space-y-4"
                    >
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-lg text-muted-foreground animate-pulse">جاري تحليل بياناتك...</p>
                    </motion.div>
                  )}

                  {results && !isSubmitting && (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-8 text-right"
                    >
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 p-4 rounded-2xl flex flex-col items-center text-center">
                          <Activity className="w-8 h-8 text-primary mb-2" />
                          <div className="text-sm text-muted-foreground mb-1">مؤشر كتلة الجسم (BMI)</div>
                          <div className="text-2xl font-bold text-primary">{results.bmi}</div>
                          <div className="text-sm font-medium mt-1 px-2 py-0.5 bg-background rounded-full">{results.bmiClass}</div>
                        </div>
                        <div className="bg-secondary/10 p-4 rounded-2xl flex flex-col items-center text-center">
                          <Flame className="w-8 h-8 text-secondary mb-2" />
                          <div className="text-sm text-muted-foreground mb-1">الاحتياج اليومي</div>
                          <div className="text-2xl font-bold text-secondary">{results.calories}</div>
                          <div className="text-sm font-medium mt-1">سُعرة حرارية</div>
                        </div>
                      </div>

                      {/* Nutrition Plan */}
                      <div className="bg-card border rounded-2xl p-5 shadow-sm">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                          <Utensils className="w-5 h-5 text-primary" />
                          خطة التغذية ({season})
                        </h4>
                        <ul className="space-y-3 mb-6">
                          {season === "شتاء" ? (
                            <>
                              <li className="flex items-start gap-2 text-sm"><span className="text-primary font-bold">إفطار:</span> شوفان دافئ مع المكسرات والقرفة لتعزيز الدفء والطاقة.</li>
                              <li className="flex items-start gap-2 text-sm"><span className="text-primary font-bold">غداء:</span> حساء خضار دافئ مع بروتين (دجاج/عدس) لتقوية المناعة.</li>
                              <li className="flex items-start gap-2 text-sm"><span className="text-primary font-bold">عشاء:</span> خضار مشوية مع أسماك غنية بأوميغا-3 (لفيتامين د).</li>
                              <li className="flex items-start gap-2 text-sm"><span className="text-secondary font-bold">وجبات خفيفة:</span> حمضيات (برتقال، يوسفي) ومشروبات دافئة كالبابونج.</li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start gap-2 text-sm"><span className="text-primary font-bold">إفطار:</span> زبادي مع الفواكه الطازجة الصيفية والبطيخ للترطيب.</li>
                              <li className="flex items-start gap-2 text-sm"><span className="text-primary font-bold">غداء:</span> سلطة خضراء كبيرة مع بروتين مشوي خفيف.</li>
                              <li className="flex items-start gap-2 text-sm"><span className="text-primary font-bold">عشاء:</span> وجبة خفيفة من الجبن والخضار المرطبة كالخيار.</li>
                              <li className="flex items-start gap-2 text-sm"><span className="text-secondary font-bold">وجبات خفيفة:</span> عصائر طبيعية باردة، وفواكه غنية بالماء.</li>
                            </>
                          )}
                        </ul>

                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="sources" className="border-none">
                            <AccordionTrigger className="bg-muted/50 px-4 rounded-lg hover:bg-muted/80 hover:no-underline py-3 text-sm">
                              المصادر والمراجع
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 px-2 space-y-3">
                              <a href="https://www.who.int" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                <ExternalLink className="w-4 h-4" />
                                منظمة الصحة العالمية (WHO)
                              </a>
                              <a href="https://www.hsph.harvard.edu" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                <ExternalLink className="w-4 h-4" />
                                هارفارد للصحة العامة
                              </a>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>

                      {/* Lifestyle Advice */}
                      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5">
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-accent-foreground">
                          <Info className="w-5 h-5" />
                          نصائح لنمط حياتك
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          بناءً على عمرك ({results.data.age} سنة)، يُنصح بالتركيز على جودة النوم (8 ساعات) وممارسة نشاط بدني معتدل لمدة 150 دقيقة أسبوعياً للحفاظ على صحة القلب وبناء العضلات.
                        </p>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="sources-lifestyle" className="border-none">
                            <AccordionTrigger className="bg-background px-4 rounded-lg hover:bg-background/80 hover:no-underline py-3 text-sm">
                              المصادر
                            </AccordionTrigger>
                            <AccordionContent className="pt-4 px-2 space-y-3">
                              <a href="https://www.mayoclinic.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                <ExternalLink className="w-4 h-4" />
                                مايو كلينك (Mayo Clinic)
                              </a>
                              <a href="https://www.cdc.gov" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                                <ExternalLink className="w-4 h-4" />
                                مراكز السيطرة على الأمراض (CDC)
                              </a>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                      
                      <Button variant="outline" className="w-full" onClick={resetForm}>
                        إعادة الحساب
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </section>
  );
}
