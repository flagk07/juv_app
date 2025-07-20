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
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98', // Main brand color (cool gray-blue)
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        cream: {
          50: '#fefdfb',
          100: '#fef9f3',
          200: '#fdf2e9', // Main background color (cream-beige)
          300: '#fce7d6',
          400: '#f7d794',
          500: '#f2c94c',
          600: '#f2b824',
          700: '#f29f05',
          800: '#cc8400',
          900: '#996300',
        },
        accent: {
          gold: '#d4af37',
          silver: '#c0c0c0',
          rose: '#e8b4b8',
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
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
        'elegant': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'luxury': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}; 