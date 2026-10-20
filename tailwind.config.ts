import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-in-left": "slide-in-left 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
      },
      colors: {
        canvas: "#0A0A0B",
        surface: "#141416",
        "surface-2": "#1B1B1E",
        border: "#28282C",
        "border-strong": "#4A4A52",
        text: {
          primary: "#EDEDED",
          secondary: "#9A9A9E",
          disabled: "#828288",
        },
        accent: {
          // Brand red, matched to the logo mark. Used as a fill (buttons,
          // progress, active states) — light text sits on top of it.
          DEFAULT: "#D32F2F",
          // Lighter red: this is the one to use for red TEXT/links on the
          // dark surfaces (>= 4.5:1 contrast there).
          hover: "#EF5350",
          // Dark red tint for subtle backgrounds (selected rows, pills).
          muted: "#3A1416",
          // Darker red for the hover/pressed state of filled buttons, so
          // light text on top keeps its contrast.
          pressed: "#B71C1C",
          // Text color for content placed ON a filled accent background.
          // Deliberately not named `base`, to avoid colliding with
          // Tailwind's `text-base` font-size utility.
          ink: "#F5F5F7",
        },
        status: {
          idea: "#9A9A9E",
          planning: "#6B8FCF",
          ready: "#D32F2F",
          shooting: "#E0B84D",
          missing: "#D96C5F",
          voiceover: "#00B4FF",
          edit: "#D32F2F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jbmono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },
    },
  },
  plugins: [],
};

export default config;
