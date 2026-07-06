import React from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/lib/haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Feedback = "light" | "medium" | "selection" | "none";

interface Props extends PressableProps {
  children: React.ReactNode;
  /** How far to scale down while pressed (default 0.96) */
  activeScale?: number;
  /** Haptic played on press-in (default "light") */
  haptic?: Feedback;
  style?: ViewStyle;
  className?: string;
}

/**
 * A pressable that springs down slightly and fires a haptic on touch — the
 * baseline "this is tappable and feels alive" primitive used across the app.
 */
export function PressableScale({
  children,
  activeScale = 0.96,
  haptic = "light",
  onPressIn,
  onPress,
  disabled,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        scale.value = withTiming(activeScale, { duration: 90 });
        if (!disabled && haptic !== "none") haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 });
      }}
      onPress={onPress}
      style={[animatedStyle, style, disabled ? { opacity: 0.5 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
