/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ciano: '#06B6D4',
        azul: '#2563EB',
        violeta: '#8B5CF6',
        cinza: '#64748B',
        escuro: '#0F172A',
        surface: '#F8FAFC',
        darkSurface: '#1E293B',
        darkText: '#F1F5F9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
