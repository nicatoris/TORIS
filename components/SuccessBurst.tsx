import React, { useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { palette, springs } from "@/lib/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  label: string;
  onDone: () => void;
}

const CHECK_LEN = 40; // approx path length of the checkmark
const RING_C = 2 * Math.PI * 42;

/**
 * A full-screen celebratory confirmation: the backdrop blurs, a ring draws
 * itself around a checkmark that strokes in, then the whole thing settles and
 * hands control back. Timed to feel earned but never slow (~1.1s).
 */
export function SuccessBurst({ label, onDone }: Props) {
  const pop = useSharedValue(0);
  const ring = useSharedValue(0);
  const check = useSharedValue(0);
  const fade = useSharedValue(0);

  useEffect(() => {
    fade.value = withTiming(1, { duration: 180 });
    pop.value = withSpring(1, springs.bouncy);
    ring.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    check.value = withDelay(320, withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }));
    // hold, then dismiss
    fade.value = withDelay(
      950,
      withTiming(0, { duration: 220 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
    pop.value = withDelay(950, withSequence(withTiming(1.06, { duration: 120 }), withTiming(0.6, { duration: 200 })));
  }, []);

  const overlay = useAnimatedStyle(() => ({ opacity: fade.value }));
  const badge = useAnimatedStyle(() => ({
    transform: [{ scale: pop.value }],
    opacity: fade.value,
  }));
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_C * (1 - ring.value),
  }));
  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: CHECK_LEN * (1 - check.value),
  }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: check.value,
    transform: [{ translateY: (1 - check.value) * 8 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.center, overlay]} pointerEvents="none">
      <BlurView intensity={24} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(244,241,233,0.6)" }]} />
      <Animated.View style={[styles.center, badge]}>
        <Svg width={110} height={110} viewBox="0 0 100 100">
          <AnimatedCircle
            cx="50"
            cy="50"
            r="42"
            stroke={palette.accent}
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            animatedProps={ringProps}
            transform="rotate(-90 50 50)"
          />
          <AnimatedPath
            d="M32 51 L45 64 L69 37"
            stroke={palette.accent}
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={CHECK_LEN}
            animatedProps={checkProps}
          />
        </Svg>
        <Animated.View style={labelStyle}>
          <Text style={styles.label}>{label}</Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  label: {
    marginTop: 14,
    color: palette.label,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
