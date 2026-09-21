import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0B",
        surface: "#141416",
        "surface-2": "#1B1B1E",
        border: "#45454C",
        "border-strong": "#626268",
        text: {
          primary: "#EDEDED",
          secondary: "#9A9A9E",
          disabled: "#828288",
        },
        accent: {
          DEFAULT: "#3DB8A6",
          hover: "#4FCBB8",
          muted: "#1E3A36",
          // Text color for content placed ON a filled accent background
          // (buttons, active states). Deliberately not named the same as
          // the `base` background color, to avoid colliding with
          // Tailwind's `text-base` font-size utility.
          ink: "#0A0A0B",
        },
        status: {
          idea: "#9A9A9E",
          planning: "#6B8FCF",
          ready: "#3DB8A6",
          shooting: "#E0B84D",
          missing: "#D96C5F",
          edit: "#3DB8A6",
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
