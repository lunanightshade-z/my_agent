# 聊天气泡按钮 Hover 问题修复

## 问题描述

在聊天界面中，用户发送的消息有"复制"和"编辑"按钮，但是当鼠标移动到这些按钮之前，按钮就消失了。这是因为按钮使用了绝对定位（`right: -64px`），位于消息容器外部，当鼠标移动到按钮上时，会触发容器的 `onMouseLeave` 事件，导致 `isHovered` 状态变为 `false`，按钮因此消失。

## 问题原因

1. **Hover 检测区域不完整**：`onMouseEnter` 和 `onMouseLeave` 事件绑定在最外层的容器上
2. **按钮绝对定位**：按钮使用 `position: absolute` 和 `right: -64px`，位于容器外部
3. **鼠标离开容器**：当鼠标从消息气泡移动到按钮时，会离开容器边界，触发 `onMouseLeave`

## 解决方案

### 1. 添加 Hover 包装器

在消息容器外添加一个包装器 `hoverWrapper`，将 `onMouseEnter` 和 `onMouseLeave` 事件绑定到这个包装器上：

```jsx
<div 
  className={styles.hoverWrapper}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
>
  {/* 消息容器和按钮 */}
</div>
```

### 2. 扩展 Hover 区域

在 CSS 中为 `hoverWrapper` 添加 padding 和负 margin，扩展 hover 检测区域以包含按钮：

```css
.hoverWrapper {
  position: relative;
  display: flex;
  width: 100%;
  /* 扩展 hover 区域以包含绝对定位的按钮 */
  padding-left: 64px;
  padding-right: 64px;
  margin-left: -64px;
  margin-right: -64px;
  min-height: 100%;
}
```

### 3. 确保按钮可交互

为按钮添加 `z-index`，确保按钮区域可以正常交互：

```css
.actionButtonsRight {
  position: absolute;
  right: -64px;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 10; /* 确保按钮区域可交互 */
}
```

## 修改的文件

1. `frontend/src/components/chat/ChatBubble/ChatBubble.jsx`
   - 添加 `hoverWrapper` div 包装器
   - 将 hover 事件从容器移动到包装器

2. `frontend/src/components/chat/ChatBubble/ChatBubble.module.css`
   - 添加 `.hoverWrapper` 样式
   - 为按钮添加 `z-index`

## 测试验证

- ✅ 前端构建成功，无语法错误
- ✅ 鼠标移动到消息气泡时，按钮正常显示
- ✅ 鼠标移动到按钮区域时，按钮保持显示
- ✅ 鼠标离开整个区域时，按钮正常隐藏

## 技术要点

1. **Hover 状态管理**：使用包装器扩展 hover 检测区域，确保包含所有交互元素
2. **绝对定位处理**：通过 padding 和负 margin 技巧，在不改变布局的情况下扩展 hover 区域
3. **用户体验优化**：确保按钮在鼠标移动过程中不会意外消失，提供流畅的交互体验

## 日期

2026-01-21
