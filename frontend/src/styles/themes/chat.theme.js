/**
 * Chat 页面主题 - 赛博朋克金色风格
 * 深色背景 + 金色强调色
 */
import { createTheme } from './base.theme';
import { colors, spacing, typography, borderRadius, shadows, animations, breakpoints } from '../tokens';

export const chatTheme = createTheme({
  colors: {
    primary: colors.accent.gold,           // #d4af37 - 经典黄金
    secondary: colors.accent.champagne,    // #e8d9c3 - 香槟金
    background: colors.background.primary,  // #0f0f0f - 纯黑
    surface: colors.background.secondary,  // #1a1a1a - 深灰黑
    text: {
      primary: '#e2e8f0',                  // 浅灰白
      secondary: '#b8b8b8',                 // 中灰
      accent: colors.accent.gold,          // 金色强调
    },
    border: 'rgba(212, 175, 55, 0.2)',    // 金色边框
    glass: 'rgba(255, 255, 255, 0.08)',   // 玻璃态背景
    success: colors.status.success,
    error: colors.status.error,
    warning: colors.status.warning,
    info: colors.status.info,
  },
  spacing,
  typography,
  borderRadius,
  shadows: {
    ...shadows,
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    'glass-lg': '0 20px 40px 0 rgba(31, 38, 135, 0.2)',
    neon: '0 0 20px rgba(212, 175, 55, 0.3)',
    'neon-gold': '0 0 20px rgba(212, 175, 55, 0.5)',
  },
  animations,
  breakpoints,
  custom: {
    // Chat 页面特有的自定义属性
    name: 'chat',
    style: 'cyberpunk-gold',
    backgroundGradient: 'radial-gradient(circle, #d4af37, #b87333)',
    particleColor: colors.accent.gold,
  },
});
