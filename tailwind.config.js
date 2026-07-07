/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Neutral iOS-style surfaces (no color cast) — base black with
        // progressively lighter grouped/elevated fills.
        ink: {
          900: "#000000", // app base
          850: "#0C0C0E", // subtle raised base
          800: "#151517", // grouped card
          700: "#1F1F22", // elevated / input / chip
          600: "#2E2E31", // border
          500: "#8E8E93", // secondary label (systemGray)
        },
        // Primary tint + Leaf Tea (kratom leaf) — iOS systemGreen
        leaf: {
          300: "#5EE187",
          400: "#30D158",
          500: "#30D158",
          600: "#248A3D",
        },
        // Extract — iOS systemPurple
        extract: {
          400: "#BF5AF2",
          500: "#A855F7",
        },
        // Caution (schedule hold) — iOS systemOrange, used sparingly
        warn: {
          400: "#FFB340",
          500: "#FF9F0A",
        },
        // Destructive — iOS systemRed
        danger: {
          400: "#FF6961",
          500: "#FF453A",
        },
        // Medal accent
        gold: {
          400: "#E7C868",
          500: "#D4A93A",
        },
      },
      borderRadius: {
        "4xl": "28px",
        "5xl": "34px",
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
