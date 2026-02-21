/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
      },
      colors: {
        primary: '#DD700B',
        secondary: '#7C7D75',
        'accent-light': '#FCF8D8',
        'accent-dark': '#ADACA7',
        'accent-muted': '#D9DADF',
      },
    },
  },
  plugins: [],
};
