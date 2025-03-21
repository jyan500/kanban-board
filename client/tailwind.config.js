/** @type {import('tailwindcss').Config} */
module.exports = {
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
      }
    },
  },
  variants: {
    display: ['group-hover'],
  },
  plugins: [],
}

