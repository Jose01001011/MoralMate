/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'kunene': {
          'ochre': '#CC8400',
          'sand': '#F4E4BC',
          'sky': '#87CEEB',
          'earth': '#8B4513',
          'sage': '#9CAF88'
        }
      }
    },
  },
  plugins: [],
};
