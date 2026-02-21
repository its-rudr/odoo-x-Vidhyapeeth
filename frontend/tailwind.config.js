/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Bricolage Grotesque', 'sans-serif'],
      bricolage: ['Bricolage Grotesque', 'sans-serif'],
    },
    extend: {
<<<<<<< HEAD
=======
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        bricolage: ['Bricolage Grotesque', 'sans-serif'],
      },
>>>>>>> 6a07b49c2a07c4e1bebb3d079ca74359b4e291d0
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
