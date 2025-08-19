/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class", // toggle by adding/removing 'dark' on <html>
  theme: {
    extend: {
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1280px" },
      },
      colors: { brand: { DEFAULT: "#2563eb", foreground: "#ffffff" } },
    },
  },
  plugins: [],
};
