/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        revenue: '#16a34a',
        expense: '#dc2626',
        balance: '#2563eb',
        savings: '#9333ea',
      },
    },
  },
  plugins: [],
};
