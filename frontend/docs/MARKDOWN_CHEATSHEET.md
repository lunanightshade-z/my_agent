/**
 * Markdown 样式定制快速参考
 * 快速查找如何改变各种样式
 */

# Markdown 样式定制快速参考

## 🎨 快速改色

### 改变代码块颜色
```javascript
// 文件: markdown-config.js

colors: {
  codeInlineBackground: 'rgba(0, 255, 255, 0.15)',  // 行内代码背景
  codeInlineColor: '#00ffff',                        // 行内代码颜色
  codeBlockBackground: 'rgba(0, 0, 0, 0.4)',        // 代码块背景
  codeBlockBorder: 'rgba(0, 255, 255, 0.2)',        // 代码块边框
}
```

### 改变链接颜色
```javascript
colors: {
  linkColor: 'rgba(0, 255, 255, 0.9)',    // 正常状态
  linkHoverColor: '#00ffff',               // hover状态
}
```

### 改变表格颜色
```javascript
colors: {
  tableHeaderBackground: 'rgba(0, 255, 255, 0.15)',  // 表头背景
  tableHeaderColor: 'rgba(0, 255, 255, 0.95)',       // 表头文字
  tableBorderColor: 'rgba(0, 255, 255, 0.1)',        // 表格边框
  tableHoverBackground: 'rgba(0, 255, 255, 0.08)',   // hover背景
}
```

### 改变标题颜色
```javascript
colors: {
  headingColor: 'inherit',              // 标题颜色（inherit=继承）
  headingBorderColor: 'rgba(0, 255, 255, 0.2)',  // 标题下划线
}
```

### 改变引用块颜色
```javascript
colors: {
  blockquoteBackground: 'rgba(0, 255, 255, 0.08)',   // 背景
  blockquoteBorder: 'rgba(0, 255, 255, 0.5)',        // 左边框
  blockquoteColor: 'rgba(226, 232, 240, 0.9)',       // 文字
}
```

---

## 📏 快速改大小

### 改变标题大小
```javascript
fontSize: {
  heading1: '1.8rem',  // 改为 '2rem' 放大
  heading2: '1.5rem',  // 改为 '1.7rem' 放大
  heading3: '1.3rem',  // 改为 '1.5rem' 放大
  heading4: '1.1rem',
  heading5: '1rem',
  heading6: '0.95rem',
}
```

### 改变段落文字大小
```javascript
fontSize: {
  paragraph: '0.95rem',  // 改为 '1.1rem' 放大
  inlineCode: '0.9em',   // 改为 '1em' 放大
}
```

### 改变代码块文字大小
```javascript
fontSize: {
  codeContent: '13px',  // 改为 '14px' 放大
  codeLanguageTag: '0.8rem',
}
```

### 改变表格文字大小
```javascript
fontSize: {
  tableHeader: '0.8rem',  // 改为 '0.9rem' 放大
  tableBody: '0.9rem',    // 改为 '1rem' 放大
}
```

---

## 🔲 快速改间距

### 改变段落间距
```javascript
spacing: {
  paragraphMarginTop: '0.75rem',     // 改为 '1rem' 增加
  paragraphMarginBottom: '0.75rem',  // 改为 '1rem' 增加
}
```

### 改变列表间距
```javascript
spacing: {
  listItemMargin: '0.5rem 0',        // 改为 '1rem 0' 增加
  listItemPadding: '1.5rem',         // 改为 '2rem' 增加缩进
}
```

### 改变代码块间距
```javascript
spacing: {
  codeBlockMarginTop: '1rem',        // 改为 '1.5rem'
  codeBlockMarginBottom: '1rem',     // 改为 '1.5rem'
  codeBlockPadding: '1rem',          // 改为 '1.5rem'
}
```

### 改变表格单元格间距
```javascript
spacing: {
  tableCellPadding: '0.75rem 1rem',  // 改为 '1rem 1.5rem'
}
```

### 改变引用块间距
```javascript
spacing: {
  blockquoteMargin: '1.25rem 0',
  blockquotePadding: '1rem 1rem 1rem 1.25rem',
}
```

---

## 🎭 快速改主题

### 青蓝色主题（当前）
```javascript
colors: {
  codeInlineColor: '#00ffff',
  linkColor: 'rgba(0, 255, 255, 0.9)',
  listItemBulletColor: 'rgba(0, 255, 255, 0.7)',
}
```

### 绿色主题
```javascript
colors: {
  codeInlineColor: '#22c55e',
  codeInlineBackground: 'rgba(34, 197, 94, 0.15)',
  linkColor: 'rgba(34, 197, 94, 0.9)',
  listItemBulletColor: 'rgba(34, 197, 94, 0.7)',
  blockquoteBorder: 'rgba(34, 197, 94, 0.5)',
}
```

### 紫色主题
```javascript
colors: {
  codeInlineColor: '#a78bfa',
  codeInlineBackground: 'rgba(167, 139, 250, 0.15)',
  linkColor: 'rgba(167, 139, 250, 0.9)',
  listItemBulletColor: 'rgba(167, 139, 250, 0.7)',
  blockquoteBorder: 'rgba(167, 139, 250, 0.5)',
}
```

### 红色主题
```javascript
colors: {
  codeInlineColor: '#ef4444',
  codeInlineBackground: 'rgba(239, 68, 68, 0.15)',
  linkColor: 'rgba(239, 68, 68, 0.9)',
  listItemBulletColor: 'rgba(239, 68, 68, 0.7)',
  blockquoteBorder: 'rgba(239, 68, 68, 0.5)',
}
```

### 黄色主题
```javascript
colors: {
  codeInlineColor: '#eab308',
  codeInlineBackground: 'rgba(234, 179, 8, 0.15)',
  linkColor: 'rgba(234, 179, 8, 0.9)',
  listItemBulletColor: 'rgba(234, 179, 8, 0.7)',
  blockquoteBorder: 'rgba(234, 179, 8, 0.5)',
}
```

---

## 🎯 常见场景完整配置

### 场景1: 紧凑专业风格
```javascript
// markdown-config.js
const markdownStyleConfig = {
  fontSize: {
    paragraph: '0.9rem',
    heading1: '1.6rem',
    heading2: '1.3rem',
    heading3: '1.1rem',
    codeContent: '12px',
  },
  spacing: {
    paragraphMarginTop: '0.5rem',
    paragraphMarginBottom: '0.5rem',
    listItemMargin: '0.25rem 0',
    codeBlockMarginTop: '0.75rem',
  },
};
```

### 场景2: 宽松阅读风格
```javascript
const markdownStyleConfig = {
  fontSize: {
    paragraph: '1.05rem',
    heading1: '2rem',
    heading2: '1.7rem',
    heading3: '1.5rem',
    codeContent: '14px',
  },
  spacing: {
    paragraphMarginTop: '1rem',
    paragraphMarginBottom: '1rem',
    listItemMargin: '0.75rem 0',
    codeBlockMarginTop: '1.5rem',
  },
};
```

### 场景3: 代码优先风格
```javascript
const markdownStyleConfig = {
  colors: {
    codeBlockBackground: 'rgba(0, 0, 0, 0.6)',
    codeHeaderBackground: 'rgba(20, 20, 20, 0.9)',
    codeInlineBackground: 'rgba(0, 255, 255, 0.2)',
  },
  spacing: {
    codeBlockPadding: '1.5rem',
    codeBlockMarginTop: '1.5rem',
  },
};
```

---

## 🔧 CSS级别的快速改法

### 直接编辑 CSS 文件

**文件位置**: `markdown-renderer.css`

#### 改变代码块背景
```css
.code-block-wrapper {
  background: rgba(0, 0, 0, 0.6);  /* 从 0.4 改为 0.6 */
}
```

#### 改变代码块圆角
```css
.code-block-wrapper {
  border-radius: 12px;  /* 从 8px 改为 12px */
}
```

#### 改变表格边框
```css
.markdown-table {
  border: 2px solid rgba(0, 255, 255, 0.3);  /* 添加边框 */
}
```

#### 改变链接下划线
```css
.markdown-link {
  text-decoration-thickness: 2px;  /* 从 1px 改为 2px */
}
```

#### 改变引用块左边框
```css
.markdown-blockquote {
  border-left: 6px solid rgba(0, 255, 255, 0.5);  /* 从 4px 改为 6px */
}
```

---

## 📱 响应式相关

### 改变移动设备上的字体大小
```javascript
// markdown-config.js
responsiveFontSize: {
  heading1Mobile: '1.5rem',  // 改为更大/更小
  heading2Mobile: '1.3rem',
  paragraphMobile: '0.9rem',
}
```

### 改变响应式断点
```javascript
breakpoints: {
  mobile: '768px',  // 改为其他值如 '640px'
}
```

---

## 🐛 常见问题快速解决

### Q: 代码块文字太小了
```javascript
// A: 修改配置
fontSize: {
  codeContent: '14px',  // 改为更大值
}
```

### Q: 标题间距太大了
```javascript
// A: 修改配置
spacing: {
  headingMarginTop: '1rem',  // 从 1.5rem 改小
}
```

### Q: 表格看不清楚
```javascript
// A: 改颜色对比度
colors: {
  tableHeaderBackground: 'rgba(0, 255, 255, 0.25)',  // 从 0.15 改为 0.25
}
```

### Q: 代码块复制按钮太小
```css
/* A: 编辑 markdown-renderer.css */
.copy-button {
  width: 40px;  /* 从 32px 改为 40px */
  height: 40px;
}
```

### Q: 列表缩进太多了
```javascript
// A: 修改配置
spacing: {
  listItemPadding: '1rem',  // 从 1.5rem 改小
}
```

---

## 🎨 颜色参考值

### 常用青蓝色系
```
#00ffff      - 纯青蓝
#1e90ff      - 深天蓝
#00bfff      - 深空蓝
#87ceeb      - 天蓝
#20b2aa      - 浅海蓝
```

### 常用绿色系
```
#22c55e      - 绿色
#16a34a      - 深绿
#84cc16      - 浅黄绿
#10b981      - 翡翠绿
```

### RGB值快速转Hex
```
RGB(0, 255, 255)     → #00ffff
RGB(34, 197, 94)     → #22c55e
RGB(239, 68, 68)     → #ef4444
```

---

## 📚 参考资源

- 完整文档: `MARKDOWN_GUIDE.md`
- 实现说明: `../docs/frontend/markdown_implementation.md`
- 配置文件: `markdown-config.js`
- 样式文件: `markdown-renderer.css`

---

**最后更新**: 2026-01-21  
**快速参考版本**: 1.0
