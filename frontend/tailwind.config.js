/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 清新系列 - 极光配色
        'aurora': {
          50: '#f0fdf9',
          100: '#dcfce7',
          200: '#86efac',
          300: '#6EE7B7',
          400: '#4ade80',
          500: '#22c55e',
        },
        'fresh-sky': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#3B82F6',
          500: '#0ea5e9',
        },
        'lavender': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#9333EA',
        },
        // 亮点色
        'pink-accent': {
          400: '#F472B6',
          500: '#ec4899',
        },
        // 中性色 - 深蓝
        'slate-dark': {
          900: '#1e293b',
          800: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // 液态玻璃投影
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 20px 40px 0 rgba(31, 38, 135, 0.2)',
        // 悬浮投影
        'floating': '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        'floating-lg': '0 20px 50px -10px rgba(0, 0, 0, 0.15)',
        // 彩色光晕
        'glow-aurora': '0 0 20px rgba(110, 231, 183, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-purple': '0 0 20px rgba(147, 51, 234, 0.4)',
        'glow-pink': '0 0 20px rgba(244, 114, 182, 0.4)',
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
          '0%, 100%': { boxShadow: '0 0 10px rgba(110, 231, 183, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(110, 231, 183, 0.8)' },
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

