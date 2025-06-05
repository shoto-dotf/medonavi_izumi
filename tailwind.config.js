/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mednavi: {
          blue: '#0088cc',
          pink: '#ff99aa',
        },
      },
    },
  },
  plugins: [],
};