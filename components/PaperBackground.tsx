import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import { palette } from "@/lib/theme";

/**
 * A calm editorial canvas: a warm paper wash with a single, very soft light
 * bloom near the top so the page has quiet depth without any "app" flashiness.
 * Static and cheap — the restraint is the point.
 */
export function PaperBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={["#F7F4EC", "#F2EFE6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="bloom" cx="50%" cy="0%" r="70%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.75} />
            <Stop offset="60%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bloom)" />
      </Svg>
    </View>
  );
}
