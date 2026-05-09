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
const ECG_PATH =
  "M0,30 L18,30 L22,26 L25,30 L28,30 L30,5 L33,55 L36,30 L44,30 L47,22 L52,30 L130,30";

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
// PHASE 2 — Beating Heart + ECG
// ═════════════════════════════════════════════════════════════════════════════

function HeartScene() {
  const scale   = useRef(new Animated.Value(1)).current;
  const glowOp  = useRef(new Animated.Value(0.3)).current;
  const ecgX    = useRef(new Animated.Value(0)).current;
  const pulse1  = useRef(new Animated.Value(1)).current;
  const pulse2  = useRef(new Animated.Value(1)).current;
  const pulse1Op = useRef(new Animated.Value(0.6)).current;
  const pulse2Op = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Lub-dub beat
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 110, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.18, duration: 90,  useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 200, useNativeDriver: true }),
        Animated.delay(700),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOp, { toValue: 0.85, duration: 400, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.25, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // ECG scroll
    Animated.loop(
      Animated.timing(ecgX, { toValue: -130, duration: 2200, useNativeDriver: true })
    ).start();

    // Pulse rings
    const ring = (val: Animated.Value, opVal: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(val,   { toValue: 3.2, duration: 1100, useNativeDriver: true }),
            Animated.timing(opVal, { toValue: 0,   duration: 1100, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(val,   { toValue: 1,   duration: 0,    useNativeDriver: true }),
            Animated.timing(opVal, { toValue: 0.5, duration: 0,    useNativeDriver: true }),
          ]),
        ])
      ).start();
    };
    ring(pulse1, pulse1Op, 0);
    ring(pulse2, pulse2Op, 550);
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#08060f" }]} />
      {/* Ambient */}
      <View style={[styles.orb, { backgroundColor: "#7f1d1d", width: 280, height: 280, top: 20,  left: width * 0.15, opacity: 0.18 }]} />
      <View style={[styles.orb, { backgroundColor: "#312e81", width: 200, height: 200, top: 80,  right: -30,         opacity: 0.12 }]} />
      <View style={[styles.orb, { backgroundColor: "#1e1b4b", width: 160, height: 160, bottom: 0, left: 0,            opacity: 0.15 }]} />

      {/* Heart center */}
      <View style={styles.heartWrap}>
        {/* Pulse rings */}
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse1 }], opacity: pulse1Op, borderColor: "#e11d48" }]} />
        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse2 }], opacity: pulse2Op, borderColor: "#fb7185" }]} />

        {/* Core glow */}
        <Animated.View style={[styles.heartGlow, { opacity: glowOp }]} />

        {/* Beating heart */}
        <Animated.View style={{ transform: [{ scale }] }}>
          <Svg width={130} height={117} viewBox="0 0 100 90">
            <Path d={HEART_PATH} fill="#e11d48"  opacity={0.95} />
            <Path d={HEART_PATH} fill="none" stroke="#fb7185" strokeWidth={1.6} opacity={0.5} />
            <Path d={HEART_PATH} fill="none" stroke="#fda4af" strokeWidth={0.8} opacity={0.3} />
          </Svg>
        </Animated.View>

        {/* ECG line */}
        <Animated.View style={[styles.ecgWrap, { transform: [{ translateX: ecgX }] }]}>
          <Svg width={260} height={60} viewBox="0 0 130 60">
            <Path d={ECG_PATH} stroke="#fb7185" strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.9} />
          </Svg>
        </Animated.View>
      </View>
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
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  heartGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#e11d48",
  },
  pulseRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
  },
  ecgWrap: {
    marginTop: 4,
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
