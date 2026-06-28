/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit_400Regular', 'sans-serif'],
        bold: ['Outfit_700Bold', 'sans-serif'],
        black: ['Outfit_900Black', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
