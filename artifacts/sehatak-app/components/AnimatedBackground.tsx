import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import Svg, { Path, Ellipse } from "react-native-svg";

const { width } = Dimensions.get("window");
const HEIGHT = 340;

// ─── Heart SVG path (viewBox 0 0 100 90) ─────────────────────────────────────
const HEART_PATH =
  "M50,82 C25,66 4,52 4,32 C4,17 13,8 24,8 C33,8 41,13 50,23 C59,13 67,8 76,8 C87,8 96,17 96,32 C96,52 75,66 50,82 Z";

// ECG path inside heart area
const ECG_PATH =
  "M0,30 L18,30 L22,26 L25,30 L28,30 L30,5 L33,55 L36,30 L44,30 L47,22 L52,30 L130,30";

// ─── Fire particles ───────────────────────────────────────────────────────────
const FIRE_PARTICLES = [
  { x: 10,  size: 16, dur: 1700, delay: 0,    color: "#f97316" },
  { x: 38,  size: 10, dur: 2100, delay: 250,  color: "#ef4444" },
  { x: 66,  size: 19, dur: 1550, delay: 500,  color: "#fbbf24" },
  { x: 95,  size: 12, dur: 1900, delay: 150,  color: "#f97316" },
  { x: 124, size: 22, dur: 1650, delay: 700,  color: "#ef4444" },
  { x: 152, size: 9,  dur: 2200, delay: 380,  color: "#fbbf24" },
  { x: 180, size: 17, dur: 1750, delay: 80,   color: "#f97316" },
  { x: 208, size: 13, dur: 2000, delay: 600,  color: "#ef4444" },
  { x: 236, size: 20, dur: 1600, delay: 320,  color: "#fbbf24" },
  { x: 264, size: 11, dur: 1850, delay: 460,  color: "#f97316" },
  { x: 292, size: 15, dur: 2100, delay: 120,  color: "#ef4444" },
  { x: 318, size: 8,  dur: 1700, delay: 840,  color: "#fbbf24" },
  { x: 340, size: 18, dur: 1950, delay: 200,  color: "#f97316" },
];

// ─── Clouds config ─────────────────────────────────────────────────────────────
const CLOUDS = [
  { startX: -180, y: 14,  speed: 19000, scale: 1.1,  delay: 0     },
  { startX: -260, y: 52,  speed: 25000, scale: 0.75, delay: 8000  },
  { startX: -150, y: 28,  speed: 21000, scale: 0.88, delay: 14000 },
];

const RAIN_COLS = [-28, -14, 0, 16, 30, 46];

// ─────────────────────────────────────────────────────────────────────────────
// Beating Heart
// ─────────────────────────────────────────────────────────────────────────────
function BeatingHeart() {
  const scale       = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.35)).current;
  const ecgX        = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Lub-dub double beat
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.22, duration: 110, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.16, duration: 90,  useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 220, useNativeDriver: true }),
        Animated.delay(660),
      ])
    ).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.8,  duration: 400, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    // ECG scroll
    Animated.loop(
      Animated.timing(ecgX, { toValue: -130, duration: 2200, useNativeDriver: true })
    ).start();
  }, []);

  return (
    <View style={styles.heartContainer} pointerEvents="none">
      {/* Glow behind heart */}
      <Animated.View style={[styles.heartGlow, { opacity: glowOpacity }]} />

      {/* Beating heart SVG */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={120} height={108} viewBox="0 0 100 90">
          <Path d={HEART_PATH} fill="#e11d48" opacity={0.95} />
          <Path d={HEART_PATH} fill="none" stroke="#fb7185" strokeWidth={1.8} opacity={0.55} />
        </Svg>
      </Animated.View>

      {/* ECG line below heart */}
      <Animated.View style={[styles.ecgWrap, { transform: [{ translateX: ecgX }] }]}>
        <Svg width={260} height={60} viewBox="0 0 130 60">
          <Path
            d={ECG_PATH}
            stroke="#fb7185"
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            opacity={0.88}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fire Particle
// ─────────────────────────────────────────────────────────────────────────────
function FireParticle({ x, size, dur, delay, color }: typeof FIRE_PARTICLES[0]) {
  const translateY = useRef(new Animated.Value(HEIGHT + size)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scaleVal   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const run = () => {
      translateY.setValue(HEIGHT + size);
      opacity.setValue(0);
      scaleVal.setValue(1);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -size * 2, duration: dur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity,  { toValue: 0.9, duration: 180,       useNativeDriver: true }),
            Animated.delay(dur - 500),
            Animated.timing(opacity,  { toValue: 0,   duration: 320,       useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(scaleVal, { toValue: 1.5, duration: dur * 0.4, useNativeDriver: true }),
            Animated.timing(scaleVal, { toValue: 0.4, duration: dur * 0.6, useNativeDriver: true }),
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
        left: x,
        width: size,
        height: size * 1.7,
        borderRadius: size * 0.5,
        backgroundColor: color,
        transform: [{ translateY }, { scaleX: scaleVal }],
        opacity,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: size,
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single rain drop (inside Cloud's Animated.View so it moves with cloud)
// ─────────────────────────────────────────────────────────────────────────────
function RainDrop({ colX, cloudHeight }: { colX: number; cloudHeight: number }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      const randDelay = Math.random() * 1400;
      const randDur   = 550 + Math.random() * 350;
      translateY.setValue(0);
      opacity.setValue(0);
      Animated.sequence([
        Animated.delay(randDelay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 70 + Math.random() * 50, duration: randDur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.65, duration: 80,  useNativeDriver: true }),
            Animated.delay(randDur - 200),
            Animated.timing(opacity, { toValue: 0,    duration: 120, useNativeDriver: true }),
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
        top: cloudHeight,
        left: colX,
        width: 1.5,
        height: 9,
        borderRadius: 2,
        backgroundColor: "#93c5fd",
        opacity,
        transform: [{ translateY }],
      }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cloud (with its own rain drops inside same moving container)
// ─────────────────────────────────────────────────────────────────────────────
function Cloud({ startX, y, speed, scale: sc, delay }: typeof CLOUDS[0]) {
  const cloudX = useRef(new Animated.Value(startX)).current;

  useEffect(() => {
    const run = () => {
      cloudX.setValue(startX);
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(cloudX, { toValue: width + 220, duration: speed, useNativeDriver: true }),
      ]).start(() => run());
    };
    run();
  }, []);

  const cloudBodyH = 38;

  return (
    <Animated.View
      style={[
        styles.cloudContainer,
        { top: y, transform: [{ translateX: cloudX }, { scale: sc }] },
      ]}
      pointerEvents="none"
    >
      {/* Cloud SVG body */}
      <Svg width={130} height={55} viewBox="0 0 130 55">
        <Ellipse cx="65" cy="40" rx="58" ry="14" fill="#64748b" opacity={0.5}  />
        <Ellipse cx="42" cy="32" rx="28" ry="22" fill="#94a3b8" opacity={0.55} />
        <Ellipse cx="72" cy="26" rx="35" ry="26" fill="#cbd5e1" opacity={0.5}  />
        <Ellipse cx="100" cy="34" rx="24" ry="18" fill="#94a3b8" opacity={0.48} />
      </Svg>

      {/* Rain drops attached to cloud */}
      {RAIN_COLS.map((cx, i) => (
        <RainDrop key={i} colX={cx + 35} cloudHeight={cloudBodyH} />
      ))}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AnimatedBackground
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedBackground({ style }: { style?: object }) {
  return (
    <View style={[styles.container, style]}>
      {/* Dark gradient backdrop */}
      <View style={styles.backdrop} />

      {/* Ambient glow orbs */}
      <View style={[styles.orb, { backgroundColor: "#7f1d1d", width: 260, height: 260, top: 30, left: width * 0.2,  opacity: 0.2  }]} />
      <View style={[styles.orb, { backgroundColor: "#1e3a5f", width: 190, height: 190, top: 70, right: -20,         opacity: 0.16 }]} />
      <View style={[styles.orb, { backgroundColor: "#312e81", width: 150, height: 150, bottom: 10, left: 10,        opacity: 0.13 }]} />

      {/* Clouds with built-in rain */}
      {CLOUDS.map((c, i) => <Cloud key={i} {...c} />)}

      {/* Beating heart center */}
      <BeatingHeart />

      {/* Fire particles bottom */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {FIRE_PARTICLES.map((p, i) => <FireParticle key={i} {...p} />)}
      </View>

      {/* Fire base glow */}
      <View style={styles.fireBase} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    overflow: "hidden",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0c1019",
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  heartContainer: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  heartGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#e11d48",
  },
  ecgWrap: {
    marginTop: 2,
  },
  cloudContainer: {
    position: "absolute",
    width: 200,
    height: 120,
  },
  fireBase: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 50,
    backgroundColor: "#7c2d12",
    opacity: 0.28,
  },
});
