/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
        },
        colors: {
            'green-800': '#1A5D1A',
            'green-900': '#104A10',
            'yellow-400': '#FFD700',
        },
    },
  },
  plugins: [],
}