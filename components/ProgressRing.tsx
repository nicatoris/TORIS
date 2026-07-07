import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { palette } from "@/lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  from?: string;
  to?: string;
  children?: React.ReactNode;
  /** Delay before the sweep animates in (ms) */
  delay?: number;
}

/**
 * A gradient progress ring with a rounded cap that sweeps from the top. The
 * arc animates on the UI thread via strokeDashoffset. Center content (a big
 * number) is layered inside.
 */
export function ProgressRing({
  progress,
  size = 232,
  strokeWidth = 10,
  trackColor = "rgba(255,255,255,0.06)",
  from = palette.accent,
  to = palette.accentDeep,
  children,
  delay = 300,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const p = useSharedValue(0);

  useEffect(() => {
    const target = Math.max(0, Math.min(1, progress));
    const id = setTimeout(() => {
      p.value = withTiming(target, {
        duration: 1100,
        easing: Easing.out(Easing.cubic),
      });
    }, delay);
    return () => clearTimeout(id);
  }, [progress, p, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - p.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={from} />
            <Stop offset="100%" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          animatedProps={animatedProps}
          // start the sweep at 12 o'clock
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
