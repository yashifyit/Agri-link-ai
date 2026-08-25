/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#123C2A',
          hover: '#0E2E20',
          light: '#1B543B'
        },
        agriGreen: {
          DEFAULT: '#238B57',
          hover: '#1B7347',
          light: '#EAF5EF',
          accent: '#47B978'
        },
        earth: {
          DEFAULT: '#8B6F47',
          light: '#F5EFE6'
        },
        amberGold: {
          DEFAULT: '#E5A93D',
          light: '#FEF8EC'
        },
        cream: {
          DEFAULT: '#F7F5EF',
          dark: '#EFECE3'
        },
        charcoal: {
          DEFAULT: '#18211C',
          muted: '#69756D',
          light: '#A1AAA4'
        },
        agriBorder: '#DDE4DE',
        agriDanger: '#D9534F',
        agriSuccess: '#238B57'
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(18, 60, 42, 0.08), 0 4px 16px -4px rgba(18, 60, 42, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(18, 60, 42, 0.12), 0 4px 12px -2px rgba(18, 60, 42, 0.08)',
        'modal': '0 20px 40px -10px rgba(18, 60, 42, 0.25)',
      }
    },
  },
  plugins: [],
}
