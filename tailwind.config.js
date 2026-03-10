
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#25D366',
          'green-dark': '#1da851',
          'green-light': '#dcfce7',
          blue: '#3b82f6',
          'blue-light': '#eff6ff',
        },
        sidebar: {
          bg: '#0f172a',
          panel: '#1e293b',
          hover: '#334155',
          active: '#25D366',
          text: '#94a3b8',
        },
        slate: {
          850: '#172033',
          950: '#020617',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        sidebar: '4px 0 24px 0 rgb(0 0 0 / 0.15)',
        modal: '0 20px 60px -12px rgb(0 0 0 / 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease forwards',
        'slide-in-left': 'slideInLeft 0.2s ease forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
