/**
 * Markdown 样式配置 - 集中管理所有可调整的样式变量
 * 修改这个文件即可统一调整整个markdown样式系统
 * 
 * 使用方式:
 * 1. 修改颜色变量来改变整体色调
 * 2. 修改间距来调整密度
 * 3. 修改字体大小来改变缩放
 */

export const markdownStyleConfig = {
  // ============ 颜色系统 ============
  colors: {
    // 代码相关
    codeInlineBackground: 'rgba(0, 255, 255, 0.15)',
    codeInlineColor: '#00ffff',
    codeInlineBorder: 'rgba(0, 255, 255, 0.3)',
    
    codeBlockBackground: 'rgba(0, 0, 0, 0.4)',
    codeBlockBorder: 'rgba(0, 255, 255, 0.2)',
    
    codeHeaderBackground: 'rgba(0, 0, 0, 0.6)',
    codeHeaderBorder: 'rgba(0, 255, 255, 0.15)',
    codeLanguageColor: 'rgba(0, 255, 255, 0.7)',
    
    copyButtonBackground: 'rgba(0, 255, 255, 0.1)',
    copyButtonBorder: 'rgba(0, 255, 255, 0.3)',
    copyButtonColor: 'rgba(0, 255, 255, 0.7)',
    copyButtonHoverBackground: 'rgba(0, 255, 255, 0.2)',
    copyButtonHoverBorder: 'rgba(0, 255, 255, 0.5)',
    copyButtonHoverColor: '#00ffff',
    
    // 标题相关
    headingColor: 'inherit',
    headingBorderColor: 'rgba(0, 255, 255, 0.2)',
    
    // 链接相关
    linkColor: 'rgba(0, 255, 255, 0.9)',
    linkHoverColor: '#00ffff',
    
    // 列表相关
    listItemBulletColor: 'rgba(0, 255, 255, 0.7)',
    
    // 表格相关
    tableHeaderBackground: 'rgba(0, 255, 255, 0.15)',
    tableHeaderBorder: 'rgba(0, 255, 255, 0.3)',
    tableHeaderColor: 'rgba(0, 255, 255, 0.95)',
    tableBorderColor: 'rgba(0, 255, 255, 0.1)',
    tableHoverBackground: 'rgba(0, 255, 255, 0.08)',
    
    // 引用块相关
    blockquoteBackground: 'rgba(0, 255, 255, 0.08)',
    blockquoteBorder: 'rgba(0, 255, 255, 0.5)',
    blockquoteColor: 'rgba(226, 232, 240, 0.9)',
    blockquoteHoverBackground: 'rgba(0, 255, 255, 0.12)',
    blockquoteHoverBorder: 'rgba(0, 255, 255, 0.7)',
    
    // 强调相关
    strongColor: 'rgba(0, 255, 255, 0.95)',
    
    // 分割线
    hrGradient: 'linear-gradient(to right, transparent, rgba(0, 255, 255, 0.3), transparent)',
  },

  // ============ 字体大小 ============
  fontSize: {
    paragraph: '0.95rem',
    heading1: '1.8rem',
    heading2: '1.5rem',
    heading3: '1.3rem',
    heading4: '1.1rem',
    heading5: '1rem',
    heading6: '0.95rem',
    
    inlineCode: '0.9em',
    
    codeLanguageTag: '0.8rem',
    codeContent: '13px',
    
    tableHeader: '0.8rem',
    tableBody: '0.9rem',
    
    blockquote: '0.95rem',
  },

  // ============ 间距系统 ============
  spacing: {
    // 段落间距
    paragraphMarginTop: '0.75rem',
    paragraphMarginBottom: '0.75rem',
    
    // 标题间距
    headingMarginTop: '1.5rem',
    headingMarginBottom: '0.75rem',
    heading1MarginTop: '2rem',
    heading2MarginTop: '1.75rem',
    
    // 代码块间距
    codeBlockMarginTop: '1rem',
    codeBlockMarginBottom: '1rem',
    codeBlockPadding: '1rem',
    codeHeaderPadding: '0.75rem 1rem',
    
    // 列表间距
    listMargin: '0.75rem 0',
    listItemMargin: '0.5rem 0',
    listItemPadding: '1.5rem',
    listItemNestedMargin: '0.5rem 0',
    
    // 表格间距
    tableCellPadding: '0.75rem 1rem',
    
    // 引用块间距
    blockquoteMargin: '1.25rem 0',
    blockquotePadding: '1rem 1rem 1rem 1.25rem',
    
    // 分割线间距
    hrMargin: '1.5rem 0',
  },

  // ============ 圆角 ============
  borderRadius: {
    inlineCode: '4px',
    codeBlock: '8px',
    codeBlockHeader: '0',
    codeBlockContent: '0 0 8px 8px',
    copyButton: '4px',
    tableWrapper: '8px',
    blockquote: '0 4px 4px 0',
  },

  // ============ 边框宽度 ============
  borderWidth: {
    headingUnderline1: '2px',
    headingUnderline2: '1px',
    headingBorder: '1px',
    
    codeInline: '1px',
    codeBlockOuter: '1px',
    codeBlockHeader: '1px',
    
    copyButton: '1px',
    
    tableOuter: '1px',
    tableHeaderBorder: '2px',
    tableBodyBorder: '1px',
    
    blockquote: '4px',
  },

  // ============ 阴影 ============
  shadows: {
    codeBlock: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
    copyButtonHover: '0 0 12px rgba(0, 255, 255, 0.2)',
  },

  // ============ 过渡动画 ============
  transitions: {
    duration: '0.2s',
    easing: 'ease-out',
  },

  // ============ 行高 ============
  lineHeight: {
    default: '1.7',
    heading: '1.3',
    code: '1.6',
    blockquote: '1.6',
  },

  // ============ 响应式断点 ============
  breakpoints: {
    mobile: '768px',
  },

  // ============ 响应式字体大小 ============
  responsiveFontSize: {
    heading1Mobile: '1.5rem',
    heading2Mobile: '1.3rem',
    heading3Mobile: '1.1rem',
    paragraphMobile: '0.9rem',
    codeBlockFontSizeMobile: '0.8rem',
    tableBodyMobile: '0.8rem',
  },
};

/**
 * 生成CSS变量 - 将配置转换为CSS变量
 * 这样可以在CSS中直接使用这些变量，便于动态调整
 */
export const generateMarkdownCSSVariables = (config = markdownStyleConfig) => {
  const vars = {};
  
  // 颜色变量
  Object.entries(config.colors).forEach(([key, value]) => {
    vars[`--md-color-${key}`] = value;
  });
  
  // 字体大小变量
  Object.entries(config.fontSize).forEach(([key, value]) => {
    vars[`--md-font-size-${key}`] = value;
  });
  
  // 间距变量
  Object.entries(config.spacing).forEach(([key, value]) => {
    vars[`--md-spacing-${key}`] = value;
  });
  
  // 圆角变量
  Object.entries(config.borderRadius).forEach(([key, value]) => {
    vars[`--md-border-radius-${key}`] = value;
  });
  
  // 边框宽度变量
  Object.entries(config.borderWidth).forEach(([key, value]) => {
    vars[`--md-border-width-${key}`] = value;
  });
  
  // 其他变量
  vars['--md-transition-duration'] = config.transitions.duration;
  vars['--md-transition-easing'] = config.transitions.easing;
  vars['--md-line-height-default'] = config.lineHeight.default;
  
  return vars;
};

export default markdownStyleConfig;
