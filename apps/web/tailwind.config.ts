import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0F0F0F',
        surface: '#1A1A1A',
        'surface-hover': '#242424',
        primary: {
          DEFAULT: '#F5A027',
          dark: '#D68B1F',
          light: '#F7B654',
        },
        secondary: '#2D2D2D',
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A0A0',
          muted: '#707070',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 160, 39, 0.3)',
        'glow-lg': '0 0 40px rgba(245, 160, 39, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
