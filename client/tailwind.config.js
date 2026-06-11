/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'premium-black': 'var(--premium-black)',
        'premium-gray': 'var(--premium-gray)',
        'premium-gold': 'var(--premium-gold)',
        'premium-accent': 'var(--premium-accent)',
        'premium-muted': 'var(--premium-muted)',
        'premium-muted-light': 'var(--premium-muted-light)',
        'premium-border': 'var(--premium-border)',
      }
    },
  },
  plugins: [
    require("daisyui"),
  ],
}

