import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const HEIGHT = 320;

const ECG_PATH =
  "M0,30 L25,30 L30,26 L33,30 L38,30 L41,5 L45,55 L49,30 L58,30 L63,22 L70,30 L150,30 " +
  "L175,30 L180,26 L183,30 L188,30 L191,5 L195,55 L199,30 L208,30 L213,22 L220,30 L300,30";

const WATER_DROPS = [
  { x: 15, size: 10, dur: 2200, delay: 0 },
  { x: 60, size: 14, dur: 2800, delay: 400 },
  { x: 105, size: 8, dur: 2000, delay: 800 },
  { x: 150, size: 16, dur: 3000, delay: 200 },
  { x: 195, size: 10, dur: 2400, delay: 600 },
  { x: 240, size: 12, dur: 2600, delay: 1000 },
  { x: 285, size: 8, dur: 2100, delay: 300 },
  { x: 330, size: 14, dur: 2900, delay: 700 },
];

const FIRE_PARTICLES = [
  { x: 25, size: 14, dur: 1800, delay: 0 },
  { x: 70, size: 9, dur: 2200, delay: 300 },
  { x: 115, size: 12, dur: 1600, delay: 700 },
  { x: 155, size: 18, dur: 2400, delay: 100 },
  { x: 200, size: 10, dur: 1900, delay: 500 },
  { x: 245, size: 13, dur: 2100, delay: 900 },
  { x: 285, size: 8, dur: 1700, delay: 200 },
  { x: 320, size: 11, dur: 2300, delay: 600 },
];

function EcgLine({ y, opacity: lineOpacity, strokeWidth }: { y: number; opacity: number; strokeWidth: number }) {
  const translateX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, { toValue: -150, duration: 2500, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.ecgLine, { top: y, opacity: lineOpacity, transform: [{ translateX }] }]}>
      <Svg width={300} height={60} viewBox="0 0 300 60">
        <Path d={ECG_PATH} stroke="#43a876" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
}

function HeartPhase() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.glowOrb, { backgroundColor: "#43a876", width: 220, height: 220, top: 40, left: width * 0.2, opacity: 0.15 }]} />
      <View style={[styles.glowOrb, { backgroundColor: "#22c55e", width: 140, height: 140, top: 140, right: 20, opacity: 0.1 }]} />
      <EcgLine y={HEIGHT * 0.25} opacity={0.5} strokeWidth={1.5} />
      <EcgLine y={HEIGHT * 0.48} opacity={0.75} strokeWidth={2.5} />
      <EcgLine y={HEIGHT * 0.72} opacity={0.4} strokeWidth={1} />
    </View>
  );
}

function WaterDrop({ x, size, dur, delay }: typeof WATER_DROPS[0]) {
  const translateY = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      translateY.setValue(-size - 10);
      opacity.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: HEIGHT + 30, duration: dur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.7, duration: 300, useNativeDriver: true }),
            Animated.delay(dur - 600),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
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
        width: size,
        height: size * 1.3,
        borderRadius: size / 2,
        backgroundColor: "#38bdf8",
        transform: [{ translateY }],
        opacity,
      }}
    />
  );
}

function WaterPhase() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.glowOrb, { backgroundColor: "#38bdf8", width: 260, height: 260, top: 20, left: -40, opacity: 0.12 }]} />
      <View style={[styles.glowOrb, { backgroundColor: "#0ea5e9", width: 160, height: 160, bottom: 0, right: 10, opacity: 0.1 }]} />
      {WATER_DROPS.map((d, i) => <WaterDrop key={i} {...d} />)}
    </View>
  );
}

function FireParticle({ x, size, dur, delay }: typeof FIRE_PARTICLES[0]) {
  const translateY = useRef(new Animated.Value(HEIGHT)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      translateY.setValue(HEIGHT);
      opacity.setValue(0);
      scaleX.setValue(1);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, { toValue: -size, duration: dur, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(opacity, { toValue: 0.85, duration: 200, useNativeDriver: true }),
            Animated.delay(dur - 500),
            Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(scaleX, { toValue: 1.3, duration: dur / 2, useNativeDriver: true }),
            Animated.timing(scaleX, { toValue: 0.5, duration: dur / 2, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => run());
    };
    run();
  }, []);
  const colors = ["#f97316", "#ef4444", "#fbbf24", "#f59e0b"];
  const color = colors[Math.floor((x / width) * colors.length)];
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        transform: [{ translateY }, { scaleX }],
        opacity,
      }}
    />
  );
}

function FirePhase() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.glowOrb, { backgroundColor: "#f97316", width: 240, height: 240, top: 60, left: width * 0.3, opacity: 0.15 }]} />
      <View style={[styles.glowOrb, { backgroundColor: "#ef4444", width: 180, height: 180, bottom: 0, left: 0, opacity: 0.1 }]} />
      {FIRE_PARTICLES.map((p, i) => <FireParticle key={i} {...p} />)}
    </View>
  );
}

const PHASES = [HeartPhase, WaterPhase, FirePhase];

export function AnimatedBackground({ style }: { style?: object }) {
  const [phase, setPhase] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        setPhase((p) => (p + 1) % 3);
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const Phase = PHASES[phase];

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <Phase />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    overflow: "hidden",
  },
  glowOrb: {
    position: "absolute",
    borderRadius: 9999,
  },
  ecgLine: {
    position: "absolute",
    left: 0,
  },
});
