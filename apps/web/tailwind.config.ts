import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0A5C36",
        gold: "#C5961A",
        darkBg: "#1A1A2E",
        lightBg: "#FAFAF5",
        ink: "#1C1008",
        saffron: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#FF671F", // National Flag Saffron (Kesariya)
          600: "#EA580C",
          700: "#C2410C", // Deep Flag Saffron (High Contrast AA)
          800: "#9A3412", // Deep Saffron AAA
          900: "#7C2D12",
          950: "#431407",
        },
        chakra: {
          DEFAULT: "#06038D", // Ashoka Chakra Navy Blue
          light: "#1E40AF",
          dark: "#030252",
        },
        indiaGreen: {
          DEFAULT: "#0A5C36", // India Green (Tiranga)
          light: "#10B981",
          dark: "#064E2B",
        }
      }
    },
  },
  plugins: [],
};
export default config;
