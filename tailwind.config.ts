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
        paper: {
          light: "#F7F1DF",
          surface: "#F2EBCE",
          dark: "#0B211C",
          "dark-surface": "#0F2B25",
        },
        forest: {
          DEFAULT: "#103B2D",
          dark: "#0B211C",
          light: "#1A5240",
          border: "#D8D0BD",
          "border-dark": "#1C4238",
        },
        coral: {
          DEFAULT: "#F24B2A",
          hover: "#DC3C1D",
          light: "#FEEAE5",
          dark: "#4A180E",
        },
        mustard: {
          DEFAULT: "#D8A83C",
          hover: "#C4952D",
          light: "#FAF3E3",
          dark: "#42320E",
        },
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        editorial: "3px 3px 0px 0px #103B2D",
        "editorial-coral": "3px 3px 0px 0px #F24B2A",
        "editorial-dark": "3px 3px 0px 0px #F7F1DF",
        "editorial-sm": "2px 2px 0px 0px #103B2D",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
