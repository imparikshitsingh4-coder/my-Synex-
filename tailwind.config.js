/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f1e",
        foreground: "#ffffff",
        primary: "#00d9ff",
        secondary: "#7c3aed",
        accent: "#ff1493",
        muted: "#4b5563",
      },
      fontFamily: {
        sans: ["system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
