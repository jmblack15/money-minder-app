/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0F0F14',
        surface: '#1A1A24',
        primary: '#7C5CFC',
        income: '#2DD4A7',
        expense: '#FF6B6B',
        textPrimary: '#FFFFFF',
        textSecondary: '#8B8FA8',
        border: '#2A2A3A',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
