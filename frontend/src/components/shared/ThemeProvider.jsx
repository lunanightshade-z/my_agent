/**
 * 主题提供者组件
 * 将主题注入到 React Context 和 CSS 变量中
 */
import React, { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext(null);

/**
 * 使用主题的 Hook
 * @returns {Object} 当前主题对象
 */
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return theme;
};

/**
 * 主题提供者组件
 * @param {Object} props
 * @param {Object} props.theme - 主题配置对象
 * @param {React.ReactNode} props.children - 子组件
 */
export const ThemeProvider = ({ theme, children }) => {
  // 将主题转换为 CSS 变量
  const cssVars = useMemo(() => {
    if (!theme) return {};
    
    return {
      // 颜色变量
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-text-primary': theme.colors.text.primary,
      '--color-text-secondary': theme.colors.text.secondary,
      '--color-text-accent': theme.colors.text.accent,
      '--color-border': theme.colors.border,
      '--color-glass': theme.colors.glass,
      '--color-success': theme.colors.success,
      '--color-error': theme.colors.error,
      '--color-warning': theme.colors.warning,
      '--color-info': theme.colors.info,
      
      // 间距变量
      '--space-xs': theme.spacing.xs,
      '--space-sm': theme.spacing.sm,
      '--space-md': theme.spacing.md,
      '--space-lg': theme.spacing.lg,
      '--space-xl': theme.spacing.xl,
      '--space-2xl': theme.spacing['2xl'],
      '--space-3xl': theme.spacing['3xl'],
      '--space-4xl': theme.spacing['4xl'],
      
      // 字体变量
      '--font-sans': theme.typography.fontFamily.sans,
      '--font-mono': theme.typography.fontFamily.mono,
      '--font-size-xs': theme.typography.fontSize.xs,
      '--font-size-sm': theme.typography.fontSize.sm,
      '--font-size-base': theme.typography.fontSize.base,
      '--font-size-lg': theme.typography.fontSize.lg,
      '--font-size-xl': theme.typography.fontSize.xl,
      '--font-size-2xl': theme.typography.fontSize['2xl'],
      '--font-weight-light': theme.typography.fontWeight.light,
      '--font-weight-normal': theme.typography.fontWeight.normal,
      '--font-weight-medium': theme.typography.fontWeight.medium,
      '--font-weight-semibold': theme.typography.fontWeight.semibold,
      '--font-weight-bold': theme.typography.fontWeight.bold,
      '--line-height-tight': theme.typography.lineHeight.tight,
      '--line-height-normal': theme.typography.lineHeight.normal,
      '--line-height-relaxed': theme.typography.lineHeight.relaxed,
      '--line-height-loose': theme.typography.lineHeight.loose,
      
      // 圆角变量
      '--radius-none': theme.borderRadius.none,
      '--radius-sm': theme.borderRadius.sm,
      '--radius-md': theme.borderRadius.md,
      '--radius-lg': theme.borderRadius.lg,
      '--radius-xl': theme.borderRadius.xl,
      '--radius-2xl': theme.borderRadius['2xl'],
      '--radius-3xl': theme.borderRadius['3xl'],
      '--radius-full': theme.borderRadius.full,
      
      // 动画变量
      '--duration-fast': theme.animations.duration.fast,
      '--duration-base': theme.animations.duration.base,
      '--duration-slow': theme.animations.duration.slow,
      '--duration-slower': theme.animations.duration.slower,
      '--easing-linear': theme.animations.easing.linear,
      '--easing-ease-in': theme.animations.easing.easeIn,
      '--easing-ease-out': theme.animations.easing.easeOut,
      '--easing-ease-in-out': theme.animations.easing.easeInOut,
      '--easing-spring': theme.animations.easing.spring,
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      <div style={cssVars} className="theme-root" data-theme={theme?.custom?.name || 'default'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
