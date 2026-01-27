# 用户消息气泡右对齐修复

## 问题描述

用户发送的消息气泡没有在对话区域右对齐，整体偏左。用户希望消息气泡向右移动，贴近容器的右侧边。

## 问题原因

1. **Hover 包装器占据全宽**：`.hoverWrapper` 设置了 `width: 100%`，导致即使用户消息容器使用了 `justify-content: flex-end`，hoverWrapper 仍然会占据整个容器的宽度
2. **布局结构问题**：hoverWrapper 作为 flex 子元素，即使父容器右对齐，它本身占据 100% 宽度也会导致内容无法右对齐

## 解决方案

### 1. 添加用户消息的 hoverWrapper 变体

为 hoverWrapper 添加用户消息的变体类，使其不占据 100% 宽度：

```jsx
<div 
  className={cn(styles.hoverWrapper, isUser && styles.hoverWrapperUser)}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
```

### 2. 修改 CSS 样式

为 `.hoverWrapperUser` 添加样式，使其：
- 不占据 100% 宽度（`width: auto`）
- 右对齐（`margin-left: auto`）
- 移除左侧的 padding 和 margin（因为按钮在右侧）
- 保留右侧的 padding 和 margin 以包含按钮区域

```css
.hoverWrapperUser {
  width: auto;
  /* 移除左侧的 padding 和 margin，因为按钮在右侧 */
  padding-left: 0;
  margin-left: 0;
  /* 确保右对齐 */
  margin-left: auto;
  /* 扩展 hover 区域以包含右侧按钮 */
  padding-right: 64px;
  margin-right: -64px;
}
```

## 修改的文件

1. `frontend/src/components/chat/ChatBubble/ChatBubble.jsx`
   - 为 hoverWrapper 添加条件类名 `hoverWrapperUser`

2. `frontend/src/components/chat/ChatBubble/ChatBubble.module.css`
   - 添加 `.hoverWrapperUser` 样式规则

## 技术要点

1. **Flexbox 布局**：通过 `width: auto` 和 `margin-left: auto` 实现右对齐
2. **条件样式**：根据消息类型（用户/AI）应用不同的样式
3. **Hover 区域扩展**：保持右侧按钮区域的 hover 检测功能

## 效果

- ✅ 用户消息气泡现在正确右对齐，贴近容器右侧
- ✅ AI 消息气泡保持左对齐
- ✅ Hover 功能正常工作，按钮区域仍然可以正常交互
- ✅ 布局响应式，适配不同屏幕尺寸

## 日期

2026-01-21
