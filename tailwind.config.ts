import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0d0d0d",
        forest: "#001e2b",
        evergreen: "#00684a",
        leaf: "#00ed64",
        openai: "#10a37f",
        "oa-black": "#0d0d0d",
        paper: "#f3e6cf",
        crimson: "#e10600",
        cyanx: "#18f0ff",
        mag: "#ff2bd6",
        gold: "#ffd000",
        panel: "#001e2b",
      },
      fontFamily: {
        bangers: ["var(--font-bangers)", "Impact", "sans-serif"],
        black: ["var(--font-archivo-black)", "Arial Black", "sans-serif"],
        cond: ["var(--font-archivo-narrow)", "Arial Narrow", "sans-serif"],
      },
      boxShadow: {
        slam: "8px 8px 0 #000",
        glow: "0 0 0 4px #ffd000, 0 0 24px #e10600",
        leaf: "8px 8px 0 #000, inset 0 0 0 2px #00ed64",
        oa: "8px 8px 0 #000, inset 0 0 0 2px #10a37f",
      },
    },
  },
  plugins: [],
};

export default config;
