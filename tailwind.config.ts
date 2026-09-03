import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#09070c",
        paper: "#f3e6cf",
        crimson: "#e10600",
        cyanx: "#18f0ff",
        mag: "#ff2bd6",
        gold: "#ffd000",
        panel: "#14060a",
      },
      fontFamily: {
        bangers: ["var(--font-bangers)", "Impact", "sans-serif"],
        black: ["var(--font-archivo-black)", "Arial Black", "sans-serif"],
        cond: ["var(--font-archivo-narrow)", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        slam: "8px 8px 0 #000",
        glow: "0 0 0 4px #ffd000, 0 0 24px #e10600",
      },
    },
  },
  plugins: [],
};

export default config;
