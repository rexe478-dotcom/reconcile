/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF8F5',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F5F2EA',
          card: '#F0ECE4',
          hover: '#EAE5DB',
        },
        border: {
          DEFAULT: '#E5E0D8',
          subtle: '#EDE8DF',
        },
        accent: {
          DEFAULT: '#3D5438',
          hover: '#32462E',
          muted: 'rgba(61, 84, 56, 0.12)',
          surface: '#E2EBD8',
          light: '#D6E2CE',
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
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
