# 工具调用卡片组件增强

**完成时间**: 2026-01-22  
**目标**: 改进前端工具调用组件的显示效果，添加动画和展开/折叠功能  
**状态**: ✅ 已完成

## 功能概述

为Agent页面的工具调用添加了美观的动态卡片组件，支持：
- ✨ 流畅的动画效果（旋转、淡入淡出、展开/折叠）
- 📋 点击展开查看工具执行结果
- 🎨 现代化的UI设计
- 🔄 实时状态显示（执行中、成功、失败）

## 实现内容

### 1. 创建工具调用卡片组件

**新文件**: `frontend/src/components/chat/ToolCallCard/ToolCallCard.jsx`

主要特性：
- 使用 `framer-motion` 实现流畅动画
- 支持展开/折叠功能
- 显示工具名称、参数、执行结果
- 根据执行状态显示不同图标和颜色

**新文件**: `frontend/src/components/chat/ToolCallCard/ToolCallCard.module.css`

样式特点：
- 深色主题，与整体UI风格一致
- 响应式设计
- 流畅的过渡动画
- 代码块样式优化

### 2. 更新Redux Store

**修改文件**: `frontend/src/store/store.js`

新增actions：
- `addToolCall`: 添加工具调用到消息中
- `updateToolResult`: 更新工具调用结果

消息结构扩展：
```javascript
{
  role: 'assistant',
  content: '',
  toolCalls: [
    {
      id: 1234567890.123,
      tool_name: 'filter_rss_news',
      tool_arguments: { query: 'AI' },
      isExecuting: true,
      result: null
    }
  ],
  ...
}
```

### 3. 更新Agent页面

**修改文件**: `frontend/src/pages/Agent.jsx`

- 导入新的actions: `addToolCall`, `updateToolResult`
- 修改工具调用回调，使用新的actions而不是直接添加到内容中
- 工具调用信息现在单独存储，不再混在文本内容中

### 4. 更新ChatBubble组件

**修改文件**: `frontend/src/components/chat/ChatBubble/ChatBubble.jsx`

- 导入 `ToolCallCard` 组件
- 在AI消息中渲染工具调用列表
- 工具调用显示在思考过程和回答内容之间

**修改文件**: `frontend/src/components/chat/ChatBubble/ChatBubble.module.css`

- 添加 `.toolCallsContainer` 样式

## 视觉效果

### 工具调用卡片状态

1. **执行中**
   - 旋转的加载图标（蓝色）
   - "执行中..." 标签（脉冲动画）
   - 可点击展开查看参数

2. **执行成功**
   - 绿色对勾图标
   - "执行完成" 标签
   - 点击展开查看参数和结果

3. **执行失败**
   - 红色错误图标
   - "执行失败" 标签
   - 点击展开查看错误信息

### 动画效果

- **卡片出现**: 淡入 + 上滑动画
- **图标旋转**: 执行中时持续旋转
- **展开/折叠**: 高度和透明度平滑过渡
- **悬停效果**: 背景色变化，轻微缩放

## 使用示例

```jsx
<ToolCallCard
  toolCall={{
    tool_name: 'filter_rss_news',
    tool_arguments: { query: 'AI', max_articles: 50 }
  }}
  toolResult={{
    content: '{"success": true, "articles": [...]}',
    tool_name: 'filter_rss_news'
  }}
  isExecuting={false}
/>
```

## 数据结构

### 工具调用数据格式

```typescript
interface ToolCall {
  id: number;
  tool_name: string;
  tool_arguments: Record<string, any>;
  isExecuting: boolean;
  result?: ToolResult;
}

interface ToolResult {
  tool_name: string;
  content: string;
  type?: 'success' | 'error';
}
```

## 文件清单

### 新增文件
- `frontend/src/components/chat/ToolCallCard/ToolCallCard.jsx`
- `frontend/src/components/chat/ToolCallCard/ToolCallCard.module.css`
- `frontend/src/components/chat/ToolCallCard/index.js`

### 修改文件
- `frontend/src/store/store.js` - 添加工具调用actions
- `frontend/src/pages/Agent.jsx` - 使用新的actions
- `frontend/src/components/chat/ChatBubble/ChatBubble.jsx` - 渲染工具调用组件
- `frontend/src/components/chat/ChatBubble/ChatBubble.module.css` - 添加容器样式

## 技术栈

- **React**: 组件化开发
- **Framer Motion**: 动画库
- **CSS Modules**: 样式隔离
- **Redux Toolkit**: 状态管理
- **Lucide React**: 图标库

## 后续优化建议

1. **结果格式化**: 根据工具类型自定义结果显示格式（如RSS新闻列表）
2. **复制功能**: 添加复制工具参数和结果的功能
3. **时间显示**: 显示工具执行耗时
4. **错误详情**: 更详细的错误信息展示
5. **批量操作**: 支持批量展开/折叠所有工具调用

---

**完成状态**: ✅  
**测试状态**: ⏳ 待前端测试验证
