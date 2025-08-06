/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'media'],
  theme: {
    extend: {
      // Les couleurs sont maintenant définies via @theme dans globals.css
      // Cette configuration sert principalement pour le content scanning
    },
  },
  plugins: [],
}