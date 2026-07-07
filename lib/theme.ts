/**
 * Central design tokens shared by JS-driven visuals (SVG, Reanimated) that
 * can't read Tailwind classes. Keep in sync with tailwind.config.js.
 */
import { Easing, WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

export const palette = {
  bg: "#050506",
  bgRaised: "#0C0C0E",
  card: "#141416",
  cardHi: "#1B1B1E",
  border: "#242427",
  hairline: "rgba(255,255,255,0.07)",

  label: "#F5F5F7",
  label2: "#9A9AA2",
  label3: "#5C5C63",

  // Single signature accent — a refined emerald with a lighter tip for gradients
  accent: "#34E0A1",
  accentDeep: "#12B981",
  accentSoft: "rgba(52,224,161,0.14)",

  extract: "#C08BFF",
  extractDeep: "#8B5CF6",

  warn: "#FFC24B",
  danger: "#FF5E57",
};

/** Physical spring presets — reuse so motion reads as one system. */
export const springs = {
  /** Snappy press/return */
  press: { mass: 0.5, damping: 15, stiffness: 320 } as WithSpringConfig,
  /** Gentle content settle */
  gentle: { mass: 0.9, damping: 18, stiffness: 160 } as WithSpringConfig,
  /** Bouncy, for celebratory moments */
  bouncy: { mass: 0.7, damping: 11, stiffness: 220 } as WithSpringConfig,
};

export const timings = {
  quick: { duration: 220, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  smooth: { duration: 420, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  slow: { duration: 700, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
};
