# Chat 和 Agent 页面间导航切换功能

## 功能说明

为 Chat 和 Agent 两个页面添加了互相切换的导航按钮，让用户能够更方便地在两个功能之间进行切换。

## 修改内容

### 1. Agent 页面新增 Chat 切换按钮

**位置**：`frontend/src/pages/Agent.jsx` - 顶部标题区（第 402-428 行）

**功能**：
- 在标题右侧添加了一个"Chat"切换按钮
- 同时添加了"Agent"身份徽章
- 保留了原有的状态指示器（Online/Thinking）

**按钮样式**：
```
外观：💬 Chat
样式：半透明白色背景 + 浅灰色文字
交互：
  - 悬停时：背景更亮，文字变深
  - 缩放：hover 1.05x, active 0.95x
  - 平滑过渡：200ms
```

**代码示例**：
```jsx
<button
  onClick={() => navigate('/chat')}
  className="
    px-3 py-1.5 rounded-lg
    bg-white/50 hover:bg-white/70
    border border-slate-200/50 hover:border-slate-300/70
    text-sm text-slate-600 hover:text-slate-700
    transition-all duration-200
    flex items-center gap-1.5
    hover:scale-105 active:scale-95
  "
  title="切换到 Chat"
>
  <span>💬</span>
  <span>Chat</span>
</button>
```

### 2. Chat 页面新增 Agent 切换按钮

**位置**：`frontend/src/components/layout/AppLayout.jsx` - 顶部导航栏（第 325-356 行）

**功能**：
- 在导航栏右侧添加了一个"AGENT"切换按钮
- 与 Chat 页面的整体风格匹配（SYNTH AI 赛博朋克风格）
- 按钮位置在 Artifact 面板开关和返回首页按钮之间

**按钮样式**：
```
外观：🤖 AGENT
样式：深色背景（与 SYNTH AI 主题匹配） + 琥珀色文字
交互：
  - 悬停时：背景更亮，文字更亮
  - 缩放：hover 1.05x, active 0.95x
  - 使用 framer-motion 动画
  - 平滑过渡：200ms
```

**代码示例**：
```jsx
<motion.button
  className="
    pointer-events-auto px-3 py-1.5 rounded-lg
    bg-white/10 hover:bg-white/20
    border border-amber-500/20 hover:border-amber-500/40
    text-xs font-tech text-amber-100 hover:text-amber-50
    transition-all duration-200
    flex items-center gap-1.5
  "
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onClick={() => navigate('/agent')}
  title="切换到 Agent"
>
  <span>🤖</span>
  <span>AGENT</span>
</motion.button>
```

## 修改的文件

1. **Agent 页面**：`frontend/src/pages/Agent.jsx`
   - 添加 Chat 切换按钮
   - 添加 Agent 身份徽章
   - 重构顶部标题区布局

2. **Chat 页面**：`frontend/src/components/layout/AppLayout.jsx`
   - 添加 Agent 切换按钮
   - 保持导航栏的一致性

## 视觉效果

### Agent 页面
- 左侧：会话列表
- 中间：对话内容
- **顶部右侧**：Agent 身份徽章 + 在线状态 + 💬 Chat 按钮 + 首页按钮

### Chat 页面
- 左侧：会话历史
- 中间：对话内容
- **顶部右侧**：🤖 AGENT 按钮 + Artifact 面板开关 + 首页按钮

## 用户体验

1. **快速切换**：用户可以一键切换 Chat 和 Agent 两种模式
2. **清晰指引**：每个页面都明确显示当前模式，另外提供切换按钮
3. **一致的交互**：两个按钮都使用相同的交互规范（悬停、缩放等）
4. **风格匹配**：
   - Agent 页面：简洁的青色系主题
   - Chat 页面：赛博朋克琥珀色主题

## 技术实现

- 使用 `useNavigate` hook 实现页面导航
- 使用 Tailwind CSS 实现样式
- 使用 Framer Motion 添加动画效果
- 确保响应式设计，在各种屏幕尺寸下都能正常显示

## 构建状态

✅ 前端构建成功，无错误
- 构建时间：6.46s
- 输出大小：正常范围内

## 日期

2026-01-23
