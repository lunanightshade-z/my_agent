/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 高级黑色系主题 - 金色强调
        elite: {
          50: '#faf8f3',
          100: '#f5f1e8',
          300: '#e6dcc2',
          400: '#d4c5a0',
          500: '#b8a986',
          600: '#9d9270',
          gold: '#d4af37',
          champagne: '#e8d9c3',
          copper: '#b87333',
          rose: '#d4a5a5',
        },
        // 黑色背景
        dark: {
          bg: '#0f0f0f',
          surface: '#1a1a1a',
          card: '#262626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        // 玻璃态阴影
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 20px 40px 0 rgba(0, 0, 0, 0.4)',
        // 悬浮阴影
        floating: '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
        'floating-lg': '0 20px 50px -10px rgba(0, 0, 0, 0.6)',
        // 金色光晕
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.3)',
        'glow-champagne': '0 0 20px rgba(232, 217, 195, 0.2)',
        neon: '0 0 20px rgba(212, 175, 55, 0.2)',
        'neon-glow': '0 0 40px rgba(212, 175, 55, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'jelly': 'jelly 0.4s ease-in-out',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-slow': 'bounce 3s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        jelly: {
          '0%, 100%': { transform: 'scale(1)' },
          '25%': { transform: 'scale(1.1, 0.95)' },
          '50%': { transform: 'scale(0.95, 1.05)' },
          '75%': { transform: 'scale(1.05, 0.95)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

