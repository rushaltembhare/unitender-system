/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brick: {
          50: '#fdf8f6',
          100: '#f9eee9',
          200: '#f2dad0',
          300: '#e5bba8',
          400: '#cf8f70',
          500: '#b86144',
          600: '#9e462e',
          700: '#833824',
          800: '#6d2f20',
          900: '#59291d',
          950: '#30130d',
        },
        mahogany: {
          50: '#f8f6f5',
          100: '#eeeae7',
          200: '#ddd4cf',
          300: '#c5b6ae',
          400: '#a89489',
          500: '#8e776a',
          600: '#755f53',
          700: '#5e4b41',
          800: '#4c3d35',
          900: '#261815',
          950: '#170c0a',
        },
        parchment: {
          50: '#fdfbf7',
          100: '#f9f5ec',
          200: '#f2e8d7',
          300: '#e6d5bb',
          400: '#d5bb98',
          500: '#c4a277',
          600: '#b48c62',
          700: '#96704e',
          800: '#7a5a40',
          900: '#644a36',
        }
      }
    },
  },
  plugins: [],
}
