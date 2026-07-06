import React, { useEffect } from "react";
import { TextInput, TextStyle, StyleProp } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";

Animated.addWhitelistedNativeProps({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Counts up (or down) to `value` on change. Uses an animated, non-editable
 * TextInput so the tween runs entirely on the UI thread — no per-frame
 * React re-renders.
 */
export function AnimatedCounter({ value, duration = 900, style }: Props) {
  const progress = useSharedValue(value);

  useEffect(() => {
    progress.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, duration, progress]);

  const animatedProps = useAnimatedProps(() => {
    return { text: `${Math.round(progress.value)}` } as any;
  });

  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      value={`${Math.round(value)}`}
      animatedProps={animatedProps}
      style={[{ padding: 0 }, style]}
      pointerEvents="none"
    />
  );
}
