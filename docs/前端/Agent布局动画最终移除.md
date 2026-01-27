# Agent 页面布局抖动终极修复

## 问题症状
用户刷新页面后，整个对话区域（包括左侧、中间、右侧面板）会看到"从下往上移动"的动画效果

## 根本原因
1. **三栏容器使用 `motion.aside` / `motion.main`**：framer-motion 的自动布局动画在首屏渲染、字体加载、内容尺寸变化时会触发 FLIP 补间
2. **侧边栏会话列表项使用 `motion.div` + `initial/animate`**：每个会话项的进场动画会引起父容器重排
3. **3D 旋转 style 与布局动画叠加**：`rotateX/rotateY` 与 layout 动画结合会产生视觉不稳定

## 解决方案
**彻底移除所有容器级别的 motion 组件**，改回普通 HTML 元素：

### 1. 三栏容器去 motion 化
- `motion.aside`（左） → `aside`
- `motion.main`（中） → `main`  
- `motion.aside`（右） → `aside`
- 移除 `style={{ rotateX, rotateY }}`

### 2. 列表项去动画
- 会话列表 `motion.div` → `div`
- 移除 `initial/animate`

### 3. 保留必要的交互动画
- 按钮 hover/tap（`motion.button`）保持不变
- 消息气泡进场动画（`motion.div`）保持不变（消息动画是内容级，不影响容器布局）

## 代码变更位置
`frontend/src/pages/Agent.jsx`：
- L302-309: 左侧栏 `motion.aside` → `aside`
- L366-368: 中间主面板 `motion.main` → `main`
- L500-502: 右侧栏 `motion.aside` → `aside`
- L331-340: 会话列表项 `motion.div` → `div`

## 验证标准
刷新页面后：
- **三栏面板不应有任何上下/左右位移动画**
- 仅消息气泡自身有淡入/上浮动画（符合预期）
- 输入框严格贴近主面板底部，无空隙

## 部署时间
2026-01-21 修复并部署
