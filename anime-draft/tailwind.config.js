/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}", // Direct check for files in src
  ],
  theme: {
    extend: {
      colors: {
        animeGold: "#FFD700",
        animeRed: "#FF4500",
      },
    },
  },
  plugins: [],
};
