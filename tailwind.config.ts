import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0B",
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
          DEFAULT: "#4052D6",
          hover: "#6675DE",
          muted: "#181C3E",
          // Text color for content placed ON a filled accent background
          // (buttons, active states). Deliberately not named the same as
          // the `base` background color, to avoid colliding with
          // Tailwind's `text-base` font-size utility.
          // Light here (not dark) because this accent is a saturated,
          // fairly dark blue — needs light text on top for contrast.
          ink: "#F5F5F7",
        },
        status: {
          idea: "#9A9A9E",
          planning: "#6B8FCF",
          ready: "#4052D6",
          shooting: "#E0B84D",
          missing: "#D96C5F",
          voiceover: "#00B4FF",
          edit: "#4052D6",
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
