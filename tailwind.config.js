/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // JUV Brand Colors
        primary: {
          50: '#f1f4f6',
          100: '#dde4ea',
          200: '#c2cdd7',
          300: '#a7b6c3',
          400: '#8c9eae',
          500: '#5e6a73', // tuned to logo
          600: '#4b5961',
          700: '#3b474d',
          800: '#2c363a',
          900: '#1f262a',
        },
        cream: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf2e9', // Main background color (cream-beige)
          300: '#f8e6d3',
          400: '#f3d7b4',
          500: '#eac892',
          600: '#d7b274',
          700: '#b89158',
          800: '#967347',
          900: '#7a5c3a',
        },
        accent: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          rose: '#e8b4b8',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'elegant': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
        'luxury': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}; 