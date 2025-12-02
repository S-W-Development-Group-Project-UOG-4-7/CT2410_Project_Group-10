/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6b3f23",   // dark brown
        secondary: "#8bc34a", // light green
        background: "#4ca150",

        accent1: "#66bb6a",
        accent2: "#5d4037",
        accent3: "#9e9e9e",
        accent4: "#f9faf7",
        accent5: "#ecece1",
        accent6: "#2f3e46",

        coco: "#2e1d1a",
        connect: "#8bc34a",
      },
      fontFamily: {
        logo: ["Bangers", "cursive"],
        nunito: ["Nunito", "sans-serif"],
      },
    },
  },
  plugins: [],
};
