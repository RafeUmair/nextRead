/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDF8F3',
          100: '#FAF0E6',
          200: '#F5E6D3',
        },
        navy: {
          600: '#2D3A4A',
          700: '#1E2A3A',
          800: '#152238',
          900: '#0F172A',
        },
        orange: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    },
  },
  plugins: [],
}
