import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

interface Props extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  /** Extra classes applied to the inner content view */
  className?: string;
  /** Rounded corners (px) for the glass surface */
  radius?: number;
  /** Draw a hairline top separator (for docked bottom bars) */
  topHairline?: boolean;
}

/**
 * A "liquid glass" surface — an iOS-style translucent, blurred material with a
 * hairline edge. Falls back gracefully to a translucent fill where blur isn't
 * supported.
 */
export function Glass({
  children,
  intensity = 40,
  className = "",
  radius = 0,
  topHairline = false,
  style,
  ...rest
}: Props) {
  return (
    <View
      {...rest}
      style={[{ overflow: "hidden", borderRadius: radius }, style]}
    >
      <BlurView
        intensity={intensity}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
      />
      {/* translucent wash so contrast holds if blur is unavailable */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(20,20,22,0.62)" }]}
      />
      {topHairline ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: StyleSheet.hairlineWidth,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
      ) : null}
      <View className={className}>{children}</View>
    </View>
  );
}
