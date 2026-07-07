/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Near-black neutral surfaces with progressively lighter fills.
        ink: {
          900: "#050506", // app base
          850: "#0C0C0E", // raised base
          800: "#141416", // grouped card
          700: "#1B1B1E", // elevated / input / chip
          600: "#242427", // border
          500: "#9A9AA2", // secondary label
        },
        // Primary tint + Leaf Tea (kratom leaf) — refined emerald
        leaf: {
          300: "#7BF0C4",
          400: "#34E0A1",
          500: "#34E0A1",
          600: "#12B981",
        },
        // Extract — soft violet
        extract: {
          400: "#C08BFF",
          500: "#8B5CF6",
        },
        // Caution (schedule hold), used sparingly
        warn: {
          400: "#FFC24B",
          500: "#FFB020",
        },
        // Destructive
        danger: {
          400: "#FF7A73",
          500: "#FF5E57",
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
