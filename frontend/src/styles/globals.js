/**
 * 全局样式 + CSS变量注入
 * 处理：重置样式、CSS变量、动画定义、全局排版
 */

import { colors, spacing, typography, shadows, animations, borderRadius } from './tokens';

const globalStyles = `
  /* ============ CSS 变量注入 ============ */
  :root {
    /* 颜色变量 */
    --color-bg-primary: ${colors.background.primary};
    --color-bg-secondary: ${colors.background.secondary};
    --color-bg-tertiary: ${colors.background.tertiary};
    --color-primary: #00ffff;
    --color-accent-gold: ${colors.accent.gold};
    --color-accent-champagne: ${colors.accent.champagne};
    
    /* 间距变量 */
    --space-xs: ${spacing.xs};
    --space-sm: ${spacing.sm};
    --space-md: ${spacing.md};
    --space-lg: ${spacing.lg};
    --space-xl: ${spacing.xl};
    
    /* 字体变量 */
    --font-sans: ${typography.fontFamily.sans};
    --font-mono: ${typography.fontFamily.mono};
    
    /* 动画变量 */
    --duration-fast: ${animations.duration.fast};
    --duration-base: ${animations.duration.base};
    --duration-slow: ${animations.duration.slow};
  }

  /* ============ 全局重置 ============ */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: var(--font-sans);
    background-color: var(--color-bg-primary);
    color: #e2e8f0;
    overflow: hidden;
  }

  /* ============ 排版重置 ============ */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
  }

  p {
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    transition: all var(--duration-fast) ease-out;
  }

  button {
    font-family: inherit;
    border: none;
    cursor: pointer;
    transition: all var(--duration-fast) ease-out;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* ============ 滚动条美化 ============ */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 255, 255, 0.2);
    border-radius: 10px;
    transition: all var(--duration-fast);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 255, 255, 0.4);
  }

  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 255, 255, 0.2) rgba(255, 255, 255, 0.02);
  }

  /* ============ 玻璃态背景 ============ */
  .glass-effect {
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* ============ 全局动画定义 ============ */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
    }
    50% {
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes blink-cursor {
    0%, 49% {
      opacity: 1;
    }
    50%, 100% {
      opacity: 0;
    }
  }

  @keyframes shimmer {
    0%, 100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* ============ 工具类 ============ */
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* ============ Markdown 样式 ============ */
  .markdown-body {
    color: #e2e8f0;
    line-height: 1.6;
  }

  .markdown-body code {
    font-family: var(--font-mono);
    background: rgba(0, 255, 255, 0.1);
    color: #00ffff;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .markdown-body pre {
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px;
    overflow-x: auto;
  }

  .markdown-body pre code {
    background: none;
    color: inherit;
    padding: 0;
  }

  .markdown-body blockquote {
    border-left: 3px solid rgba(0, 255, 255, 0.4);
    padding-left: 12px;
    color: #cbd5e1;
    margin: 12px 0;
  }

  /* ============ 选择文本样式 ============ */
  ::selection {
    background: rgba(0, 255, 255, 0.3);
    color: #00ffff;
  }

  ::-moz-selection {
    background: rgba(0, 255, 255, 0.3);
    color: #00ffff;
  }

  /* ============ 焦点样式 ============ */
  input:focus,
  textarea:focus,
  button:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
  }

  input:focus-visible,
  textarea:focus-visible,
  button:focus-visible {
    outline: 2px solid rgba(0, 255, 255, 0.5);
  }

  /* ============ 禁用状态 ============ */
  button:disabled,
  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ============ 响应式 ============ */
  @media (max-width: 768px) {
    body {
      font-size: 14px;
    }
  }
`;

export default globalStyles;
