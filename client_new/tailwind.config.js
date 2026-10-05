/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '720px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        modification: {
          remove: '#f87171',
          add: '#34d399',
          change: '#fb923c',
          custom: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}
