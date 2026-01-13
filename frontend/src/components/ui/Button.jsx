/**
 * Button 原子组件
 * 支持多种尺寸、类型、状态
 * 使用 forwardRef、displayName、完整 TypeScript 类型
 */
import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../styles/utils.js';
import { colors, spacing, borderRadius, animations } from '../../styles/tokens.js';


/**
 * Button 组件
 * @example
 * <Button variant="primary" size="md">Click me</Button>
 * <Button variant="ghost" disabled>Disabled</Button>
 */
const Button = forwardRef(
  (
    {
      size = 'md',
      variant = 'primary',
      isLoading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // 尺寸样式映射
    const sizeStyles = {
      xs: 'px-3 py-1.5 text-xs',
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
      xl: 'px-10 py-4 text-xl',
    };

    // 变体样式映射
    const variantStyles = {
      primary:
        'bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95',
      secondary:
        'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30 active:bg-white/30',
      success:
        'bg-green-500 text-white font-semibold hover:bg-green-600 active:scale-95 shadow-lg shadow-green-500/30',
      danger:
        'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:border-red-500/70',
      ghost: 'text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10',
      glass:
        'glass-effect text-cyan-400 hover:border-cyan-500/50 hover:text-cyan-300 active:text-cyan-500',
    };

    const baseStyle = cn(
      'inline-flex items-center justify-center gap-2',
      'rounded-lg font-medium',
      'transition-all duration-300 ease-out',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth && 'w-full',
      sizeStyles[size],
      variantStyles[variant],
      className
    );

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={baseStyle}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
