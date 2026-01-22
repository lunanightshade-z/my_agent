/**
 * 基础主题工厂函数
 * 定义主题的结构和默认值
 */

export const createTheme = (config) => {
  return {
    // 颜色系统
    colors: {
      primary: config.colors.primary,
      secondary: config.colors.secondary,
      background: config.colors.background,
      surface: config.colors.surface || config.colors.background,
      text: {
        primary: config.colors.text?.primary || '#ffffff',
        secondary: config.colors.text?.secondary || '#b8b8b8',
        accent: config.colors.text?.accent || config.colors.primary,
      },
      border: config.colors.border || 'rgba(255, 255, 255, 0.1)',
      glass: config.colors.glass || 'rgba(255, 255, 255, 0.08)',
      // 状态色
      success: config.colors.success || '#22c55e',
      error: config.colors.error || '#ef4444',
      warning: config.colors.warning || '#f59e0b',
      info: config.colors.info || '#3b82f6',
    },
    
    // 间距系统
    spacing: {
      xs: config.spacing?.xs || '4px',
      sm: config.spacing?.sm || '8px',
      md: config.spacing?.md || '12px',
      lg: config.spacing?.lg || '16px',
      xl: config.spacing?.xl || '24px',
      '2xl': config.spacing?.['2xl'] || '32px',
      '3xl': config.spacing?.['3xl'] || '48px',
      '4xl': config.spacing?.['4xl'] || '64px',
    },
    
    // 字体系统
    typography: {
      fontFamily: {
        sans: config.typography?.fontFamily?.sans || '"Inter", "Helvetica", "Arial", sans-serif',
        mono: config.typography?.fontFamily?.mono || '"Fira Code", "Monaco", "Courier New", monospace',
      },
      fontSize: {
        xs: config.typography?.fontSize?.xs || '12px',
        sm: config.typography?.fontSize?.sm || '14px',
        base: config.typography?.fontSize?.base || '16px',
        lg: config.typography?.fontSize?.lg || '18px',
        xl: config.typography?.fontSize?.xl || '20px',
        '2xl': config.typography?.fontSize?.['2xl'] || '24px',
      },
      fontWeight: {
        light: config.typography?.fontWeight?.light || 300,
        normal: config.typography?.fontWeight?.normal || 400,
        medium: config.typography?.fontWeight?.medium || 500,
        semibold: config.typography?.fontWeight?.semibold || 600,
        bold: config.typography?.fontWeight?.bold || 700,
      },
      lineHeight: {
        tight: config.typography?.lineHeight?.tight || 1.2,
        normal: config.typography?.lineHeight?.normal || 1.5,
        relaxed: config.typography?.lineHeight?.relaxed || 1.75,
        loose: config.typography?.lineHeight?.loose || 2,
      },
    },
    
    // 圆角系统
    borderRadius: {
      none: config.borderRadius?.none || '0',
      sm: config.borderRadius?.sm || '4px',
      md: config.borderRadius?.md || '8px',
      lg: config.borderRadius?.lg || '12px',
      xl: config.borderRadius?.xl || '16px',
      '2xl': config.borderRadius?.['2xl'] || '24px',
      '3xl': config.borderRadius?.['3xl'] || '32px',
      full: config.borderRadius?.full || '9999px',
    },
    
    // 阴影系统
    shadows: {
      none: config.shadows?.none || 'none',
      sm: config.shadows?.sm || '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: config.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: config.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: config.shadows?.xl || '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      glass: config.shadows?.glass || '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },
    
    // 动画系统
    animations: {
      duration: {
        fast: config.animations?.duration?.fast || '150ms',
        base: config.animations?.duration?.base || '300ms',
        slow: config.animations?.duration?.slow || '500ms',
        slower: config.animations?.duration?.slower || '1000ms',
      },
      easing: {
        linear: config.animations?.easing?.linear || 'linear',
        easeIn: config.animations?.easing?.easeIn || 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: config.animations?.easing?.easeOut || 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: config.animations?.easing?.easeInOut || 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: config.animations?.easing?.spring || 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
    
    // 断点系统
    breakpoints: {
      xs: config.breakpoints?.xs || '0px',
      sm: config.breakpoints?.sm || '640px',
      md: config.breakpoints?.md || '768px',
      lg: config.breakpoints?.lg || '1024px',
      xl: config.breakpoints?.xl || '1280px',
      '2xl': config.breakpoints?.['2xl'] || '1536px',
    },
    
    // 其他自定义属性
    ...config.custom,
  };
};
