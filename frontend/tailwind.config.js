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
          primary: '#1a3461',   // Genesis navy blue
          secondary: '#142850', // deeper navy
          accent: '#c9a84c',    // Genesis gold
          light: '#f0e9d6',     // soft gold tint
          dark: '#0f1e3d',      // darkest navy
        },
      },
    },
  },
  plugins: [],
};
