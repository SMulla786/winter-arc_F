import { screens as _screens } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['"Plus Jakarta Sans"', 'sans-serif'],
    },
    screens: {
      '2xsm': '375px',
      xsm: '425px',
      '3xl': '2000px',
      ..._screens,
    },
    extend: {
      colors: {
        grimoire: {
          bg: '#080808',
          surface: '#0d0d0f',
          card: '#121216',
          hover: '#18181f',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        crimson: {
          DEFAULT: '#dc2626',
          dark: '#b91c1c',
          light: '#ef4444',
          glow: 'rgba(220, 38, 38, 0.25)',
        },
        gold: {
          DEFAULT: '#f59e0b',
          bright: '#fbbf24',
        },
        success: '#22c55e',
        danger: '#dc2626',
        warning: '#f59e0b',
      },
    },
  },
  plugins: [],
};
