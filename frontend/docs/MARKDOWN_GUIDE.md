/**
 * Markdown 样式集成指南
 * 
 * 本方案提供了一个完整的、易于调整的markdown样式系统
 */

# Markdown 渲染系统使用指南

## 文件结构

```
frontend/src/
├── components/
│   ├── MarkdownRenderer.jsx          # 核心渲染器组件
│   └── markdown-renderer.css         # 样式定义
├── styles/
│   └── markdown-config.js            # 配置文件（集中管理）
└── pages/
    └── Agent.jsx                     # 集成示例
```

## 核心特性

### 1. 完整的Markdown支持
- ✅ 标题 (H1-H6)
- ✅ 段落和换行
- ✅ 粗体、斜体、删除线
- ✅ 行内代码和代码块（带语法高亮）
- ✅ 有序列表和无序列表
- ✅ 表格
- ✅ 引用块
- ✅ 链接
- ✅ 分割线

### 2. 代码块增强
- ✅ 自动语言识别
- ✅ Prism语法高亮
- ✅ 一键复制功能
- ✅ 语言标签显示

### 3. 响应式设计
- ✅ 自动适配移动设备
- ✅ 断点优化
- ✅ 触摸友好

## 使用方法

### 基础使用

```jsx
import MarkdownRenderer from '../components/MarkdownRenderer';

// 在你的组件中使用
<MarkdownRenderer 
  content="# 标题\n\n这是一个**示例**" 
/>
```

### 自定义样式

#### 方式1: 修改CSS文件（全局调整）

编辑 `frontend/src/components/markdown-renderer.css`

例如，改变代码块背景色：

```css
.code-block-wrapper {
  background: rgba(0, 0, 0, 0.4);  /* 修改这里 */
}
```

#### 方式2: 使用配置文件（推荐）

编辑 `frontend/src/styles/markdown-config.js`

```javascript
export const markdownStyleConfig = {
  colors: {
    codeInlineBackground: 'rgba(0, 255, 255, 0.15)',  // 改这里
    codeInlineColor: '#00ffff',
    // ... 其他配置
  },
  // ...
};
```

## 常见自定义场景

### 场景1: 改变整体主题色

只需修改 `markdown-config.js` 中的颜色变量：

```javascript
colors: {
  codeInlineColor: '#your-color',        // 代码块前景色
  codeBlockBackground: 'your-bg-color',  // 代码块背景
  linkColor: 'your-link-color',          // 链接颜色
  // ...
}
```

### 场景2: 调整间距密度

修改 `spacing` 对象：

```javascript
spacing: {
  paragraphMarginTop: '0.75rem',    // 增加/减少这个值
  listItemMargin: '0.5rem 0',       // 调整列表项间距
  // ...
}
```

### 场景3: 改变字体大小（整体缩放）

修改 `fontSize` 对象中的所有值乘以一个系数：

```javascript
fontSize: {
  paragraph: '0.95rem',      // 改为 '1.05rem' 放大
  heading1: '1.8rem',        // 改为 '2rem' 放大
  // ...
}
```

### 场景4: 改变代码块样式

```javascript
colors: {
  codeBlockBackground: 'rgba(30, 30, 30, 0.8)',  // 深色背景
  codeHeaderBackground: 'rgba(40, 40, 40, 0.9)', // 更深的头部
},
spacing: {
  codeBlockPadding: '1.5rem',  // 增加内边距
}
```

## 样式变量对照表

### 代码相关

| 变量 | 用途 | 默认值 |
|-----|------|--------|
| `codeInlineBackground` | 行内代码背景 | `rgba(0, 255, 255, 0.15)` |
| `codeInlineColor` | 行内代码颜色 | `#00ffff` |
| `codeBlockBackground` | 代码块背景 | `rgba(0, 0, 0, 0.4)` |

### 标题相关

| 级别 | 默认大小 |
|-----|---------|
| H1 | `1.8rem` |
| H2 | `1.5rem` |
| H3 | `1.3rem` |
| H4 | `1.1rem` |

### 间距相关

| 类型 | 默认值 |
|-----|--------|
| 段落顶部 | `0.75rem` |
| 段落底部 | `0.75rem` |
| 列表项 | `0.5rem 0` |
| 代码块 | `1rem 0` |

## 性能优化建议

1. **避免重复渲染**
   ```jsx
   // 缓存大型markdown内容
   const memoizedContent = useMemo(() => 
     <MarkdownRenderer content={content} />
   , [content]);
   ```

2. **大型列表优化**
   对于包含很多代码块的文档，考虑分页加载

3. **样式缓存**
   所有CSS样式已预加载，无需担心加载性能

## 故障排查

### 代码块不显示
- ✅ 确保语言标记正确 (```python, ```js, 等)
- ✅ 检查是否有特殊字符导致的逃逸问题

### 样式不生效
- ✅ 清除浏览器缓存
- ✅ 确保 CSS 文件已正确导入
- ✅ 检查 CSS 优先级（Tailwind 可能会覆盖）

### 链接不可点击
- ✅ 检查 `markdown-link` 类是否被正确应用
- ✅ 确保父容器没有 `pointer-events: none`

## 扩展示例

### 添加自定义样式类

在 `markdown-renderer.css` 中添加：

```css
/* 强调行 */
.markdown-message .highlight-line {
  background: rgba(0, 255, 255, 0.1);
  padding: 0.5rem;
  border-left: 3px solid rgba(0, 255, 255, 0.5);
}
```

### 改变代码块语言标签样式

```css
.code-language {
  background: rgba(0, 255, 255, 0.15);  /* 添加背景 */
  padding: 0.25rem 0.5rem;
  border-radius: 2px;
}
```

## 访问性 (Accessibility)

本方案已考虑以下方面：

- ✅ 足够的颜色对比度
- ✅ 语义化的HTML
- ✅ 键盘导航支持
- ✅ 屏幕阅读器兼容

## 浏览器兼容性

- ✅ Chrome/Edge (最新版本)
- ✅ Firefox (最新版本)
- ✅ Safari (最新版本)
- ✅ Mobile browsers

## 最佳实践

1. **保持一致性** - 不要在多个地方修改样式，使用配置文件
2. **测试响应式** - 在各种屏幕尺寸上测试
3. **性能考虑** - 大型文档考虑分页或虚拟滚动
4. **用户反馈** - 收集用户关于样式的反馈

## 未来改进

- [ ] 支持自定义组件
- [ ] 支持 Mermaid 图表
- [ ] 支持 LaTeX 数学公式
- [ ] 主题切换（浅色/深色）
- [ ] 代码块复制提示

## 支持

有问题或建议？

1. 检查本指南的 FAQ 部分
2. 查看示例代码
3. 查看CSS注释

---

**最后更新**: 2026-01-21
**版本**: 1.0.0
