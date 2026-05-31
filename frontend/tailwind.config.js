/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        school: {
          primary: '#1e40af',
          secondary: '#1e3a8a',
          accent: '#3b82f6',
          light: '#dbeafe',
          dark: '#172554',
        },
      },
    },
  },
  plugins: [],
};
