/**
 * Central design tokens for the light, editorial theme. Shared by JS-driven
 * visuals (SVG, Reanimated, shadows) that can't read Tailwind classes.
 * Keep in sync with tailwind.config.js.
 */
import { Easing, WithSpringConfig, WithTimingConfig } from "react-native-reanimated";

export const palette = {
  // Warm paper canvas + floating white surfaces
  bg: "#F4F1E9",
  bgRaised: "#FBF9F3",
  card: "#FFFFFF",
  cardAlt: "#FAF8F2",
  border: "rgba(26,26,21,0.08)",
  hairline: "rgba(26,26,21,0.10)",

  // Warm ink text
  label: "#1B1B16",
  label2: "#6C6A60",
  label3: "#A6A399",

  // Signature accent — a deep botanical green
  accent: "#2F5D45",
  accentDeep: "#234A36",
  accentBright: "#3E7A5B",
  accentSoft: "rgba(47,93,69,0.10)",
  onAccent: "#F6F4EC",

  // Leaf Tea shares the green; Extract is a warm clay
  extract: "#B4623C",
  extractDeep: "#8F4A2B",

  warn: "#B5852A",
  danger: "#B4443C",
};

/** Soft editorial shadows. Applied via style props (web -> box-shadow). */
export const shadow = {
  card: {
    shadowColor: "#1A1A15",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  float: {
    shadowColor: "#141410",
    shadowOpacity: 0.14,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
};

/** Serif display family — editorial headlines & numerals. Georgia on iOS. */
export const serif = "Georgia";

/** Physical spring presets — reuse so motion reads as one system. */
export const springs = {
  press: { mass: 0.5, damping: 15, stiffness: 320 } as WithSpringConfig,
  gentle: { mass: 0.9, damping: 18, stiffness: 160 } as WithSpringConfig,
  bouncy: { mass: 0.7, damping: 11, stiffness: 220 } as WithSpringConfig,
};

export const timings = {
  quick: { duration: 220, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  smooth: { duration: 420, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
  slow: { duration: 700, easing: Easing.out(Easing.cubic) } as WithTimingConfig,
};
