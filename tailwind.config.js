/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        neutral: {
          150: '#ededed',
          650: '#4b5563',
          850: '#1f2937'
        },
        red: {
          150: '#fce8e8',
          650: '#dc2626'
        },
        amber: {
          250: '#fde68a',
          750: '#d97706'
        },
        blue: {
          650: '#2563eb'
        },
        indigo: {
          650: '#4f46e5'
        }
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
