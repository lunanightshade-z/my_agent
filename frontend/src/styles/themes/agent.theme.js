/**
 * Agent 页面主题 - 空气感淡色风格
 * 浅色背景 + 青色/绿色强调色
 */
import { createTheme } from './base.theme';
import { spacing, typography, borderRadius, shadows, animations, breakpoints } from '../tokens';

export const agentTheme = createTheme({
  colors: {
    primary: '#14b8a6',                    // teal - 青色
    secondary: '#e8d9c3',                  // 香槟色
    background: '#fdfcf8',                  // 空气感米白
    surface: 'rgba(255, 255, 255, 0.7)',   // 半透明白
    text: {
      primary: '#334155',                  // 深灰蓝
      secondary: '#64748b',                // 中灰蓝
      accent: '#14b8a6',                  // 青色强调
    },
    border: 'rgba(255, 255, 255, 0.6)',   // 白色边框
    glass: 'rgba(255, 255, 255, 0.5)',    // 玻璃态背景(更透明)
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  spacing,
  typography: {
    ...typography,
    fontFamily: {
      sans: '"Inter", system-ui, -apple-system, sans-serif',
      mono: '"Fira Code", "Monaco", "Courier New", monospace',
    },
  },
  borderRadius: {
    ...borderRadius,
    // Agent 页面使用更大的圆角
    '2xl': '2rem',                        // 32px
    '3xl': '2.5rem',                      // 40px
  },
  shadows: {
    ...shadows,
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    'glass-lg': '0 20px 40px 0 rgba(0, 0, 0, 0.15)',
  },
  animations,
  breakpoints,
  custom: {
    // Agent 页面特有的自定义属性
    name: 'agent',
    style: 'air-light',
    backgroundGradient: 'radial-gradient(ellipse at 20% 50%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)',
    particleColor: '#14b8a6',
    ambientColors: {
      teal: 'rgba(20, 184, 166, 0.1)',
      purple: 'rgba(139, 92, 246, 0.1)',
      pink: 'rgba(236, 72, 153, 0.1)',
    },
  },
});
