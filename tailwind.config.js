/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cobalt: "#0052A3",
        cerulean: "#2A7ADE",
        slate: "#3A4750",
        "slate-light": "#6B7A84",
      },
    },
  },
  plugins: [],
};
