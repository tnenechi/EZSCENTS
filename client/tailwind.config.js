/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          gold: '#D4AF37',
          black: '#0A0A0A',
          gray: '#1A1A1A',
        }
      }
    },
  },
  plugins: [],
}

