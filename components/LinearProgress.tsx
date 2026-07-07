import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { palette } from "@/lib/theme";

interface Props {
  /** 0..1 */
  progress: number;
  color?: string;
  track?: string;
  height?: number;
  delay?: number;
}

/**
 * A slim editorial progress rule that eases its fill in from the left — used
 * instead of a chunky ring, in keeping with the magazine-like layout.
 */
export function LinearProgress({
  progress,
  color = palette.accent,
  track = "rgba(26,26,21,0.08)",
  height = 6,
  delay = 350,
}: Props) {
  const p = useSharedValue(0);

  useEffect(() => {
    const target = Math.max(0, Math.min(1, progress));
    p.value = withDelay(
      delay,
      withTiming(target, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
  }, [progress, p, delay]);

  const fill = useAnimatedStyle(() => ({
    width: `${p.value * 100}%`,
  }));

  return (
    <View
      style={{
        height,
        borderRadius: height,
        backgroundColor: track,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          { height: "100%", borderRadius: height, backgroundColor: color },
          fill,
        ]}
      />
    </View>
  );
}
