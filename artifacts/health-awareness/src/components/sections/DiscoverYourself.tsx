import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ExternalLink,
  Sparkles,
  Loader2,
  Activity,
  Flame,
  Apple,
  Utensils,
  Coffee,
  Soup,
  Cookie,
  Droplets,
  Moon,
  Dumbbell,
  HeartPulse,
  Sun,
  Snowflake,
  Download,
  MapPin,
  User2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const formSchema = z.object({
  city: z.string().min(2, "الرجاء إدخال اسم مدينة صحيح"),
  gender: z.enum(["male", "female"], {
    required_error: "الرجاء اختيار الجنس",
  } as any),
  weight: z
    .number({ invalid_type_error: "أدخل رقماً صحيحاً" })
    .min(30, "الوزن غير منطقي")
    .max(300, "الوزن غير منطقي"),
  height: z
    .number({ invalid_type_error: "أدخل رقماً صحيحاً" })
    .min(100, "الطول غير منطقي")
    .max(250, "الطول غير منطقي"),
  age: z
    .number({ invalid_type_error: "أدخل رقماً صحيحاً" })
    .min(10, "العمر يجب أن يكون أكثر من 10")
    .max(100, "العمر غير منطقي"),
});

type FormData = z.infer<typeof formSchema>;

type Meal = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  description: string;
};

type Results = {
  bmi: number;
  bmiClass: string;
  bmiColor: string;
  bmiPercent: number;
  bmr: number;
  calories: number;
  water: number;
  sleep: string;
  exercise: string;
  meals: Meal[];
  seasonalAdvice: string;
  data: FormData;
};

const SOURCES = [
  { name: "منظمة الصحة العالمية (WHO)", url: "https://www.who.int" },
  { name: "مايو كلينك (Mayo Clinic)", url: "https://www.mayoclinic.org" },
  { name: "هارفارد للصحة العامة", url: "https://www.hsph.harvard.edu" },
  { name: "مراكز السيطرة على الأمراض (CDC)", url: "https://www.cdc.gov" },
  { name: "الجمعية الأمريكية للقلب", url: "https://www.heart.org" },
];

export function DiscoverYourself() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [season, setSeason] = useState<"صيف" | "شتاء">("صيف");
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      gender: undefined as any,
    },
  });

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    if ([11, 12, 1, 2, 3].includes(month)) {
      setSeason("شتاء");
    } else {
      setSeason("صيف");
    }
  }, []);

  const buildMeals = (
    isWinter: boolean,
    gender: "male" | "female",
  ): Meal[] => {
    if (isWinter) {
      return [
        {
          icon: Coffee,
          label: "الإفطار",
          title: "شوفان دافئ بالقرفة والمكسرات",
          description:
            "وعاء شوفان مطبوخ بالحليب مع قرفة، عسل، وخليط جوز ولوز لطاقة بطيئة الإطلاق وتدفئة الجسم.",
        },
        {
          icon: Soup,
          label: "الغداء",
          title: "حساء عدس بالخضار + بروتين خفيف",
          description:
            "حساء عدس أحمر مع جزر وكرفس، يُقدّم مع صدر دجاج مشوي أو سمك للدفء وتقوية المناعة.",
        },
        {
          icon: Utensils,
          label: "العشاء",
          title: "سمك سلمون مشوي مع خضار جذرية",
          description:
            "سلمون أو سردين غني بأوميغا-3 وفيتامين د، مع بطاطا حلوة وقرنبيط مشوي بزيت الزيتون.",
        },
        {
          icon: Cookie,
          label: "وجبات خفيفة",
          title: "حمضيات وتمر مع شاي أعشاب",
          description:
            "برتقال أو يوسفي لفيتامين C، حبتا تمر للطاقة، وكوب بابونج أو زنجبيل دافئ.",
        },
      ];
    }
    return [
      {
        icon: Coffee,
        label: "الإفطار",
        title: "زبادي يوناني مع فواكه صيفية",
        description:
          "زبادي بارد مع شرائح فراولة، توت، وقطع بطيخ، ورشّة بذور شيا للترطيب وبروتين سهل الهضم.",
      },
      {
        icon: Soup,
        label: "الغداء",
        title: "سلطة كينوا بالدجاج المشوي",
        description:
          "كينوا مع خيار، طماطم، نعنع، ليمون، وزيت زيتون، مع شرائح دجاج مشوي خفيف ـ غنية بالألياف ومرطّبة.",
      },
      {
        icon: Utensils,
        label: "العشاء",
        title: "سمك مشوي مع خضار طازجة",
        description:
          "فيليه سمك أبيض مشوي على البخار مع كوسة وفلفل ملوّن ـ وجبة خفيفة لا ترهق الهضم في الحرارة.",
      },
      {
        icon: Cookie,
        label: "وجبات خفيفة",
        title: "فواكه مرطبة وعصائر طبيعية",
        description:
          "بطيخ، شمام، خيار، أو عصير ليمون بالنعنع بدون سكر مضاف للحفاظ على ترطيب الجسم.",
      },
    ];
  };

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const heightInMeters = data.height / 100;
      const bmi = data.weight / (heightInMeters * heightInMeters);

      let bmiClass = "";
      let bmiColor = "";
      if (bmi < 18.5) {
        bmiClass = "نقص وزن";
        bmiColor = "text-sky-500";
      } else if (bmi < 25) {
        bmiClass = "وزن طبيعي";
        bmiColor = "text-emerald-500";
      } else if (bmi < 30) {
        bmiClass = "زيادة وزن";
        bmiColor = "text-amber-500";
      } else {
        bmiClass = "سمنة";
        bmiColor = "text-rose-500";
      }

      // Map BMI 15-40 -> 0-100% for the gauge
      const bmiPercent = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));

      // Mifflin-St Jeor (gender-specific)
      const bmrBase = 10 * data.weight + 6.25 * data.height - 5 * data.age;
      const bmr =
        data.gender === "male" ? bmrBase + 5 : bmrBase - 161;
      const calories = Math.round(bmr * 1.55); // moderate activity

      // Water (ml) ~ 35 ml per kg
      const water = +(data.weight * 0.035).toFixed(1); // liters

      // Sleep recommendation by age
      let sleep = "7-9 ساعات";
      if (data.age < 18) sleep = "8-10 ساعات";
      else if (data.age >= 65) sleep = "7-8 ساعات";

      // Exercise recommendation
      const exercise =
        data.age < 18
          ? "60 دقيقة من النشاط المعتدل إلى الشديد يومياً"
          : "150 دقيقة أسبوعياً من النشاط المعتدل + تمرين قوة مرتين";

      const isWinter = season === "شتاء";
      const meals = buildMeals(isWinter, data.gender);

      const seasonalAdvice = isWinter
        ? `في فصل الشتاء بمدينة ${data.city}، احرص على تعرّض يومي قصير للشمس لرفع فيتامين د، والإكثار من المشروبات الدافئة وتغطية الأطراف عند الخروج صباحاً.`
        : `في فصل الصيف بمدينة ${data.city}، تجنّب أشعة الشمس المباشرة بين 11ص و4م، اشرب الماء بانتظام حتى دون الشعور بالعطش، وارتدِ ملابس قطنية فاتحة.`;

      setResults({
        bmi: +bmi.toFixed(1),
        bmiClass,
        bmiColor,
        bmiPercent,
        bmr: Math.round(bmr),
        calories,
        water,
        sleep,
        exercise,
        meals,
        seasonalAdvice,
        data,
      });

      setIsSubmitting(false);
    }, 1800);
  };

  const resetForm = () => {
    setResults(null);
    form.reset();
  };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !results) return;
    setDownloading(true);
    try {
      const node = reportRef.current;
      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableWidth = pageWidth - margin * 2;
      const ratio = canvas.height / canvas.width;
      const imgWidth = usableWidth;
      const imgHeight = imgWidth * ratio;

      let position = margin;
      let remainingHeight = imgHeight;
      let pageOffset = 0;

      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
      } else {
        // Slice the canvas across pages
        const pageContentHeightPx =
          ((pageHeight - margin * 2) / imgHeight) * canvas.height;
        let yPx = 0;
        while (yPx < canvas.height) {
          const sliceHeight = Math.min(pageContentHeightPx, canvas.height - yPx);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              canvas,
              0,
              yPx,
              canvas.width,
              sliceHeight,
              0,
              0,
              canvas.width,
              sliceHeight,
            );
          }
          const sliceData = sliceCanvas.toDataURL("image/png");
          const sliceImgHeight = (sliceHeight / canvas.width) * imgWidth;
          if (yPx > 0) pdf.addPage();
          pdf.addImage(sliceData, "PNG", margin, margin, imgWidth, sliceImgHeight);
          yPx += sliceHeight;
        }
        // suppress unused warnings
        void position;
        void remainingHeight;
        void pageOffset;
      }

      const safeCity = (results.data.city || "report").replace(/\s+/g, "_");
      pdf.save(`تحليلك-الصحي-${safeCity}.pdf`);
    } catch (e) {
      console.error("PDF export failed", e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section
      id="discover"
      className="py-32 relative flex items-center justify-center min-h-[60vh]"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) setTimeout(resetForm, 300);
              setIsOpen(open);
            }}
          >
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
            <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto p-0 border-none bg-background/95 backdrop-blur-xl">
              <div className="p-6 md:p-8">
                <DialogTitle className="text-2xl font-bold mb-2">
                  تحليلك الصحي الشخصي
                </DialogTitle>
                <DialogDescription className="text-muted-foreground mb-6">
                  أدخل بياناتك للحصول على تحليل دقيق ونصائح مخصصة لنمط حياتك
                  وتغذيتك.
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
                      <div className="flex justify-end mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium">
                          {season === "صيف" ? (
                            <Sun className="w-4 h-4" />
                          ) : (
                            <Snowflake className="w-4 h-4" />
                          )}
                          الموسم الحالي: {season}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>الجنس</Label>
                        <Controller
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="grid grid-cols-2 gap-3"
                            >
                              <Label
                                htmlFor="male"
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                                  field.value === "male"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background/50 hover:border-primary/40"
                                }`}
                              >
                                <RadioGroupItem
                                  value="male"
                                  id="male"
                                  className="sr-only"
                                />
                                <User2 className="w-4 h-4" />
                                ذكر
                              </Label>
                              <Label
                                htmlFor="female"
                                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${
                                  field.value === "female"
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-border bg-background/50 hover:border-primary/40"
                                }`}
                              >
                                <RadioGroupItem
                                  value="female"
                                  id="female"
                                  className="sr-only"
                                />
                                <User2 className="w-4 h-4" />
                                أنثى
                              </Label>
                            </RadioGroup>
                          )}
                        />
                        {form.formState.errors.gender && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.gender.message as string}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="city">المدينة</Label>
                          <Input
                            id="city"
                            {...form.register("city")}
                            className="bg-background/50 text-right"
                            placeholder="مثال: الرياض"
                          />
                          {form.formState.errors.city && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.city.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">العمر</Label>
                          <Input
                            id="age"
                            type="number"
                            {...form.register("age", { valueAsNumber: true })}
                            className="bg-background/50 text-right"
                            placeholder="بالسنوات"
                          />
                          {form.formState.errors.age && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.age.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="weight">الوزن (كغ)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            {...form.register("weight", {
                              valueAsNumber: true,
                            })}
                            className="bg-background/50 text-right"
                            placeholder="مثال: 70"
                          />
                          {form.formState.errors.weight && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.weight.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">الطول (سم)</Label>
                          <Input
                            id="height"
                            type="number"
                            {...form.register("height", {
                              valueAsNumber: true,
                            })}
                            className="bg-background/50 text-right"
                            placeholder="مثال: 175"
                          />
                          {form.formState.errors.height && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.height.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full py-6 text-lg rounded-xl mt-4"
                      >
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
                      <p className="text-lg text-muted-foreground animate-pulse">
                        جاري تحليل بياناتك بدقة...
                      </p>
                    </motion.div>
                  )}

                  {results && !isSubmitting && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-6 text-right"
                    >
                      <div ref={reportRef} className="space-y-6 bg-background p-2">
                        {/* Header */}
                        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/15 p-6">
                          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
                          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
                          <div className="relative z-10">
                            <div className="text-xs uppercase tracking-widest text-primary/70 mb-2">
                              تقرير صحي شخصي
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
                              ملخّص حالتك الصحية
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border">
                                <MapPin className="w-3 h-3" />
                                {results.data.city}
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border">
                                <User2 className="w-3 h-3" />
                                {results.data.gender === "male"
                                  ? "ذكر"
                                  : "أنثى"}{" "}
                                · {results.data.age} سنة
                              </span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border">
                                {season === "صيف" ? (
                                  <Sun className="w-3 h-3" />
                                ) : (
                                  <Snowflake className="w-3 h-3" />
                                )}
                                {season}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* BMI gauge */}
                        <div className="rounded-3xl border bg-card p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                مؤشر كتلة الجسم
                              </div>
                              <div
                                className={`text-4xl font-bold ${results.bmiColor}`}
                              >
                                {results.bmi}
                              </div>
                              <div
                                className={`text-sm font-medium ${results.bmiColor}`}
                              >
                                {results.bmiClass}
                              </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-primary/10">
                              <Activity className="w-7 h-7 text-primary" />
                            </div>
                          </div>
                          <div className="relative h-3 rounded-full bg-gradient-to-l from-rose-400 via-amber-400 via-emerald-400 to-sky-400 overflow-hidden">
                            <motion.div
                              initial={{ left: "0%" }}
                              animate={{
                                left: `calc(${results.bmiPercent}% - 8px)`,
                              }}
                              transition={{
                                duration: 1,
                                ease: "easeOut",
                              }}
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground shadow-lg ring-2 ring-background"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                            <span>15</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>40</span>
                          </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <StatCard
                            icon={Flame}
                            label="معدل الأيض"
                            value={`${results.bmr}`}
                            unit="kcal"
                            tone="primary"
                          />
                          <StatCard
                            icon={Apple}
                            label="السعرات اليومية"
                            value={`${results.calories}`}
                            unit="kcal"
                            tone="accent"
                          />
                          <StatCard
                            icon={Droplets}
                            label="الماء"
                            value={`${results.water}`}
                            unit="لتر/يوم"
                            tone="sky"
                          />
                          <StatCard
                            icon={Moon}
                            label="النوم"
                            value={results.sleep.split(" ")[0]}
                            unit="ساعات"
                            tone="violet"
                          />
                        </div>

                        {/* Seasonal advice */}
                        <div className="rounded-3xl border bg-gradient-to-br from-secondary/10 to-accent/10 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            {season === "صيف" ? (
                              <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                              <Snowflake className="w-5 h-5 text-sky-500" />
                            )}
                            <h4 className="font-bold">نصيحة موسمية</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {results.seasonalAdvice}
                          </p>
                        </div>

                        {/* Lifestyle */}
                        <div className="rounded-3xl border bg-card p-5">
                          <h4 className="font-bold mb-4 flex items-center gap-2">
                            <HeartPulse className="w-5 h-5 text-primary" />
                            توصيات نمط الحياة
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <LifestyleTip
                              icon={Dumbbell}
                              title="النشاط البدني"
                              text={results.exercise}
                            />
                            <LifestyleTip
                              icon={Moon}
                              title="جودة النوم"
                              text={`نم ${results.sleep} يومياً مع روتين هادئ قبل النوم.`}
                            />
                            <LifestyleTip
                              icon={Droplets}
                              title="الترطيب"
                              text={`اشرب ${results.water} لتر ماء على مدار اليوم.`}
                            />
                          </div>
                        </div>

                        {/* Nutrition plan */}
                        <div className="rounded-3xl border bg-card p-5">
                          <h4 className="font-bold mb-4 flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-primary" />
                            خطة التغذية المخصّصة ({season})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {results.meals.map((meal, i) => (
                              <MealCard key={i} meal={meal} />
                            ))}
                          </div>
                        </div>

                        {/* Sources */}
                        <div className="rounded-3xl border bg-muted/30 p-4">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem
                              value="sources"
                              className="border-none"
                            >
                              <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold">
                                المصادر والمراجع العلمية
                              </AccordionTrigger>
                              <AccordionContent className="pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {SOURCES.map((s) => (
                                    <a
                                      key={s.url}
                                      href={s.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between gap-2 text-sm bg-background/70 hover:bg-background border rounded-xl px-3 py-2 transition-colors"
                                    >
                                      <span>{s.name}</span>
                                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                    </a>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>

                        <p className="text-[11px] text-muted-foreground text-center pt-1">
                          هذا التحليل توعوي ولا يُغني عن استشارة الطبيب المختص.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={handleDownloadPdf}
                          disabled={downloading}
                          className="w-full sm:flex-1 py-6 text-base rounded-xl"
                        >
                          {downloading ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              جاري تجهيز الملف...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 ml-2" />
                              تحميل التقرير PDF
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto py-6 px-6 rounded-xl"
                          onClick={resetForm}
                        >
                          إعادة الحساب
                        </Button>
                      </div>
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

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  tone: "primary" | "accent" | "sky" | "violet";
}) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    accent: "from-accent/15 to-accent/5 text-accent-foreground",
    sky: "from-sky-400/20 to-sky-400/5 text-sky-500",
    violet: "from-violet-400/20 to-violet-400/5 text-violet-500",
  };
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${tones[tone]} p-4 flex flex-col items-center text-center`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{unit}</div>
    </div>
  );
}

function LifestyleTip({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-background border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  const Icon = meal.icon;
  return (
    <div className="rounded-2xl bg-background border p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-secondary/20">
          <Icon className="w-4 h-4 text-secondary-foreground" />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {meal.label}
        </div>
      </div>
      <div className="text-sm font-bold mb-1.5">{meal.title}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {meal.description}
      </p>
    </div>
  );
}
