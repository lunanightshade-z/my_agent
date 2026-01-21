## Chat 页面 Markdown 加粗样式修复

### 问题
Chat 页面中的 Markdown 列表项内 `strong` 加粗文本颜色仍为黑色，和深色主题冲突。

### 排查
定位到 Chat 页面实际使用的组件为 `ChatArea` -> `ChatBubble`，其中 `ReactMarkdown` 的渲染配置未覆盖 `strong` / `b` 标签样式。

### 处理
- 在 `frontend/src/components/composite/ChatBubble.jsx` 的 `ReactMarkdown` 组件中新增 `strong` 与 `b` 的渲染器。
- 使用内联样式强制 `color: #ffffff`、`fontWeight: 700`，确保不被其他样式覆盖。

### 验证
执行 `npm run build` 通过，未发现前端构建错误。

