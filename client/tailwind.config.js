/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A24D',
          light:   '#E8C97A',
          dark:    '#A07830',
        },
        'hero-blue': '#CEDBE2',
        dark: {
          DEFAULT: '#2C2C2C',
          soft:    '#333333',
        },
        surface: '#F9F9F9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(44,44,44,0.08)',
        'card-hover': '0 8px 32px 0 rgba(201,162,77,0.18)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
