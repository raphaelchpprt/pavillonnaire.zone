const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      display: ['Gilroy', 'Arial', 'sans-serif'],
      body: ['Redaction35', 'Arial', 'sans-serif'],
      serif: ['Yoster-Island', 'serif'],
    },
    extend: {
      colors: {
        muted: colors.gray[400],
      },
    },
  },
  plugins: [],
};
