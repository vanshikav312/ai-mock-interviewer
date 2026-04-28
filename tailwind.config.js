/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'razor-navy': '#0E2C40',
        'razor-teal': '#1A4A5A',
        'razor-accent': '#148D8D',
        'razor-green': '#C1E1A7',
        'razor-peach': '#EFBC75',
      },
    },
  },
  plugins: [],
};
