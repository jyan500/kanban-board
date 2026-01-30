/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "selector",
  prefix: "tw-",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0d6efd", /* light blue */
        "light-primary": "#f0f9ff", /* sky-50 */
        secondary: "#6c757d", /* gray */
        success: "#198754", /* light green */
        warning: "#ffc107", /* yellow */ 
        danger: "#dc3545", /* red */
        "light-purple": "#904ee2", /* purple */
      },
      backgroundImage: {
          'gradient-background': 'linear-gradient(to bottom, rgb(219 234 254), rgb(249 250 251))',
          'gradient-light': 'linear-gradient(to bottom right, rgb(239 246 255), rgb(219 234 254))',
          'gradient-dark': 'linear-gradient(to right, rgb(37 99 235), rgb(30 64 175))',
          'dark-mode-gradient': 'linear-gradient(to bottom right, rgb(30 41 59), rgb(51 65 85))', // slate-800 to slate-700
          'dark-mode-modal-gradient': 'linear-gradient(to bottom right, rgb(51 65 85), rgb(71 85 105))' //slate-700 to slate-600
      },
      keyframes: {
          'fade-in-up': {
              '0%': {
                  opacity: '0',
                  transform: 'translateY(30px)'
              },
              '100%': {
                  opacity: '1',
                  transform: 'translateY(0)'
              }
          }
      },
      animation: {
          'fade-in-up': 'fade-in-up 0.8s ease-out forwards'
      }
    },
  },
  variants: {
    display: ['group-hover'],
  },
  plugins: [],
}

