/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New Brand Colors
        brand: {
          orange: '#FD895A',
          blue: '#0051C7',
          navy: '#011D4C',
          coral: '#FE505A',
          teal: '#02ADCB',
        },
        primary: {
          50: '#e6f3ff',
          100: '#cce7ff',
          200: '#99cfff',
          300: '#66b7ff',
          400: '#339fff',
          500: '#0051C7',
          600: '#0041a0',
          700: '#003179',
          800: '#002152',
          900: '#011D4C',
        },
        secondary: {
          50: '#fff4f2',
          100: '#ffe9e5',
          200: '#ffd3cc',
          300: '#ffbdb2',
          400: '#ffa799',
          500: '#FD895A',
          600: '#ca6d48',
          700: '#975236',
          800: '#643624',
          900: '#321b12',
        },
        accent: {
          50: '#e6f9fc',
          100: '#ccf3f9',
          200: '#99e7f3',
          300: '#66dbed',
          400: '#33cfe7',
          500: '#02ADCB',
          600: '#028aa2',
          700: '#01687a',
          800: '#014551',
          900: '#002329',
        },
        medical: {
          50: '#fff2f2',
          100: '#ffe5e5',
          200: '#ffcccc',
          300: '#ffb2b2',
          400: '#ff9999',
          500: '#FE505A',
          600: '#cb4048',
          700: '#983036',
          800: '#662024',
          900: '#331012',
        }
      },
      fontFamily: {
        'bangla': ['Noto Sans Bengali', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'english': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}