/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Cormorant Garamond", "serif"],
      },
      colors: {
        forest: "#1C3A2A",
        pine: "#2E5240",
        moss: "#4A7A62",
        clay: "#C4572B",
        sand: "#E8DCC8",
        cream: "#F5F0E8",
        charcoal: "#1A1A1A",
        stone: "#6B6B5A",
      },
      borderRadius: {
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "3rem",
      },
    },
  },
  plugins: [],
}

