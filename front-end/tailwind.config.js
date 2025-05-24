/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'table-empty': '#e5e7eb',
        'table-ready': '#22c55e', 
        'table-cooking': '#3b82f6',
        'table-waiting': '#ef4444',
      }
    },
  },
  plugins: [],
}