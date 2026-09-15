/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#0b1020',
          nav: '#0f172a',
          card: '#151d33',
          'card-2': '#1a2440',
          elevated: '#1e2a4a',
          input: '#101a33',
        },
        border: {
          subtle: '#263253',
          strong: '#334372',
        },
        text: {
          primary: '#e5e9f2',
          secondary: '#aab4cf',
          tertiary: '#7683a6',
        },
        accent: {
          green: '#10b981',
          red: '#ef4444',
          blue: '#3b82f6',
          amber: '#f59e0b',
          violet: '#8b5cf6',
        },
        revenue: '#10b981',
        expense: '#ef4444',
        balance: '#3b82f6',
        savings: '#8b5cf6',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 0 rgba(0,0,0,0.2)',
        pop: '0 10px 25px -5px rgba(0,0,0,0.4), 0 4px 10px -2px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};
