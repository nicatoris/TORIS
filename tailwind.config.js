/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Warm paper canvas + ink text. `ink` scale runs light -> dark here:
        // 900 = darkest ink text, 500 = mid, low numbers = surfaces.
        paper: {
          DEFAULT: "#F4F1E9",
          raised: "#FBF9F3",
          card: "#FFFFFF",
          alt: "#FAF8F2",
        },
        ink: {
          900: "#1B1B16", // primary text
          700: "#4A4842",
          500: "#6C6A60", // secondary text
          400: "#A6A399", // tertiary text
        },
        // Primary tint + Leaf Tea — deep botanical green
        leaf: {
          300: "#3E7A5B",
          400: "#2F5D45",
          500: "#2F5D45",
          600: "#234A36",
        },
        // Extract — warm clay
        extract: {
          400: "#B4623C",
          500: "#8F4A2B",
        },
        // Caution (schedule hold), used sparingly
        warn: {
          400: "#B5852A",
          500: "#8F6816",
        },
        // Destructive
        danger: {
          400: "#B4443C",
          500: "#8F332C",
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
        serif: ["Georgia"],
      },
    },
  },
  plugins: [],
};
