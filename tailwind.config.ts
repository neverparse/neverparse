import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        np: {
          bg: "#0a0a0a",
          surface: "#111111",
          "surface-2": "#1a1a1a",
          border: "#262626",
          accent: "#00d4aa",
          "accent-dim": "#00a885",
          "accent-glow": "rgba(0, 212, 170, 0.15)",
          text: "#e5e5e5",
          "text-dim": "#737373",
          "text-bright": "#ffffff",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
