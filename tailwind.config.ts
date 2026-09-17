import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0A0B",
        surface: "#141416",
        "surface-2": "#1B1B1E",
        border: "#232326",
        "border-strong": "#2E2E32",
        text: {
          primary: "#EDEDED",
          secondary: "#9A9A9E",
          disabled: "#5C5C60",
        },
        accent: {
          DEFAULT: "#3DB8A6",
          hover: "#4FCBB8",
          muted: "#1E3A36",
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
