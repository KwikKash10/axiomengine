/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        game: ['Montserrat', 'sans-serif']
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#4f46e5',
      },
    },
  },
  plugins: [],
} 