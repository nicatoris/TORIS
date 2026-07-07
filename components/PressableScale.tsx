import React from "react";
import { Pressable, PressableProps, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { haptics } from "@/lib/haptics";
import { springs } from "@/lib/theme";

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
 * The baseline tappable primitive: springs down on touch and overshoots back
 * on release, with a haptic tick. Physical spring (not a timing curve) so
 * repeated taps feel alive rather than mechanical.
 */
export function PressableScale({
  children,
  activeScale = 0.96,
  haptic = "light",
  onPressIn,
  onPressOut,
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
        // quick timing down feels crisper than a spring on the way in
        scale.value = withTiming(activeScale, { duration: 90 });
        if (!disabled && haptic !== "none") haptics[haptic]();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, springs.press);
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={[animatedStyle, style, disabled ? { opacity: 0.45 } : null]}
    >
      {children}
    </AnimatedPressable>
  );
}
