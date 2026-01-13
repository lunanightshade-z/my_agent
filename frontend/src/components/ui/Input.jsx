/**
 * Input / Textarea 原子组件
 * 支持多种状态、尺寸、类型
 */
import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import { cn } from '../../styles/utils.js';



/**
 * Input 输入框组件
 */
const Input = forwardRef(
  (
    {
      size = 'md',
      error = false,
      errorMessage,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-base h-10',
      lg: 'px-4 py-3 text-lg h-12',
    };

    const baseStyle = cn(
      'w-full bg-transparent border',
      'text-gray-100 placeholder-gray-600',
      'transition-all duration-300',
      'focus-visible:outline-none',
      error
        ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]'
        : 'border-white/20 focus:border-cyan-500/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'rounded-lg',
      sizeStyles[size],
      leftIcon && 'pl-10',
      rightIcon && 'pr-10',
      className
    );

    return (
      <div className="relative flex flex-col">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input ref={ref} className={baseStyle} {...props} />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
        {error && errorMessage && (
          <span className="text-xs text-red-500/80 mt-1">{errorMessage}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea 文本框组件
 */
const Textarea = forwardRef(
  (
    {
      size = 'md',
      autoExpand = true,
      error = false,
      errorMessage,
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef(null);
    const internalRef = ref || textareaRef;

    const sizeStyles = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-4 py-4 text-lg',
    };

    // 自动扩展高度
    const handleInput = (e) => {
      if (autoExpand && internalRef && typeof internalRef !== 'function') {
        const textarea = internalRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
      }
      onChange?.(e);
    };

    const baseStyle = cn(
      'w-full bg-transparent border',
      'text-gray-100 placeholder-gray-600',
      'transition-all duration-300',
      'focus-visible:outline-none',
      'resize-none',
      error
        ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]'
        : 'border-white/20 focus:border-cyan-500/50 focus:shadow-[0_0_10px_rgba(0,255,255,0.2)]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'rounded-lg',
      sizeStyles[size],
      className
    );

    return (
      <div className="flex flex-col">
        <textarea
          ref={internalRef}
          className={baseStyle}
          onChange={handleInput}
          rows={3}
          {...props}
        />
        {error && errorMessage && (
          <span className="text-xs text-red-500/80 mt-1">{errorMessage}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
