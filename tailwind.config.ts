import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neumorphic palette
        bg: "#EBEFF5",
        card: "#ffffff",
        cobalt: "#0052A3",
        cerulean: "#2A7ADE",
        slate: "#3A4750",
        "slate-light": "#6B7A84",
        // Neumorphic shadows helpers via CSS vars
      },
      boxShadow: {
        neu: "6px 6px 12px #c8cfd8, -6px -6px 12px #ffffff",
        "neu-sm": "3px 3px 7px #c8cfd8, -3px -3px 7px #ffffff",
        "neu-inset": "inset 4px 4px 8px #c8cfd8, inset -4px -4px 8px #ffffff",
        "neu-pressed": "inset 3px 3px 6px #c8cfd8, inset -3px -3px 6px #ffffff",
        "card": "0 4px 20px rgba(0,82,163,0.08)",
      },
      backgroundImage: {
        "cobalt-gradient": "linear-gradient(135deg, #0052A3 0%, #2A7ADE 100%)",
        "cerulean-gradient": "linear-gradient(135deg, #2A7ADE 0%, #5BA3F5 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
