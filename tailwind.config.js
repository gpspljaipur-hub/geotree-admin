/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pink: '#df3b91',
        blue: '#28479d',
        indigo: '#20397d',
        gray: {
          50: '#f7f8fa',
          100: '#eceef2',
          200: '#dfe3e9',
          300: '#9ca3b1',
          400: '#788193',
          500: '#6a7489',
          600: '#4b586e',
          700: '#354052',
          800: '#1c2738',
          900: '#0b1428',
        }
      }
    },
  },
  plugins: [],
}
