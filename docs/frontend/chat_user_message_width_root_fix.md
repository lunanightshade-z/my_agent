# 用户消息宽度根因修复

## 问题描述

用户消息仍然过早换行，即使将消息气泡 `max-width` 设置为 1200px 也无效。用户要求至少支持 20 个中文字不换行。

## 根因定位

1. **父容器限制**：聊天内容容器 `.contentWrapper` 之前限制在 `1024px`，导致子元素的 `max-width` 被父容器截断。
2. **样式优先级不足**：`.messageWrapperUser` 与 `.messageWrapper` 同级，未明确覆盖基础 `max-width: 80%`，在某些构建输出中仍显示 80%。
3. **Flex 行为影响**：消息包装器在 flex 布局下容易按可用宽度伸缩，导致看起来“更窄”。

## 解决方案

### 1) 放宽父容器宽度

- 将 `.contentWrapper` 宽度提高并设置为 `min(1600px, 100%)`，避免子元素被父容器限制。

### 2) 提升用户消息宽度优先级

- 使用组合选择器 `.messageWrapper.messageWrapperUser` 提高优先级，彻底覆盖基础 `max-width`。
- 采用 `width: fit-content` + `max-width: min(100%, 1600px)`，在可用空间内尽量延长单行显示。

### 3) 保持其它样式稳定

- 不改变 AI 消息的最大宽度，避免整体布局变动过大。

## 修改内容

### `frontend/src/components/chat/ChatArea/ChatArea.module.css`

- `contentWrapper`：
  - `width: 100%`
  - `max-width: min(1600px, 100%)`

### `frontend/src/components/chat/ChatBubble/ChatBubble.module.css`

- `messageWrapper`：
  - 增加 `flex: 0 1 auto`
- `messageWrapper.messageWrapperUser`：
  - `width: fit-content`
  - `max-width: min(100%, 1600px)`

## 验证

- `npm run build` 通过，无语法错误。

## 日期

2026-01-21
