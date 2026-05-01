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
  ExternalLink, Sparkles, Loader2, Activity, Flame, Apple,
  Utensils, Coffee, Soup, Cookie, Droplets, Moon, Dumbbell,
  HeartPulse, Sun, Snowflake, Download, MapPin, User2,
  HelpCircle, AlertTriangle, X, Trophy, Zap, Watch,
  Share2, ImageDown, TrendingUp, CheckCircle2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

const formSchema = z.object({
  city: z.string().min(2, "الرجاء إدخال اسم مدينة صحيح"),
  gender: z.enum(["male", "female"], { required_error: "الرجاء اختيار الجنس" } as any),
  weight: z.number({ invalid_type_error: "أدخل رقماً صحيحاً" }).min(30).max(300),
  height: z.number({ invalid_type_error: "أدخل رقماً صحيحاً" }).min(100).max(250),
  age: z.number({ invalid_type_error: "أدخل رقماً صحيحاً" }).min(10).max(100),
  conditions: z.string().optional(),
  allergies: z.string().optional(),
  heartRate: z.number({ invalid_type_error: "أدخل رقماً صحيحاً" }).min(40).max(200).optional(),
});

type FormData = z.infer<typeof formSchema>;

type Meal = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  title: string;
  description: string;
};

type HealthScore = {
  total: number;
  bmiScore: number;
  waterScore: number;
  sleepScore: number;
  heartScore: number;
  label: string;
  color: string;
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
  healthScore: HealthScore;
  data: FormData;
};

const SOURCES = [
  { name: "منظمة الصحة العالمية (WHO)", url: "https://www.who.int" },
  { name: "مايو كلينك (Mayo Clinic)", url: "https://www.mayoclinic.org" },
  { name: "هارفارد للصحة العامة", url: "https://www.hsph.harvard.edu" },
  { name: "مراكز السيطرة على الأمراض (CDC)", url: "https://www.cdc.gov" },
  { name: "الجمعية الأمريكية للقلب", url: "https://www.heart.org" },
];

function InfoTooltip({ title, what, normal, yours }: {
  title: string; what: string; normal: string; yours: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-5 h-5 rounded-full bg-muted/60 hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors">
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -4 }} transition={{ duration: 0.15 }}
              className="absolute left-0 top-7 z-50 w-64 rounded-2xl border bg-background shadow-xl p-4 text-right">
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                <span className="text-sm font-bold">{title}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="text-muted-foreground block mb-0.5">ما هو؟</span><p className="leading-relaxed">{what}</p></div>
                <div className="h-px bg-border" />
                <div><span className="text-muted-foreground block mb-0.5">المعدل الطبيعي</span><p className="font-semibold text-emerald-500">{normal}</p></div>
                <div className="h-px bg-border" />
                <div><span className="text-muted-foreground block mb-0.5">حالتك</span><p className="font-bold text-primary">{yours}</p></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
      <motion.circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.5, ease: "easeOut" }} />
    </svg>
  );
}

function HealthScoreSection({ score }: { score: HealthScore }) {
  const bars = [
    { label: "مؤشر الكتلة", value: score.bmiScore, max: 40, color: "bg-primary" },
    { label: "التوازن المائي", value: score.waterScore, max: 20, color: "bg-sky-500" },
    { label: "جودة النوم", value: score.sleepScore, max: 20, color: "bg-violet-500" },
    { label: "نبض القلب", value: score.heartScore, max: 20, color: "bg-rose-500" },
  ];
  const strokeColor =
    score.total >= 80 ? "#22c55e" : score.total >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Trophy className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-lg">نقاط صحتك الإجمالية</h4>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-shrink-0">
          <ScoreRing score={score.total} color={strokeColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span className="text-4xl font-bold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              {score.total}
            </motion.span>
            <span className="text-xs text-muted-foreground">/ 100</span>
            <span className="text-xs font-semibold mt-0.5" style={{ color: strokeColor }}>{score.label}</span>
          </div>
        </div>
        <div className="flex-1 w-full space-y-3">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{Math.round((b.value / b.max) * 100)}%</span>
                <span className="text-muted-foreground">{b.label}</span>
              </div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <motion.div className={`h-full rounded-full ${b.color}`}
                  initial={{ width: 0 }} animate={{ width: `${(b.value / b.max) * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {score.total < 70 && (
        <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
          يمكن تحسين نقاطك من خلال الوصول لوزن مثالي وممارسة الرياضة بانتظام.
        </p>
      )}
    </div>
  );
}

function WhatIfSimulator({ results }: { results: Results }) {
  const [scenario, setScenario] = useState<"sleep" | "water" | "weight">("sleep");

  const scenarios = {
    sleep: {
      icon: Moon,
      title: "لو نمت ساعة إضافية يومياً",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      border: "border-violet-500/30",
      effects: [
        { label: "التركيز والذاكرة", value: "+23%", icon: TrendingUp },
        { label: "المزاج العام", value: "أفضل بكثير", icon: CheckCircle2 },
        { label: "خطر الأمراض المزمنة", value: "-18%", icon: TrendingUp },
        { label: "بعد 30 يوماً", value: "طاقة أعلى وإنتاجية متضاعفة", icon: Zap },
      ],
    },
    water: {
      icon: Droplets,
      title: `لو شربت ${(results.water + 0.5).toFixed(1)} لتر يومياً (زيادة 0.5 لتر)`,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      effects: [
        { label: "ترطيب الجلد", value: "+30%", icon: TrendingUp },
        { label: "حرق السعرات", value: "+3%", icon: Flame },
        { label: "الصداع والتعب", value: "ينخفض ملحوظاً", icon: CheckCircle2 },
        { label: "بعد 14 يوماً", value: "بشرة أنضر وهضم أفضل", icon: CheckCircle2 },
      ],
    },
    weight: {
      icon: Activity,
      title: results.bmi > 24.9
        ? `لو خسرت 5 كغ (وزنك سيصبح ${results.data.weight - 5} كغ)`
        : `لو اكتسبت 3 كغ عضل (وزنك سيصبح ${results.data.weight + 3} كغ)`,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      effects: results.bmi > 24.9
        ? [
            { label: "مؤشر الكتلة الجديد", value: `${(results.data.weight - 5) / ((results.data.height / 100) ** 2) < 25 ? "✓ طبيعي" : "تحسّن"}`, icon: CheckCircle2 },
            { label: "ضغط الدم", value: "ينخفض", icon: TrendingUp },
            { label: "خطر السكري", value: "-30%", icon: TrendingUp },
            { label: "بعد 60 يوماً", value: "خفة وطاقة وراحة في المفاصل", icon: Zap },
          ]
        : [
            { label: "معدل الأيض", value: "+8%", icon: Flame },
            { label: "القوة البدنية", value: "أعلى بشكل ملحوظ", icon: Dumbbell },
            { label: "الكثافة العظمية", value: "تتحسّن", icon: CheckCircle2 },
            { label: "بعد 90 يوماً", value: "جسم أكثر رشاقة وقوة", icon: Zap },
          ],
    },
  };

  const active = scenarios[scenario];
  const Icon = active.icon;

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-lg">محاكي "ماذا لو؟"</h4>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {(["sleep", "water", "weight"] as const).map((s) => {
          const cfg = scenarios[s];
          const BtnIcon = cfg.icon;
          return (
            <button key={s} onClick={() => setScenario(s)}
              className={`rounded-xl py-2 px-3 text-xs font-semibold border transition-all flex flex-col items-center gap-1
                ${scenario === s ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "bg-muted/30 border-transparent text-muted-foreground hover:border-border"}`}>
              <BtnIcon className="w-4 h-4" />
              {s === "sleep" ? "النوم" : s === "water" ? "الماء" : "الوزن"}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={scenario} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          <div className={`rounded-2xl ${active.bg} border ${active.border} p-4 mb-4`}>
            <div className={`flex items-center gap-2 font-semibold text-sm mb-1 ${active.color}`}>
              <Icon className="w-4 h-4" />
              {active.title}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {active.effects.map((e, i) => {
              const EIcon = e.icon;
              return (
                <div key={i} className="rounded-xl bg-background border p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                    <EIcon className="w-3.5 h-3.5" />
                    {e.label}
                  </div>
                  <div className={`font-bold text-sm ${active.color}`}>{e.value}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <p className="text-[10px] text-muted-foreground text-center mt-3">
        * المحاكاة تعليمية مبنية على دراسات صحية — النتائج الفعلية تختلف من شخص لآخر.
      </p>
    </div>
  );
}

function SevenDayChallenge({ results }: { results: Results }) {
  const waterTarget = results.water;
  const sleepHours = results.sleep.split("-")[0];
  const isOverweight = results.bmi >= 25;

  const days = [
    { day: "اليوم 1", icon: Droplets, color: "text-sky-500", bg: "bg-sky-500/10",
      task: `اشرب ${waterTarget} لتر ماء موزّعة على مدار اليوم`, tip: "ضع زجاجة ماء أمامك دائماً" },
    { day: "اليوم 2", icon: Moon, color: "text-violet-500", bg: "bg-violet-500/10",
      task: `نم ${sleepHours} ساعات. أغلق شاشتك قبل النوم بـ 30 دقيقة`, tip: "النوم المبكر يرفع الطاقة" },
    { day: "اليوم 3", icon: Dumbbell, color: "text-emerald-500", bg: "bg-emerald-500/10",
      task: isOverweight ? "امشِ 30 دقيقة متواصلة بخطى سريعة" : "تمارين قوة 20 دقيقة + مشي 10 دقائق",
      tip: "الاستمرارية أهم من الشدة" },
    { day: "اليوم 4", icon: Apple, color: "text-rose-500", bg: "bg-rose-500/10",
      task: `تناول وجبتك بـ ${Math.round(results.calories * 0.3)} سعرة إفطاراً غنياً`, tip: "الإفطار يرفع معدل الأيض" },
    { day: "اليوم 5", icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10",
      task: "تعرّض للشمس الصباحية 15 دقيقة قبل 10 صباحاً", tip: "فيتامين د أساسي للمناعة" },
    { day: "اليوم 6", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10",
      task: `قلّل السكر المضاف. هدفك اليوم: أقل من 25 غ`, tip: "احذر المشروبات الغازية والعصائر الصناعية" },
    { day: "اليوم 7", icon: Trophy, color: "text-primary", bg: "bg-primary/10",
      task: "راجع نفسك: كيف تشعر الآن مقارنةً بقبل أسبوع؟", tip: "التغيير يبدأ من قرار واحد — استمر!" },
  ];

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <CheckCircle2 className="w-5 h-5 text-primary" />
        <h4 className="font-bold text-lg">تحدّي الأسبوع الصحي — 7 أيام</h4>
      </div>
      <div className="space-y-2">
        {days.map((d, i) => {
          const DIcon = d.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="rounded-2xl border bg-background p-3 flex items-start gap-3">
              <div className={`p-2 rounded-xl ${d.bg} flex-shrink-0`}>
                <DIcon className={`w-4 h-4 ${d.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold ${d.color}`}>{d.day}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed">{d.task}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">💡 {d.tip}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

const shareCardId = "health-share-card";

function ShareableCard({ results, season }: { results: Results; season: string }) {
  const [downloading, setDownloading] = useState(false);
  const scoreColor =
    results.healthScore.total >= 80 ? "#22c55e" :
    results.healthScore.total >= 60 ? "#f59e0b" : "#ef4444";

  const handleDownload = async () => {
    const el = document.getElementById(shareCardId);
    if (!el) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: null });
      const link = document.createElement("a");
      link.download = `بطاقتي-الصحية.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Button size="sm" variant="outline" onClick={handleDownload} disabled={downloading} className="rounded-xl gap-2">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageDown className="w-4 h-4" />}
          تحميل البطاقة
        </Button>
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          <h4 className="font-bold">بطاقتك الصحية</h4>
        </div>
      </div>

      <div id={shareCardId}
        className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 border border-primary/20 p-5 text-right"
        style={{ fontFamily: "Tajawal, sans-serif" }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-muted-foreground">صحتك أولاً • الفصل 2/5</span>
          <span className="text-base font-bold text-primary">🌿 بطاقتي الصحية</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">الاسم</p>
            <p className="font-bold text-lg">{results.data.city} · {results.data.gender === "male" ? "ذكر" : "أنثى"} · {results.data.age} سنة</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black" style={{ color: results.bmiColor.replace("text-", "").includes("emerald") ? "#22c55e" : results.bmiColor.replace("text-", "").includes("sky") ? "#0ea5e9" : results.bmiColor.replace("text-", "").includes("amber") ? "#f59e0b" : "#f43f5e" }}>
              {results.healthScore.total}
            </div>
            <div className="text-[10px] text-muted-foreground">نقطة / 100</div>
            <div className="text-[10px] font-bold" style={{ color: scoreColor }}>{results.healthScore.label}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "مؤشر الكتلة", value: `${results.bmi} — ${results.bmiClass}`, icon: "⚖️" },
            { label: "السعرات اليومية", value: `${results.calories} kcal`, icon: "🔥" },
            { label: "الماء اليومي", value: `${results.water} لتر`, icon: "💧" },
            { label: "النوم الموصى به", value: results.sleep, icon: "🌙" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-background/60 border p-2.5">
              <div className="text-[10px] text-muted-foreground">{s.icon} {s.label}</div>
              <div className="text-xs font-bold mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>
        <div className="text-center text-[10px] text-muted-foreground border-t pt-2">
          {season === "صيف" ? "☀️" : "❄️"} {season} • تحليل توعوي • استشر طبيبك دائماً
        </div>
      </div>
    </div>
  );
}

export function DiscoverYourself() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [season, setSeason] = useState<"صيف" | "شتاء">("صيف");
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { city: "", gender: undefined as any, conditions: "", allergies: "" },
  });

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    setSeason([11, 12, 1, 2, 3].includes(month) ? "شتاء" : "صيف");
  }, []);

  const buildMeals = (isWinter: boolean, _gender: "male" | "female"): Meal[] => {
    if (isWinter) return [
      { icon: Coffee, label: "الإفطار", title: "شوفان دافئ بالقرفة والمكسرات", description: "وعاء شوفان مطبوخ بالحليب مع قرفة، عسل، وخليط جوز ولوز لطاقة بطيئة الإطلاق وتدفئة الجسم." },
      { icon: Soup, label: "الغداء", title: "حساء عدس بالخضار + بروتين خفيف", description: "حساء عدس أحمر مع جزر وكرفس، يُقدّم مع صدر دجاج مشوي أو سمك للدفء وتقوية المناعة." },
      { icon: Utensils, label: "العشاء", title: "سمك سلمون مشوي مع خضار جذرية", description: "سلمون أو سردين غني بأوميغا-3 وفيتامين د، مع بطاطا حلوة وقرنبيط مشوي بزيت الزيتون." },
      { icon: Cookie, label: "وجبات خفيفة", title: "حمضيات وتمر مع شاي أعشاب", description: "برتقال أو يوسفي لفيتامين C، حبتا تمر للطاقة، وكوب بابونج أو زنجبيل دافئ." },
    ];
    return [
      { icon: Coffee, label: "الإفطار", title: "زبادي يوناني مع فواكه صيفية", description: "زبادي بارد مع شرائح فراولة، توت، وقطع بطيخ، ورشّة بذور شيا للترطيب وبروتين سهل الهضم." },
      { icon: Soup, label: "الغداء", title: "سلطة كينوا بالدجاج المشوي", description: "كينوا مع خيار، طماطم، نعنع، ليمون، وزيت زيتون، مع شرائح دجاج مشوي خفيف ـ غنية بالألياف ومرطّبة." },
      { icon: Utensils, label: "العشاء", title: "سمك مشوي مع خضار طازجة", description: "فيليه سمك أبيض مشوي على البخار مع كوسة وفلفل ملوّن ـ وجبة خفيفة لا ترهق الهضم في الحرارة." },
      { icon: Cookie, label: "وجبات خفيفة", title: "فواكه مرطبة وعصائر طبيعية", description: "بطيخ، شمام، خيار، أو عصير ليمون بالنعنع بدون سكر مضاف للحفاظ على ترطيب الجسم." },
    ];
  };

  const calcHealthScore = (bmi: number, heartRate?: number): HealthScore => {
    let bmiScore = 40;
    if (bmi >= 18.5 && bmi < 25) bmiScore = 40;
    else if ((bmi >= 25 && bmi < 27.5) || (bmi >= 17.5 && bmi < 18.5)) bmiScore = 30;
    else if ((bmi >= 27.5 && bmi < 30) || (bmi >= 16 && bmi < 17.5)) bmiScore = 20;
    else bmiScore = 10;

    const waterScore = 20;
    const sleepScore = 20;

    let heartScore = 20;
    if (heartRate !== undefined) {
      if (heartRate >= 60 && heartRate <= 80) heartScore = 20;
      else if ((heartRate >= 50 && heartRate < 60) || (heartRate > 80 && heartRate <= 100)) heartScore = 15;
      else heartScore = 8;
    }

    const total = bmiScore + waterScore + sleepScore + heartScore;
    let label = "ممتاز";
    let color = "text-emerald-500";
    if (total < 50) { label = "يحتاج تحسيناً"; color = "text-rose-500"; }
    else if (total < 65) { label = "مقبول"; color = "text-amber-500"; }
    else if (total < 80) { label = "جيد"; color = "text-sky-500"; }

    return { total, bmiScore, waterScore, sleepScore, heartScore, label, color };
  };

  const onSubmit = (data: FormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const h = data.height / 100;
      const bmi = data.weight / (h * h);
      let bmiClass = "", bmiColor = "";
      if (bmi < 18.5) { bmiClass = "نقص وزن"; bmiColor = "text-sky-500"; }
      else if (bmi < 25) { bmiClass = "وزن طبيعي"; bmiColor = "text-emerald-500"; }
      else if (bmi < 30) { bmiClass = "زيادة وزن"; bmiColor = "text-amber-500"; }
      else { bmiClass = "سمنة"; bmiColor = "text-rose-500"; }
      const bmiPercent = Math.max(0, Math.min(100, ((bmi - 15) / 25) * 100));
      const bmrBase = 10 * data.weight + 6.25 * data.height - 5 * data.age;
      const bmr = data.gender === "male" ? bmrBase + 5 : bmrBase - 161;
      const calories = Math.round(bmr * 1.55);
      const water = +(data.weight * 0.035).toFixed(1);
      let sleep = "7-9 ساعات";
      if (data.age < 18) sleep = "8-10 ساعات";
      else if (data.age >= 65) sleep = "7-8 ساعات";
      const exercise = data.age < 18
        ? "60 دقيقة من النشاط المعتدل إلى الشديد يومياً"
        : "150 دقيقة أسبوعياً من النشاط المعتدل + تمرين قوة مرتين";
      const meals = buildMeals(season === "شتاء", data.gender);
      const seasonalAdvice = season === "شتاء"
        ? `في فصل الشتاء بمدينة ${data.city}، احرص على تعرّض يومي قصير للشمس لرفع فيتامين د، والإكثار من المشروبات الدافئة وتغطية الأطراف عند الخروج صباحاً.`
        : `في فصل الصيف بمدينة ${data.city}، تجنّب أشعة الشمس المباشرة بين 11ص و4م، اشرب الماء بانتظام حتى دون الشعور بالعطش، وارتدِ ملابس قطنية فاتحة.`;
      const healthScore = calcHealthScore(+bmi.toFixed(1), data.heartRate);
      setResults({ bmi: +bmi.toFixed(1), bmiClass, bmiColor, bmiPercent, bmr: Math.round(bmr), calories, water, sleep, exercise, meals, seasonalAdvice, healthScore, data });
      setIsSubmitting(false);
    }, 1800);
  };

  const resetForm = () => { setResults(null); form.reset(); };

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !results) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: getComputedStyle(document.body).backgroundColor, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = usableWidth * (canvas.height / canvas.width);
      if (imgHeight <= pageHeight - margin * 2) {
        pdf.addImage(imgData, "PNG", margin, margin, usableWidth, imgHeight);
      } else {
        const pageContentHeightPx = ((pageHeight - margin * 2) / imgHeight) * canvas.height;
        let yPx = 0;
        while (yPx < canvas.height) {
          const sliceH = Math.min(pageContentHeightPx, canvas.height - yPx);
          const sc = document.createElement("canvas");
          sc.width = canvas.width; sc.height = sliceH;
          sc.getContext("2d")?.drawImage(canvas, 0, yPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const sliceImgH = (sliceH / canvas.width) * usableWidth;
          if (yPx > 0) pdf.addPage();
          pdf.addImage(sc.toDataURL("image/png"), "PNG", margin, margin, usableWidth, sliceImgH);
          yPx += sliceH;
        }
      }
      pdf.save(`تحليلك-الصحي-${(results.data.city || "report").replace(/\s+/g, "_")}.pdf`);
    } catch (e) { console.error("PDF export failed", e); }
    finally { setDownloading(false); }
  };

  return (
    <section id="discover" className="py-32 relative flex items-center justify-center min-h-[60vh]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container mx-auto px-4 text-center z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setTimeout(resetForm, 300); setIsOpen(open); }}>
            <DialogTrigger asChild>
              <Button size="lg" className="relative overflow-hidden group rounded-full px-12 py-8 text-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_-10px_hsl(var(--primary))] hover:shadow-[0_0_60px_-15px_hsl(var(--primary))] transition-all duration-500 hover:-translate-y-2">
                <span className="relative z-10 flex items-center gap-3"><Sparkles className="w-6 h-6" />اكتشف نفسك</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[780px] max-h-[92vh] overflow-y-auto p-0 border-none bg-background/95 backdrop-blur-xl">
              <div className="p-6 md:p-8">
                <DialogTitle className="text-2xl font-bold mb-2">تحليلك الصحي الشخصي</DialogTitle>
                <DialogDescription className="text-muted-foreground mb-6">
                  أدخل بياناتك للحصول على تحليل دقيق ونصائح مخصصة لنمط حياتك وتغذيتك.
                </DialogDescription>

                <AnimatePresence mode="wait">
                  {!results && !isSubmitting && (
                    <motion.form key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-right">

                      <div className="flex justify-end mb-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-sm font-medium">
                          {season === "صيف" ? <Sun className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                          الموسم الحالي: {season}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>الجنس</Label>
                        <Controller control={form.control} name="gender" render={({ field }) => (
                          <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-3">
                            {[{ val: "male", label: "ذكر" }, { val: "female", label: "أنثى" }].map(g => (
                              <Label key={g.val} htmlFor={g.val} className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all ${field.value === g.val ? "border-primary bg-primary/10 text-primary" : "border-border bg-background/50 hover:border-primary/40"}`}>
                                <RadioGroupItem value={g.val} id={g.val} className="sr-only" />
                                <User2 className="w-4 h-4" />{g.label}
                              </Label>
                            ))}
                          </RadioGroup>
                        )} />
                        {form.formState.errors.gender && <p className="text-xs text-destructive">{form.formState.errors.gender.message as string}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { id: "city", label: "المدينة", placeholder: "مثال: الرياض", type: "text", reg: form.register("city") },
                          { id: "age", label: "العمر", placeholder: "بالسنوات", type: "number", reg: form.register("age", { valueAsNumber: true }) },
                          { id: "weight", label: "الوزن (كغ)", placeholder: "مثال: 70", type: "number", reg: form.register("weight", { valueAsNumber: true }) },
                          { id: "height", label: "الطول (سم)", placeholder: "مثال: 175", type: "number", reg: form.register("height", { valueAsNumber: true }) },
                        ].map(f => (
                          <div key={f.id} className="space-y-2">
                            <Label htmlFor={f.id}>{f.label}</Label>
                            <Input id={f.id} type={f.type} step={f.id === "weight" ? "0.1" : undefined} {...f.reg} className="bg-background/50 text-right" placeholder={f.placeholder} />
                            {(form.formState.errors as any)[f.id] && <p className="text-xs text-destructive">{(form.formState.errors as any)[f.id]?.message}</p>}
                          </div>
                        ))}
                      </div>

                      {/* Smartwatch heart rate */}
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Watch className="w-4 h-4" />
                          <span className="text-sm font-semibold">بيانات الساعة الذكية (اختياري)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">أدخل معدل ضربات قلبك من ساعتك الذكية (Apple Watch، Galaxy Watch، Fitbit…) لتحسين نقاط صحتك.</p>
                        <div className="space-y-2">
                          <Label htmlFor="heartRate">معدل نبض القلب (نبضة/دقيقة)</Label>
                          <Input id="heartRate" type="number" {...form.register("heartRate", { valueAsNumber: true })}
                            className="bg-background/50 text-right" placeholder="مثال: 72 (الطبيعي: 60-100)" />
                          {form.formState.errors.heartRate && <p className="text-xs text-destructive">{form.formState.errors.heartRate.message}</p>}
                        </div>
                      </div>

                      {/* Medical conditions */}
                      <div className="rounded-2xl border border-amber-400/30 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-semibold">معلومات طبية مهمة (اختياري)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">إن كنت تعاني من أمراض مزمنة أو حساسية غذائية، يُرجى ذكرها حتى ننبّهك لأخذ الحيطة.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="conditions">الأمراض المزمنة</Label>
                            <Input id="conditions" {...form.register("conditions")} className="bg-background/50 text-right" placeholder="مثال: السكري، ضغط الدم..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="allergies">الحساسية الغذائية</Label>
                            <Input id="allergies" {...form.register("allergies")} className="bg-background/50 text-right" placeholder="مثال: الغلوتين، المكسرات..." />
                          </div>
                        </div>
                      </div>

                      <Button type="submit" className="w-full py-6 text-lg rounded-xl mt-4">
                        احصل على تحليلك الشخصي
                      </Button>
                    </motion.form>
                  )}

                  {isSubmitting && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 space-y-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <p className="text-lg text-muted-foreground animate-pulse">جاري تحليل بياناتك بدقة...</p>
                    </motion.div>
                  )}

                  {results && !isSubmitting && (
                    <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 text-right">
                      <div ref={reportRef} className="space-y-6 bg-background p-2">

                        {/* Header */}
                        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-accent/15 p-6">
                          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-primary/15 blur-3xl" />
                          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent/15 blur-3xl" />
                          <div className="relative z-10">
                            <div className="text-xs uppercase tracking-widest text-primary/70 mb-2">تقرير صحي شخصي</div>
                            <h3 className="text-2xl md:text-3xl font-bold mb-3">ملخّص حالتك الصحية</h3>
                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border"><MapPin className="w-3 h-3" />{results.data.city}</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border"><User2 className="w-3 h-3" />{results.data.gender === "male" ? "ذكر" : "أنثى"} · {results.data.age} سنة</span>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border">{season === "صيف" ? <Sun className="w-3 h-3" /> : <Snowflake className="w-3 h-3" />}{season}</span>
                              {results.data.heartRate && <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur px-3 py-1 border"><HeartPulse className="w-3 h-3" />{results.data.heartRate} نبضة/د</span>}
                            </div>
                          </div>
                        </div>

                        {/* Medical warning */}
                        {(results.data.conditions || results.data.allergies) && (
                          <div className="rounded-2xl border border-amber-400/40 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                            <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400"><AlertTriangle className="w-4 h-4" /><span className="text-sm font-bold">تنبيه طبي مهم</span></div>
                            <p className="text-xs text-muted-foreground mb-2">بناءً على حالاتك الصحية، راجع طبيبك قبل تطبيق أي تغيير غذائي أو بدني.</p>
                            {results.data.conditions && <div className="text-xs mb-1"><span className="font-semibold text-amber-600 dark:text-amber-400">الأمراض: </span>{results.data.conditions}</div>}
                            {results.data.allergies && <div className="text-xs"><span className="font-semibold text-amber-600 dark:text-amber-400">الحساسية: </span>{results.data.allergies}</div>}
                          </div>
                        )}

                        {/* Health Score */}
                        <HealthScoreSection score={results.healthScore} />

                        {/* BMI gauge */}
                        <div className="rounded-3xl border bg-card p-6 shadow-sm relative">
                          <div className="absolute top-4 left-4">
                            <InfoTooltip title="مؤشر كتلة الجسم" what="مقياس يُحدد تناسب وزنك مع طولك. يُحسب بقسمة وزنك (كغ) على مربع طولك (م)." normal="18.5 – 24.9 (الوزن الطبيعي)" yours={`${results.bmi} — ${results.bmiClass}`} />
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="text-sm text-muted-foreground">مؤشر كتلة الجسم</div>
                              <div className={`text-4xl font-bold ${results.bmiColor}`}>{results.bmi}</div>
                              <div className={`text-sm font-medium ${results.bmiColor}`}>{results.bmiClass}</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-primary/10"><Activity className="w-7 h-7 text-primary" /></div>
                          </div>
                          <div className="relative h-3 rounded-full bg-gradient-to-l from-rose-400 via-amber-400 via-emerald-400 to-sky-400 overflow-hidden">
                            <motion.div initial={{ left: "0%" }} animate={{ left: `calc(${results.bmiPercent}% - 8px)` }} transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-foreground shadow-lg ring-2 ring-background" />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                            <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                          </div>
                        </div>

                        {/* Stat cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <StatCard icon={Flame} label="معدل الأيض" value={`${results.bmr}`} unit="kcal" tone="primary"
                            tooltip={{ title: "معدل الأيض الأساسي", what: "عدد السعرات التي يحرقها جسمك في الراحة التامة.", normal: "1400 – 2000 kcal", yours: `${results.bmr} kcal` }} />
                          <StatCard icon={Apple} label="السعرات اليومية" value={`${results.calories}`} unit="kcal" tone="accent"
                            tooltip={{ title: "السعرات اليومية", what: "إجمالي السعرات مع نشاط بدني معتدل.", normal: "1800 – 2500 kcal", yours: `${results.calories} kcal` }} />
                          <StatCard icon={Droplets} label="الماء" value={`${results.water}`} unit="لتر/يوم" tone="sky"
                            tooltip={{ title: "الماء اليومي", what: "الحد الأدنى لترطيب الجسم بشكل سليم.", normal: "2.0 – 3.0 لتر/يوم", yours: `${results.water} لتر/يوم` }} />
                          <StatCard icon={Moon} label="النوم" value={results.sleep.split(" ")[0]} unit="ساعات" tone="violet"
                            tooltip={{ title: "ساعات النوم", what: "مدة النوم اللازمة لتعافي الجسم والعقل.", normal: "7 – 9 ساعات للبالغين", yours: results.sleep }} />
                        </div>

                        {/* What-If Simulator */}
                        <WhatIfSimulator results={results} />

                        {/* 7-Day Challenge */}
                        <SevenDayChallenge results={results} />

                        {/* Shareable Card */}
                        <ShareableCard results={results} season={season} />

                        {/* Seasonal advice */}
                        <div className="rounded-3xl border bg-gradient-to-br from-secondary/10 to-accent/10 p-5">
                          <div className="flex items-center gap-2 mb-2">
                            {season === "صيف" ? <Sun className="w-5 h-5 text-amber-500" /> : <Snowflake className="w-5 h-5 text-sky-500" />}
                            <h4 className="font-bold">نصيحة موسمية</h4>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{results.seasonalAdvice}</p>
                        </div>

                        {/* Lifestyle */}
                        <div className="rounded-3xl border bg-card p-5">
                          <h4 className="font-bold mb-4 flex items-center gap-2"><HeartPulse className="w-5 h-5 text-primary" />توصيات نمط الحياة</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <LifestyleTip icon={Dumbbell} title="النشاط البدني" text={results.exercise} />
                            <LifestyleTip icon={Moon} title="جودة النوم" text={`نم ${results.sleep} يومياً مع روتين هادئ قبل النوم.`} />
                            <LifestyleTip icon={Droplets} title="الترطيب" text={`اشرب ${results.water} لتر ماء على مدار اليوم.`} />
                          </div>
                        </div>

                        {/* Nutrition */}
                        <div className="rounded-3xl border bg-card p-5">
                          <h4 className="font-bold mb-4 flex items-center gap-2"><Utensils className="w-5 h-5 text-primary" />خطة التغذية المخصّصة ({season})</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {results.meals.map((meal, i) => <MealCard key={i} meal={meal} />)}
                          </div>
                        </div>

                        {/* Sources */}
                        <div className="rounded-3xl border bg-muted/30 p-4">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="sources" className="border-none">
                              <AccordionTrigger className="hover:no-underline py-2 text-sm font-semibold">المصادر والمراجع العلمية</AccordionTrigger>
                              <AccordionContent className="pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {SOURCES.map(s => (
                                    <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center justify-between gap-2 text-sm bg-background/70 hover:bg-background border rounded-xl px-3 py-2 transition-colors">
                                      <span>{s.name}</span><ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
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
                        <Button onClick={handleDownloadPdf} disabled={downloading} className="w-full sm:flex-1 py-6 text-base rounded-xl">
                          {downloading ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />جاري تجهيز الملف...</> : <><Download className="w-4 h-4 ml-2" />تحميل التقرير PDF</>}
                        </Button>
                        <Button variant="outline" className="w-full sm:w-auto py-6 px-6 rounded-xl" onClick={resetForm}>إعادة الحساب</Button>
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

function StatCard({ icon: Icon, label, value, unit, tone, tooltip }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; unit: string;
  tone: "primary" | "accent" | "sky" | "violet";
  tooltip?: { title: string; what: string; normal: string; yours: string };
}) {
  const tones: Record<string, string> = {
    primary: "from-primary/15 to-primary/5 text-primary",
    accent: "from-accent/15 to-accent/5 text-accent-foreground",
    sky: "from-sky-400/20 to-sky-400/5 text-sky-500",
    violet: "from-violet-400/20 to-violet-400/5 text-violet-500",
  };
  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${tones[tone]} p-4 flex flex-col items-center text-center relative`}>
      {tooltip && <div className="absolute top-2 left-2"><InfoTooltip {...tooltip} /></div>}
      <Icon className="w-5 h-5 mb-2" />
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{unit}</div>
    </div>
  );
}

function LifestyleTip({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-background border p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/10"><Icon className="w-4 h-4 text-primary" /></div>
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
        <div className="p-1.5 rounded-lg bg-secondary/20"><Icon className="w-4 h-4 text-secondary-foreground" /></div>
        <div className="text-xs font-semibold text-muted-foreground">{meal.label}</div>
      </div>
      <div className="text-sm font-bold mb-1.5">{meal.title}</div>
      <p className="text-xs text-muted-foreground leading-relaxed">{meal.description}</p>
    </div>
  );
}
