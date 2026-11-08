/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F3ED',
        paper: '#E5E0D5',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#FAF8F5',
          card: '#F5F3ED',
          hover: '#E5E0D5',
        },
        border: {
          DEFAULT: '#E5E0D5',
          subtle: '#DAD8D0',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#858477',
        },
        accent: {
          DEFAULT: '#A5C96B',
          hover: '#92B559',
          dark: '#3D5438',
          muted: 'rgba(165, 201, 107, 0.18)',
          surface: '#EBF3DF',
          light: '#E2EBD8',
        },
        badge: {
          activeBg: '#E2EBD8',
          activeText: '#3D5438',
          reviewBg: '#FDEEE2',
          reviewText: '#C2671A',
          cancelBg: '#FDF2F0',
          cancelText: '#B42318',
        },
        brand: {
          netflix: '#E50914',
          spotify: '#1DB954',
          apple: '#A2AAAD',
          adobe: '#FA0F00',
          notion: '#000000',
          youtube: '#FF0000',
          google: '#4285F4',
          chatgpt: '#10A37F',
        }
      },
      scale: {
        '108': '1.08',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-smooth': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
