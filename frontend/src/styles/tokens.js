/**
 * 设计令牌系统 - 唯一真相源
 * 所有颜色、间距、字体、动画等设计元素都在这里定义
 * 组件只引用不定义
 */

// ============ 颜色系统 ============

export const colors = {
  // 深色背景 - 精致黑色系
  background: {
    primary: '#0f0f0f',      // 主背景 - 纯黑
    secondary: '#1a1a1a',    // 次背景 - 深灰黑
    tertiary: '#262626',     // 三级背景 - 中灰黑
    surface: 'rgba(15, 15, 15, 0.9)',
  },

  // 主题色 - 高级金色系
  primary: {
    50: '#faf8f3',
    100: '#f5f1e8',
    300: '#e6dcc2',
    400: '#d4c5a0',
    500: '#b8a986',
    600: '#9d9270',
    gold: '#d4af37',      // 经典黄金
    champagne: '#e8d9c3', // 香槟金
  },

  // 强调色 - 精致补色
  accent: {
    gold: '#d4af37',
    champagne: '#e8d9c3',
    copper: '#b87333',
    rose: '#d4a5a5',
    sage: '#8a9b7b',
  },

  // 中立色 - 黑色调
  neutral: {
    50: '#f5f5f5',
    100: '#e8e8e8',
    200: '#d1d1d1',
    300: '#b8b8b8',
    400: '#8c8c8c',
    500: '#666666',
    600: '#4d4d4d',
    700: '#333333',
    800: '#1a1a1a',
    900: '#0f0f0f',
  },

  // 状态色
  status: {
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
  },

  // 玻璃态背景 - 黑色系
  glass: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
};

// ============ 间距系统 ============

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
};

// ============ 字体系统 ============

export const typography = {
  fontFamily: {
    sans: '"Inter", "Helvetica", "Arial", sans-serif',
    mono: '"Fira Code", "Monaco", "Courier New", monospace',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// ============ 圆角系统 ============

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
};

// ============ 阴影系统 ============

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  'glass-lg': '0 20px 40px 0 rgba(31, 38, 135, 0.2)',
  neon: '0 0 20px rgba(0, 255, 255, 0.3)',
  'neon-glow': '0 0 40px rgba(0, 255, 255, 0.5)',
};

// ============ 动画系统 ============

export const animations = {
  duration: {
    fast: '150ms',
    base: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },

  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// ============ 断点系统 ============

export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ============ z-index 系统 ============

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  backdrop: 40,
  modal: 50,
  tooltip: 60,
  notification: 70,
};

// ============ 组件尺寸 ============

export const sizes = {
  button: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '56px',
  },

  icon: {
    xs: '14px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },

  input: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },
};
