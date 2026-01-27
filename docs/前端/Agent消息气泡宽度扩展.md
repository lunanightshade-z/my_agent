# Agent 页面 AI 消息气泡宽度扩大

## 修改日期
2026-01-21

## 问题描述
用户反馈 Agent 页面中 AI 发送的消息泡泡宽度太小，希望扩大以提升阅读体验。

## 修改内容

### 文件
- `frontend/src/pages/Agent.jsx`

### 具体修改
在 `Agent.jsx` 中调整了消息气泡的最大宽度设置：

**修改前：**
- 所有消息（用户和 AI）统一使用：`max-w-[80%] md:max-w-[70%]`

**修改后：**
- **用户消息**：保持原宽度 `max-w-[80%] md:max-w-[70%]`
- **AI 消息（assistant）**：扩大宽度
  - 小屏幕：`max-w-[95%]`（从 80% 增加到 95%）
  - 中等屏幕：`max-w-[90%]`（从 70% 增加到 90%）
  - 大屏幕：`max-w-[85%]`（新增，85%）

### 代码位置
第 354-360 行，消息气泡容器的 className 设置

```jsx
<div className={`
  relative rounded-3xl backdrop-blur-md border shadow-sm
  ${msg.role === 'user' 
    ? 'max-w-[80%] md:max-w-[70%] bg-slate-800/5 border-slate-200/50 text-slate-700 rounded-br-none p-6' 
    : 'max-w-[95%] md:max-w-[90%] lg:max-w-[85%] bg-white/70 border-white/60 text-slate-600 rounded-tl-none shadow-indigo-100/50 p-6'
  }
`}>
```

## 效果
- AI 消息气泡现在可以占据更多的屏幕宽度，减少不必要的换行
- 用户消息保持原有宽度，保持界面平衡
- 响应式设计：在不同屏幕尺寸下都有合适的宽度设置

## 技术说明
- 使用 Tailwind CSS 的响应式断点（`md:`、`lg:`）实现不同屏幕尺寸下的宽度控制
- 通过条件类名区分用户消息和 AI 消息的样式
- 保持代码的可维护性和可读性
