import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/lib/haptics";
import { palette, springs } from "@/lib/theme";

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

const W = 52;
const H = 32;
const PAD = 3;
const KNOB = H - PAD * 2;

/** A custom spring-driven switch — the knob overshoots slightly on toggle. */
export function Toggle({ value, onChange }: Props) {
  const v = useDerivedValue(() => withSpring(value ? 1 : 0, springs.press));
  const tint = useDerivedValue(() => withTiming(value ? 1 : 0, { duration: 220 }));

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      tint.value,
      [0, 1],
      ["rgba(26,26,21,0.16)", palette.accent],
    ),
  }));

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: v.value * (W - KNOB - PAD * 2) }],
  }));

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onChange(!value);
      }}
      hitSlop={8}
    >
      <Animated.View
        style={[
          { width: W, height: H, borderRadius: H / 2, padding: PAD, justifyContent: "center" },
          track,
        ]}
      >
        <Animated.View
          style={[
            {
              width: KNOB,
              height: KNOB,
              borderRadius: KNOB / 2,
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
            },
            knob,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
