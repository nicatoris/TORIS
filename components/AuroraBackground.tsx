import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { palette } from "@/lib/theme";

interface Blob {
  color: string;
  size: number;
  x: number;
  y: number;
  drift: number;
  dur: number;
  opacity: number;
}

/**
 * A calm, slowly breathing field of soft light behind the whole app. Two
 * emerald blooms and a faint violet one drift on long, offset loops so the
 * background never sits still — but stays subtle enough to read as premium
 * ambience, not decoration. Pure SVG + Reanimated, so it runs in Expo Go.
 */
export function AuroraBackground() {
  const { width, height } = useWindowDimensions();

  const blobs: Blob[] = [
    { color: palette.accent, size: width * 1.15, x: -width * 0.25, y: -height * 0.06, drift: 26, dur: 14000, opacity: 0.22 },
    { color: palette.accentDeep, size: width * 1.0, x: width * 0.45, y: height * 0.5, drift: 34, dur: 19000, opacity: 0.16 },
    { color: palette.extractDeep, size: width * 0.9, x: width * 0.1, y: height * 0.82, drift: 30, dur: 23000, opacity: 0.1 },
  ];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bg }]}>
      {blobs.map((b, i) => (
        <FloatingBlob key={i} blob={b} phase={i} />
      ))}
      {/* Vignette to sink the edges into black */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="vig" cx="50%" cy="38%" r="75%">
              <Stop offset="55%" stopColor={palette.bg} stopOpacity={0} />
              <Stop offset="100%" stopColor={palette.bg} stopOpacity={0.85} />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="150%" fill="url(#vig)" />
        </Svg>
      </View>
    </View>
  );
}

function FloatingBlob({ blob, phase }: { blob: Blob; phase: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: blob.dur, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [t, blob.dur]);

  const style = useAnimatedStyle(() => {
    const angle = phase * 2.1;
    const dx = Math.cos(t.value * Math.PI * 2 + angle) * blob.drift;
    const dy = Math.sin(t.value * Math.PI * 2 + angle) * blob.drift;
    const scale = 1 + t.value * 0.12;
    return { transform: [{ translateX: dx }, { translateY: dy }, { scale }] };
  });

  const gid = `blob-${phase}`;
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: blob.x,
          top: blob.y,
          width: blob.size,
          height: blob.size,
          opacity: blob.opacity,
        },
        style,
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={gid} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={blob.color} stopOpacity={1} />
            <Stop offset="55%" stopColor={blob.color} stopOpacity={0.35} />
            <Stop offset="100%" stopColor={blob.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="50%" cy="50%" r="50%" fill={`url(#${gid})`} />
      </Svg>
    </Animated.View>
  );
}
