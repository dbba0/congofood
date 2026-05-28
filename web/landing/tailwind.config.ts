import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#1A1A2E',
        'surface-alt': '#111118',
        border: '#2A2A35',
        brand: {
          orange: '#E85D04',
          'orange-light': '#FF6B00',
          'orange-dark': '#C44E00',
          lime: '#C8FF57',
          'lime-dark': '#A8E040',
        },
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        dm: ['var(--font-dm-sans)', 'sans-serif'],
      },
      transitionDuration: {
        '600': '600ms',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'count-up': 'countUp 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.8)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'glow-orange': 'radial-gradient(circle at 30% 30%, rgba(232,93,4,0.15) 0%, transparent 60%)',
        'glow-lime': 'radial-gradient(circle at 70% 70%, rgba(200,255,87,0.08) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}

export default config
