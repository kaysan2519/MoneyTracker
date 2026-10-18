import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0C0D0E",
        surface: {
          DEFAULT: "#131417",
          subtle: "#181A1E",
          hover: "#1D1F24",
          border: "#23262D",
          borderSubtle: "rgba(255, 255, 255, 0.07)",
        },
        text: {
          primary: "#F4F4F6",
          secondary: "#8E929B",
          muted: "#5C606A",
        },
        brand: {
          DEFAULT: "#10B981",
          hover: "#059669",
          muted: "rgba(16, 185, 129, 0.12)",
        },
        income: {
          DEFAULT: "#10B981",
          text: "#34D399",
          subtle: "rgba(16, 185, 129, 0.1)",
        },
        expense: {
          DEFAULT: "#E11D48",
          text: "#FB7185",
          subtle: "rgba(225, 29, 72, 0.1)",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
    },
  },
  plugins: [],
};
export default config;
