import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// ── ECG path (same formula as AnimatedBackground) ──────────────────────────
const CYCLE_W = 160;
const NUM     = Math.ceil(width / CYCLE_W) + 4;
const STRIP_H = 90;
const BL      = 45;

function buildPath(): string {
  let d = `M0,${BL}`;
  for (let i = 0; i < NUM; i++) {
    const o = i * CYCLE_W;
    d += ` L${o + 26},${BL}`;
    d += ` C${o + 28},${BL} ${o + 29},${BL - 11} ${o + 32},${BL - 13}`;
    d += ` C${o + 35},${BL - 15} ${o + 37},${BL - 9} ${o + 39},${BL}`;
    d += ` L${o + 46},${BL}`;
    d += ` L${o + 48},${BL + 5}`;
    d += ` L${o + 50},4`;
    d += ` L${o + 53},${BL + 28}`;
    d += ` L${o + 56},${BL}`;
    d += ` L${o + 67},${BL}`;
    d += ` C${o + 70},${BL} ${o + 74},${BL - 20} ${o + 80},${BL - 20}`;
    d += ` C${o + 86},${BL - 20} ${o + 90},${BL} ${o + 96},${BL}`;
    d += ` L${o + CYCLE_W},${BL}`;
  }
  return d;
}

const ECG_PATH  = buildPath();
const ECG_TOTAL = NUM * CYCLE_W;

// Pure SVG heart — no font dependency
const HEART =
  "M50,82 C25,66 4,52 4,32 C4,17 13,8 24,8 C33,8 41,13 50,23 C59,13 67,8 76,8 C87,8 96,17 96,32 C96,52 75,66 50,82 Z";

export function SplashLoader() {
  const fadeIn     = useRef(new Animated.Value(0)).current;
  const scrollX    = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const glowOp     = useRef(new Animated.Value(0.25)).current;
  const dotOp1     = useRef(new Animated.Value(0.3)).current;
  const dotOp2     = useRef(new Animated.Value(0.3)).current;
  const dotOp3     = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }).start();

    // ECG scroll — seamless loop
    Animated.loop(
      Animated.timing(scrollX, { toValue: -CYCLE_W, duration: 900, useNativeDriver: true })
    ).start();

    // Lub-dub heartbeat synced with ECG speed (900ms)
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.32, duration: 100, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 0.93, duration: 90,  useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.18, duration: 80,  useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0,  duration: 180, useNativeDriver: true }),
        Animated.delay(450),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOp, { toValue: 0.9, duration: 380, useNativeDriver: true }),
        Animated.timing(glowOp, { toValue: 0.2, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    // Loading dots wave
    const dot = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1,   duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    dot(dotOp1, 0);
    dot(dotOp2, 200);
    dot(dotOp3, 400);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn }]}>
      {/* Ambient orbs */}
      <View style={[styles.orb, { backgroundColor: "#7f1d1d", width: 340, height: 340, top: -80,  left: -80,  opacity: 0.18 }]} />
      <View style={[styles.orb, { backgroundColor: "#1e1b4b", width: 260, height: 260, bottom: STRIP_H + 40, right: -60, opacity: 0.14 }]} />
      <View style={[styles.orb, { backgroundColor: "#0f2b47", width: 200, height: 200, top: height * 0.4, left: -40, opacity: 0.1 }]} />

      {/* Center: heart + name */}
      <View style={styles.center}>
        {/* Glow behind heart */}
        <Animated.View style={[styles.heartGlow, { opacity: glowOp }]} />

        {/* Beating heart SVG */}
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Svg width={120} height={108} viewBox="0 0 100 90">
            <Path d={HEART} fill="#e11d48" opacity={0.97} />
            <Path d={HEART} fill="none" stroke="#fb7185" strokeWidth={1.8} opacity={0.5} />
            <Path d={HEART} fill="none" stroke="#fda4af" strokeWidth={0.9} opacity={0.3} />
          </Svg>
        </Animated.View>

        <Text style={styles.title}>صحتك أولاً</Text>
        <Text style={styles.subtitle}>الصف الثاني • الوعي الصحي</Text>

        {/* Animated dots */}
        <View style={styles.dots}>
          {[dotOp1, dotOp2, dotOp3].map((op, i) => (
            <Animated.View key={i} style={[styles.dot, { opacity: op }]} />
          ))}
        </View>
      </View>

      {/* Full-width ECG monitor strip at bottom */}
      <View style={styles.ecgStrip}>
        <View style={styles.ecgBg} />
        {[22, 45, 68].map(y => (
          <View key={y} style={[styles.gridLine, { top: y }]} />
        ))}
        <View style={styles.ecgClip}>
          <Animated.View style={{ transform: [{ translateX: scrollX }] }}>
            <Svg
              width={ECG_TOTAL}
              height={STRIP_H}
              viewBox={`0 0 ${ECG_TOTAL} ${STRIP_H}`}
            >
              <Path
                d={ECG_PATH}
                stroke="#00ff88"
                strokeWidth={7}
                fill="none"
                strokeLinecap="round"
                opacity={0.1}
              />
              <Path
                d={ECG_PATH}
                stroke="#00ff88"
                strokeWidth={2.2}
                fill="none"
                strokeLinecap="round"
                opacity={0.95}
              />
            </Svg>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07050e",
    alignItems: "center",
    justifyContent: "center",
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  center: {
    alignItems: "center",
    gap: 14,
    marginBottom: STRIP_H + 30,
  },
  heartGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#e11d48",
  },
  title: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    color: "#4b5e6e",
    fontSize: 14,
    textAlign: "center",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00ff88",
  },
  ecgStrip: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: STRIP_H,
  },
  ecgBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#020d07",
    borderTopWidth: 1,
    borderTopColor: "#0a2e18",
  },
  gridLine: {
    position: "absolute",
    left: 0, right: 0,
    height: 1,
    backgroundColor: "#0d3320",
    opacity: 0.9,
  },
  ecgClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
