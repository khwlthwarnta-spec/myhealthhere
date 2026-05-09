import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";

const { width } = Dimensions.get("window");
const HEIGHT = 340;
const PHASE_DURATION = 4000;
const FADE_MS = 600;

// ─── Rain drop configs ────────────────────────────────────────────────────────
const RAIN_DROPS = Array.from({ length: 38 }, (_, i) => ({
  x: (width / 38) * i + Math.sin(i * 1.7) * 6,
  dur: 320 + (i % 7) * 40,
  delay: (i * 137) % 1800,
  h: 10 + (i % 5) * 2,
}));

// ─── Cloud configs ─────────────────────────────────────────────────────────────
const CLOUDS = [
  { startX: -240, y: 8,  speed: 22000, sc: 1.15, delay: 0 },
  { startX: -320, y: 48, speed: 30000, sc: 0.8,  delay: 7000 },
  { startX: -200, y: 20, speed: 26000, sc: 1.0,  delay: 13000 },
  { startX: -280, y: 62, speed: 28000, sc: 0.65, delay: 4000 },
  { startX: -180, y: 32, speed: 20000, sc: 0.9,  delay: 17000 },
];

// ─── Fire particle configs ────────────────────────────────────────────────────
const FLAMES = Array.from({ length: 14 }, (_, i) => ({
  x: (width / 14) * i,
  size: 18 + (i % 5) * 8,
  dur: 1400 + (i % 4) * 280,
  delay: (i * 193) % 1200,
  color: ["#dc2626", "#ea580c", "#f97316", "#f59e0b", "#ef4444"][i % 5],
}));

const SPARKS = Array.from({ length: 26 }, (_, i) => ({
  x: (width / 26) * i + (i % 3) * 10,
  dur: 500 + (i % 6) * 80,
  delay: (i * 211) % 2200,
  rise: 70 + (i % 5) * 30,
  drift: ((i % 9) - 4) * 8,
  color: ["#fef08a", "#fde047", "#fb923c", "#fbbf24", "#fff"][i % 5],
}));

// ─── Heart ────────────────────────────────────────────────────────────────────
const HEART_PATH =
  "M50,82 C25,66 4,52 4,32 C4,17 13,8 24,8 C33,8 41,13 50,23 C59,13 67,8 76,8 C87,8 96,17 96,32 C96,52 75,66 50,82 Z";

// One full ECG cardiac cycle (width=160, baseline y=35, total height=70)
// P wave → PQ → QRS complex → ST → T wave → TP segment
const ECG_CYCLE_W = 160;
const NUM_CYCLES  = Math.ceil(width / ECG_CYCLE_W) + 4;

function buildEcgPath(): string {
  let d = `M0,35`;
  for (let i = 0; i < NUM_CYCLES; i++) {
    const o = i * ECG_CYCLE_W;
    d += ` L${o+26},35`;
    // P wave (small smooth bump)
    d += ` C${o+28},35 ${o+29},26 ${o+32},24`;
    d += ` C${o+35},22 ${o+37},28 ${o+39},35`;
    // PQ segment
    d += ` L${o+46},35`;
    // Q dip
    d += ` L${o+48},39`;
    // R peak (tall spike)
    d += ` L${o+50},3`;
    // S dip
    d += ` L${o+53},58`;
    // return to baseline
    d += ` L${o+56},35`;
    // ST segment
    d += ` L${o+67},35`;
    // T wave (smooth rounded bump)
    d += ` C${o+70},35 ${o+74},17 ${o+80},17`;
    d += ` C${o+86},17 ${o+90},35 ${o+96},35`;
    // TP back to baseline (long flat)
    d += ` L${o+ECG_CYCLE_W},35`;
  }
  return d;
}
const ECG_WIDE_PATH = buildEcgPath();

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 0 — Clouds + Rain
// ═════════════════════════════════════════════════════════════════════════════

function RainDrop({ x, dur, delay, h }: typeof RAIN_DROPS[0]) {
  const y = useRef(new Animated.Value(-h)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      y.setValue(-h);
      op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(y, { toValue: HEIGHT + h, duration: dur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.75, duration: 60, useNativeDriver: true }),
            Animated.delay(dur - 160),
            Animated.timing(op, { toValue: 0, duration: 100, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: 1.5,
        height: h,
        borderRadius: 2,
        backgroundColor: "#a8c4e0",
        opacity: op,
        transform: [{ translateY: y }, { rotate: "3deg" }],
      }}
    />
  );
}

function DarkCloud({ startX, y, speed, sc, delay }: typeof CLOUDS[0]) {
  const cx = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const run = () => {
      cx.setValue(startX);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(cx, { toValue: width + 320, duration: speed, useNativeDriver: true }),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: "absolute", top: y, transform: [{ translateX: cx }, { scale: sc }] }}
    >
      <Svg width={220} height={75} viewBox="0 0 220 75">
        <Ellipse cx="110" cy="62" rx="100" ry="12" fill="#111827" opacity={0.85} />
        <Ellipse cx="55"  cy="48" rx="42"  ry="32" fill="#1a2030" opacity={0.9}  />
        <Ellipse cx="110" cy="36" rx="65"  ry="40" fill="#141c2b" opacity={0.92} />
        <Ellipse cx="165" cy="46" rx="44"  ry="30" fill="#1a2030" opacity={0.88} />
        <Ellipse cx="195" cy="56" rx="28"  ry="18" fill="#111827" opacity={0.8}  />
        <Ellipse cx="22"  cy="56" rx="22"  ry="16" fill="#111827" opacity={0.8}  />
        <Ellipse cx="88"  cy="28" rx="30"  ry="22" fill="#1e2638" opacity={0.7}  />
        <Ellipse cx="140" cy="26" rx="32"  ry="24" fill="#1e2638" opacity={0.65} />
      </Svg>
    </Animated.View>
  );
}

function RainScene() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#06080f" }]} />
      {/* Fog layer */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "#0a1020", opacity: 0.6 }} />
      {/* Ambient glow */}
      <View style={[styles.orb, { backgroundColor: "#1e3a5f", width: 300, height: 300, top: 20, left: -40, opacity: 0.12 }]} />
      <View style={[styles.orb, { backgroundColor: "#0f2b47", width: 200, height: 200, top: 60, right: -30, opacity: 0.1  }]} />
      {/* Rain drops */}
      {RAIN_DROPS.map((d, i) => <RainDrop key={i} {...d} />)}
      {/* Clouds on top */}
      {CLOUDS.map((c, i) => <DarkCloud key={i} {...c} />)}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1 — Fire + Sparks
// ═════════════════════════════════════════════════════════════════════════════

function FlameParticle({ x, size, dur, delay, color }: typeof FLAMES[0]) {
  const ty    = useRef(new Animated.Value(HEIGHT + size)).current;
  const op    = useRef(new Animated.Value(0)).current;
  const scaleV = useRef(new Animated.Value(1)).current;
  const tx    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(HEIGHT + size);
      op.setValue(0);
      scaleV.setValue(1);
      tx.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(ty, { toValue: -size * 2.5, duration: dur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 0.88, duration: 150,       useNativeDriver: true }),
            Animated.delay(dur - 450),
            Animated.timing(op, { toValue: 0,    duration: 300,       useNativeDriver: true }),
          ]),
          Animated.loop(Animated.sequence([
            Animated.timing(tx,     { toValue: size * 0.25,  duration: dur * 0.3, useNativeDriver: true }),
            Animated.timing(tx,     { toValue: -size * 0.25, duration: dur * 0.4, useNativeDriver: true }),
            Animated.timing(tx,     { toValue: 0,            duration: dur * 0.3, useNativeDriver: true }),
          ])),
          Animated.sequence([
            Animated.timing(scaleV, { toValue: 1.4, duration: dur * 0.35, useNativeDriver: true }),
            Animated.timing(scaleV, { toValue: 0.3, duration: dur * 0.65, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: x - size / 2,
        width: size,
        height: size * 2.2,
        borderRadius: size * 0.5,
        borderTopLeftRadius: size * 0.15,
        borderTopRightRadius: size * 0.15,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: ty }, { translateX: tx }, { scaleX: scaleV }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.95,
        shadowRadius: size * 0.8,
      }}
    />
  );
}

function Spark({ x, dur, delay, rise, drift, color }: typeof SPARKS[0]) {
  const ty = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(0);
      tx.setValue(0);
      op.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(ty, { toValue: -rise,  duration: dur, useNativeDriver: true }),
          Animated.timing(tx, { toValue: drift,  duration: dur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(op, { toValue: 1,   duration: 80,      useNativeDriver: true }),
            Animated.delay(dur - 240),
            Animated.timing(op, { toValue: 0,   duration: 160,     useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 15 + (x % 30),
        left: x,
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: ty }, { translateX: tx }],
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 4,
      }}
    />
  );
}

function FireScene() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#080300" }]} />
      {/* Base glow layers */}
      <View style={[styles.orb, { backgroundColor: "#7c1d1d", width: 280, height: 120, bottom: 0, left: -20, opacity: 0.55 }]} />
      <View style={[styles.orb, { backgroundColor: "#9a3412", width: 200, height: 80,  bottom: 0, right: -10, opacity: 0.45 }]} />
      <View style={[styles.orb, { backgroundColor: "#c2410c", width: 160, height: 60,  bottom: 0, left: width * 0.3, opacity: 0.4 }]} />
      {/* Floor ember */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 22, backgroundColor: "#7c2d12", opacity: 0.65 }} />
      {/* Flames */}
      {FLAMES.map((p, i) => <FlameParticle key={i} {...p} />)}
      {/* Sparks */}
      {SPARKS.map((s, i) => <Spark key={i} {...s} />)}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 2 — Beating Heart (top) + Full-width real ECG monitor (bottom)
// ═════════════════════════════════════════════════════════════════════════════

const ECG_STRIP_H = 88;   // height of the ECG monitor strip
const ECG_BL      = 44;   // baseline y inside the 88px strip

// Rebuild path scaled to the strip height (baseline=44, spike to y=4, dip to y=72)
function buildEcgPathScaled(): string {
  let d = `M0,${ECG_BL}`;
  for (let i = 0; i < NUM_CYCLES; i++) {
    const o = i * ECG_CYCLE_W;
    d += ` L${o + 26},${ECG_BL}`;
    // P wave
    d += ` C${o + 28},${ECG_BL} ${o + 29},${ECG_BL - 11} ${o + 32},${ECG_BL - 13}`;
    d += ` C${o + 35},${ECG_BL - 15} ${o + 37},${ECG_BL - 9} ${o + 39},${ECG_BL}`;
    // PQ segment
    d += ` L${o + 46},${ECG_BL}`;
    // Q dip
    d += ` L${o + 48},${ECG_BL + 5}`;
    // R peak — tall spike
    d += ` L${o + 50},4`;
    // S dip
    d += ` L${o + 53},${ECG_BL + 28}`;
    // return to baseline
    d += ` L${o + 56},${ECG_BL}`;
    // ST segment
    d += ` L${o + 67},${ECG_BL}`;
    // T wave
    d += ` C${o + 70},${ECG_BL} ${o + 74},${ECG_BL - 20} ${o + 80},${ECG_BL - 20}`;
    d += ` C${o + 86},${ECG_BL - 20} ${o + 90},${ECG_BL} ${o + 96},${ECG_BL}`;
    // TP back to flat
    d += ` L${o + ECG_CYCLE_W},${ECG_BL}`;
  }
  return d;
}
const ECG_MONITOR_PATH = buildEcgPathScaled();
const ECG_TOTAL_W      = NUM_CYCLES * ECG_CYCLE_W;

function EcgMonitor() {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scroll one cycle left then snap back → seamless loop
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -ECG_CYCLE_W,
        duration: 900,           // ~67 BPM  
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.ecgMonitor} pointerEvents="none">
      {/* Dark monitor background */}
      <View style={styles.ecgBg} />
      {/* Horizontal grid lines */}
      {[22, 44, 66].map(y => (
        <View key={y} style={[styles.ecgGrid, { top: y }]} />
      ))}
      {/* Scrolling waveform — clipped to monitor width */}
      <View style={styles.ecgClip}>
        <Animated.View style={{ transform: [{ translateX: scrollX }] }}>
          <Svg
            width={ECG_TOTAL_W}
            height={ECG_STRIP_H}
            viewBox={`0 0 ${ECG_TOTAL_W} ${ECG_STRIP_H}`}
          >
            {/* Faint glow trail */}
            <Path
              d={ECG_MONITOR_PATH}
              stroke="#00ff88"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              opacity={0.12}
            />
            {/* Main bright line */}
            <Path
              d={ECG_MONITOR_PATH}
              stroke="#00ff88"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              opacity={0.95}
            />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

function HeartScene() {
  const scale    = useRef(new Animated.Value(1)).current;
  const glowOp   = useRef(new Animated.Value(0.3)).current;
  const pulse1   = useRef(new Animated.Value(1)).current;
  const pulse2   = useRef(new Animated.Value(1)).current;
  const pulse1Op = useRef(new Animated.Value(0.6)).current;
  const pulse2Op = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Lub-dub beat synced to ~67 BPM (900ms cycle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.28, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.94, duration: 90,  useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.18, duration: 80,  useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 180, useNativeDriver: true }),
        Animated.delay(450),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOp, { toValue: 0.9,  duration: 380, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.2,  duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Expanding pulse rings
    const ring = (val: Animated.Value, opVal: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(val,   { toValue: 3.4, duration: 1000, useNativeDriver: true }),
            Animated.timing(opVal, { toValue: 0,   duration: 1000, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(val,   { toValue: 1,   duration: 0, useNativeDriver: true }),
            Animated.timing(opVal, { toValue: 0.5, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();
    };
    ring(pulse1, pulse1Op, 0);
    ring(pulse2, pulse2Op, 500);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#07050e" }]} />
      {/* Ambient glows */}
      <View style={[styles.orb, { backgroundColor: "#7f1d1d", width: 260, height: 260, top: 10,  left: width * 0.18, opacity: 0.20 }]} />
      <View style={[styles.orb, { backgroundColor: "#312e81", width: 180, height: 180, top: 60,  right: -20,         opacity: 0.13 }]} />
      <View style={[styles.orb, { backgroundColor: "#1e1b4b", width: 160, height: 160, bottom: ECG_STRIP_H + 10, left: 0, opacity: 0.14 }]} />

      {/* Beating heart — upper center */}
      <View style={styles.heartWrap}>
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse1 }], opacity: pulse1Op, borderColor: "#e11d48" }]} />
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse2 }], opacity: pulse2Op, borderColor: "#fb7185" }]} />
        <Animated.View style={[styles.heartGlow, { opacity: glowOp }]} />
        <Animated.View style={{ transform: [{ scale }] }}>
          <Svg width={140} height={126} viewBox="0 0 100 90">
            <Path d={HEART_PATH} fill="#e11d48"  opacity={0.95} />
            <Path d={HEART_PATH} fill="none" stroke="#fb7185" strokeWidth={1.8} opacity={0.55} />
            <Path d={HEART_PATH} fill="none" stroke="#fda4af" strokeWidth={0.9} opacity={0.3} />
          </Svg>
        </Animated.View>
      </View>

      {/* Full-width ECG monitor strip — bottom */}
      <EcgMonitor />
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Component — cycles phases every 4s
// ═════════════════════════════════════════════════════════════════════════════

const PHASES = [RainScene, FireScene, HeartScene];

export function AnimatedBackground({ style }: { style?: object }) {
  const [phase, setPhase] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = () => {
      Animated.timing(fadeAnim, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => {
        setPhase(p => (p + 1) % 3);
        Animated.timing(fadeAnim, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start();
      });
    };
    const timer = setInterval(cycle, PHASE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const Phase = PHASES[phase];

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <Phase />
      </Animated.View>

      {/* Phase indicator dots */}
      <View style={styles.dotsRow} pointerEvents="none">
        {PHASES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === phase ? "#fff" : "rgba(255,255,255,0.3)" },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  heartWrap: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    bottom: ECG_STRIP_H,
    alignItems: "center",
    justifyContent: "center",
  },
  heartGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#e11d48",
  },
  pulseRing: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
  },
  ecgMonitor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: ECG_STRIP_H,
  },
  ecgBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020d07",
    borderTopWidth: 1,
    borderTopColor: "#0a2e18",
  },
  ecgGrid: {
    position: "absolute",
    left: 0, right: 0,
    height: 1,
    backgroundColor: "#0d3320",
    opacity: 0.8,
  },
  ecgClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  dotsRow: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
