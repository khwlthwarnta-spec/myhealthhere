import { motion, AnimatePresence } from "framer-motion";
import { useBluetooth } from "@/hooks/useBluetooth";
import { Bluetooth, BluetoothOff, Heart, Thermometer, Battery, Wifi, WifiOff, Activity, Clock, AlertCircle, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function HeartRingIcon({ bpm }: { bpm: number | null }) {
  const active = bpm !== null;
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      {active && (
        <>
          <span className="absolute inset-0 rounded-full bg-rose-500/20 pulse-ring" />
          <span className="absolute inset-3 rounded-full bg-rose-500/10 pulse-ring" style={{ animationDelay: "0.2s" }} />
        </>
      )}
      <div className={`relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-500 ${
        active ? "border-rose-400 bg-rose-500/10 glow-red" : "border-border bg-muted/30"
      }`}>
        <Heart className={`w-8 h-8 mb-1 transition-colors duration-300 ${active ? "text-rose-400 heartbeat" : "text-muted-foreground"}`} />
        <span className={`text-3xl font-black leading-none ${active ? "text-rose-400" : "text-muted-foreground"}`}>
          {bpm ?? "--"}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">نبضة/دقيقة</span>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  glow,
  sub,
}: {
  icon: any;
  label: string;
  value: string | number | null;
  unit: string;
  color: string;
  glow: string;
  sub?: string;
}) {
  const active = value !== null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-card p-5 flex flex-col gap-3 transition-all duration-500 ${active ? glow : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${active ? color.replace("text-", "bg-").replace("-400", "-500/15") : "bg-muted/40"}`}>
          <Icon className={`w-5 h-5 ${active ? color : "text-muted-foreground"}`} />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="text-right">
        <span className={`text-4xl font-black ${active ? color : "text-muted-foreground"}`}>
          {value ?? "--"}
        </span>
        <span className={`text-sm mr-1 ${active ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{unit}</span>
      </div>
      {sub && <p className="text-[11px] text-muted-foreground/70 text-right">{sub}</p>}
    </motion.div>
  );
}

function BatteryBar({ level }: { level: number | null }) {
  if (level === null) return null;
  const color = level > 60 ? "bg-emerald-400" : level > 20 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2 justify-end">
      <span className="text-xs text-muted-foreground">{level}%</span>
      <div className="relative w-8 h-4 border border-border rounded-sm overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${level}%` }} />
      </div>
      <Battery className="w-4 h-4 text-muted-foreground" />
    </div>
  );
}

function EcgLine({ history }: { history: { time: string; bpm: number }[] }) {
  if (history.length < 2) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border bg-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground">{history.length} قياس</span>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold">سجل معدل ضربات القلب</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#888" }} interval="preserveStartEnd" />
          <YAxis domain={["auto", "auto"]} tick={{ fontSize: 9, fill: "#888" }} width={28} />
          <Tooltip
            contentStyle={{ background: "#1a1f2e", border: "1px solid #2a3040", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#888" }}
            itemStyle={{ color: "#34d399" }}
            formatter={(v: number) => [`${v} bpm`, "النبض"]}
          />
          <Line
            type="monotone"
            dataKey="bpm"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#34d399" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function StatusBadge({ state }: { state: string }) {
  const map: Record<string, { label: string; color: string; icon: any }> = {
    disconnected: { label: "غير متصل", color: "text-muted-foreground bg-muted/40 border-border", icon: BluetoothOff },
    connecting:   { label: "جارٍ الاتصال...", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: Bluetooth },
    connected:    { label: "متصل", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: Wifi },
    error:        { label: "خطأ في الاتصال", color: "text-rose-400 bg-rose-500/10 border-rose-500/30", icon: WifiOff },
  };
  const { label, color, icon: Icon } = map[state] ?? map.disconnected;
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function heartRateStatus(bpm: number | null): { label: string; color: string } {
  if (!bpm) return { label: "", color: "" };
  if (bpm < 60) return { label: "بطيء — استشر طبيبك", color: "text-sky-400" };
  if (bpm <= 100) return { label: "طبيعي", color: "text-emerald-400" };
  if (bpm <= 150) return { label: "مرتفع — تحرك أو استرح", color: "text-amber-400" };
  return { label: "مرتفع جداً", color: "text-rose-400" };
}

export default function Dashboard() {
  const { state, deviceName, data, history, error, connect, disconnect } = useBluetooth();
  const isConnected = state === "connected";
  const isConnecting = state === "connecting";
  const hrStatus = heartRateStatus(data.heartRate);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <StatusBadge state={state} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg">مراقب الصحة</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Connect Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border bg-card p-6 text-center space-y-4"
        >
          {isConnected && deviceName && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bluetooth className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{deviceName}</span>
              {data.battery !== null && <BatteryBar level={data.battery} />}
            </div>
          )}

          <HeartRingIcon bpm={data.heartRate} />

          {data.heartRate && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm font-semibold ${hrStatus.color}`}>
              {hrStatus.label}
            </motion.p>
          )}

          {data.lastUpdated && (
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              آخر تحديث: {data.lastUpdated.toLocaleTimeString("ar")}
            </div>
          )}

          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`w-full py-3.5 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
              isConnected
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25"
                : isConnecting
                ? "bg-muted/50 text-muted-foreground cursor-wait border border-border"
                : "bg-gradient-to-r from-emerald-600 to-violet-600 text-white hover:opacity-90 shadow-lg"
            }`}
          >
            {isConnecting ? (
              <><span className="animate-spin">⟳</span> جارٍ البحث عن الجهاز...</>
            ) : isConnected ? (
              <><BluetoothOff className="w-5 h-5" /> قطع الاتصال</>
            ) : (
              <><Bluetooth className="w-5 h-5" /> ربط جهاز Bluetooth</>
            )}
          </button>

          {!isConnected && !isConnecting && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              يدعم أجهزة قياس معدل ضربات القلب والحرارة المتوافقة مع Bluetooth LE القياسي (مثل أجهزة Polar وGarmin وأجهزة BLE القياسية).
            </p>
          )}
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-start gap-3 text-right"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-400 mb-1">تعذّر الاتصال</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metrics */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 gap-4"
          >
            <MetricCard
              icon={Thermometer}
              label="درجة الحرارة"
              value={data.temperature}
              unit="°م"
              color="text-amber-400"
              glow="glow-blue"
              sub={data.temperature ? (data.temperature >= 37.5 ? "⚠️ حرارة مرتفعة" : "طبيعية") : undefined}
            />
            <MetricCard
              icon={Activity}
              label="موقع المستشعر"
              value={data.sensorLocation}
              unit=""
              color="text-violet-400"
              glow="glow-purple"
            />
          </motion.div>
        )}

        {/* ECG History Chart */}
        <AnimatePresence>
          {history.length >= 2 && <EcgLine history={history} />}
        </AnimatePresence>

        {/* Stats */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "أدنى نبضة", value: Math.min(...history.map(h => h.bpm)), icon: "⬇️" },
              { label: "متوسط النبض", value: Math.round(history.reduce((a, h) => a + h.bpm, 0) / history.length), icon: "〜" },
              { label: "أعلى نبضة", value: Math.max(...history.map(h => h.bpm)), icon: "⬆️" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border bg-card p-4 text-center">
                <div className="text-lg mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-emerald-400">{s.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Info Box */}
        {!isConnected && !isConnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border bg-card p-5 text-right space-y-3"
          >
            <div className="flex items-center gap-2 justify-end">
              <span className="font-bold text-sm">كيف يعمل التطبيق؟</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            {[
              { icon: "1️⃣", text: "تأكد من تشغيل Bluetooth على جهازك وتفعيل جهاز القياس الصحي." },
              { icon: "2️⃣", text: 'اضغط "ربط جهاز Bluetooth" وسيظهر لك قائمة بالأجهزة المتاحة.' },
              { icon: "3️⃣", text: "اختر جهازك من القائمة ويبدأ التطبيق بقراءة البيانات فوراً." },
              { icon: "4️⃣", text: "يعمل مع أي جهاز يدعم معيار Bluetooth LE الصحي القياسي." },
            ].map((s) => (
              <div key={s.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                <span>{s.icon}</span>
                <span className="leading-relaxed">{s.text}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Browser support note */}
        <p className="text-center text-xs text-muted-foreground/50 pb-4">
          يتطلب متصفح Chrome أو Edge الإصدار 70+ على الكمبيوتر أو Android
        </p>
      </main>
    </div>
  );
}
