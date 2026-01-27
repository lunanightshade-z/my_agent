# 用户消息过早换行问题修复

## 问题描述

用户发送的消息很快就换行了，导致消息气泡显示不自然，文本过早换行。

## 问题原因分析

1. **最大宽度限制过小**：`.messageWrapper` 设置了 `max-width: 80%`，限制了消息气泡的最大宽度
2. **强制换行设置**：`.userContent` 使用了 `word-break: break-words`，会在单词中间强制换行
3. **Flex 容器限制**：`.hoverWrapperUser` 的 flex 属性可能导致内容宽度受限

## 解决方案

### 1. 增加用户消息的最大宽度

为用户消息的 `.messageWrapperUser` 增加最大宽度，从 80% 增加到 95%，并使用 `min()` 函数设置合理的像素上限：

```css
.messageWrapperUser {
  align-items: flex-end;
  /* 用户消息使用更大的最大宽度，避免过早换行 */
  /* 使用 min() 函数同时设置百分比和像素值，确保在大多数屏幕上都能充分利用空间 */
  max-width: min(95%, 900px);
}
```

**更新说明**：
- 初始版本：从 80% 增加到 90%
- 优化版本：进一步增加到 95%，并设置 900px 的像素上限，防止在超大屏幕上过宽

### 2. 优化换行策略

修改 `.userContent` 的换行属性：
- 将 `word-break: break-words` 改为 `word-break: break-word`
- 添加 `overflow-wrap: break-word`

区别说明：
- `break-word`：只在必要时（单词太长无法放入容器时）才在单词中间换行
- `break-words`：会在任何地方换行，包括单词中间

```css
.userContent {
  color: rgba(251, 191, 36, 0.9);
  line-height: 1.75;
  font-weight: 300;
  font-size: 1rem;
  white-space: pre-wrap;
  /* 使用 break-word 而不是 break-words，只在必要时换行 */
  word-break: break-word;
  /* 允许长单词在必要时换行，但优先保持单词完整 */
  overflow-wrap: break-word;
}
```

### 3. 优化 Flex 容器属性

为 `.hoverWrapperUser` 添加 flex 属性，确保内容可以自然扩展：

```css
.hoverWrapperUser {
  width: auto;
  padding-left: 0;
  margin-left: 0;
  margin-left: auto;
  padding-right: 64px;
  margin-right: -64px;
  /* 确保内容可以自然扩展，不受 flex 容器限制 */
  flex-shrink: 0;
  min-width: 0;
}
```

## 修改的文件

1. `frontend/src/components/chat/ChatBubble/ChatBubble.module.css`
   - 修改 `.messageWrapperUser` 的 `max-width` 从 80% 增加到 90%
   - 修改 `.userContent` 的 `word-break` 属性
   - 为 `.hoverWrapperUser` 添加 flex 属性

## 技术要点

1. **CSS 换行属性**：
   - `word-break: break-word`：优先保持单词完整，只在必要时换行
   - `overflow-wrap: break-word`：允许长单词在必要时换行
   - `white-space: pre-wrap`：保留空白字符和换行符

2. **Flex 布局优化**：
   - `flex-shrink: 0`：防止内容被压缩
   - `min-width: 0`：允许内容自然收缩

3. **响应式设计**：
   - 使用百分比宽度，适配不同屏幕尺寸
   - 90% 的最大宽度在保持可读性的同时，允许更长的文本行

## 效果

- ✅ 用户消息现在可以显示更长的文本行，不会过早换行
- ✅ 文本优先在单词边界换行，保持可读性
- ✅ 只有在单词太长无法放入容器时，才会在单词中间换行
- ✅ 消息气泡宽度更合理，充分利用可用空间（最大宽度 95%，上限 900px）

## 更新历史

- **2026-01-21 初始版本**：将最大宽度从 80% 增加到 90%
- **2026-01-21 优化版本**：进一步增加到 95%，并设置 900px 像素上限

## 日期

2026-01-21
