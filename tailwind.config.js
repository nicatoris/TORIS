/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // App surfaces
        ink: {
          900: "#0B0F14",
          800: "#111820",
          700: "#161F2A",
          600: "#1E2A38",
          500: "#2A3A4D",
        },
        // Brand — kratom leaf green
        leaf: {
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        // Accents for drink types
        extract: {
          400: "#C084FC",
          500: "#A855F7",
        },
        tea: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        // Streak / danger
        danger: {
          400: "#FB7185",
          500: "#F43F5E",
        },
        gold: {
          400: "#FCD34D",
          500: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
