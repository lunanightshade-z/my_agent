# 前端重构设计文档：Ethereal Intelligence (空灵智能)

## 1. 设计愿景
打造一个具有顶尖审美、现代感与科技感并存的 AI Agent 平台。核心设计理念为 **"Ethereal Intelligence" (空灵智能)**，强调轻盈、流畅、清晰与深度。

风格关键词：`Minimalist`, `Glassmorphism`, `Fluid`, `Sophisticated`.

## 2. 色彩系统 (Color System)

我们将采用一套高对比度且和谐的色彩系统，支持从清新的亮色模式平滑过渡到深邃的暗色模式。

### 核心色板 (Brand Colors)
- **Primary (主色)**: `Indigo-Violet` 渐变。代表智慧与科技深度。
  - Start: `#6366f1` (Indigo-500)
  - End: `#8b5cf6` (Violet-500)
- **Secondary (辅色)**: `Cyan-Teal` 渐变。代表活力与清晰（保留原有 Mint 的精神但升级）。
  - Start: `#06b6d4` (Cyan-500)
  - End: `#14b8a0` (Teal-500)
- **Accent (强调色)**: `#f43f5e` (Rose-500) - 用于错误或重要警告。

### 中性色 (Neutrals) - Light Mode
- **Background**: `#f8fafc` (Slate-50) - 极淡的灰白，避免纯白的刺眼。
- **Surface**: `#ffffff` (White) - 卡片与容器背景。
- **Text Primary**: `#0f172a` (Slate-900) - 主要标题。
- **Text Secondary**: `#475569` (Slate-600) - 正文。
- **Text Tertiary**: `#94a3b8` (Slate-400) - 辅助信息。
- **Border**: `#e2e8f0` (Slate-200).

### 阴影与光效 (Effects)
- **Glassmorphism**: 背景模糊 + 半透明白色背景 + 细微边框。
- **Glow**: 元素背后的彩色光晕，用于强调“智能”感。

## 3. 排版系统 (Typography)

使用系统默认的高质量无衬线字体栈（San Francisco, Inter, Segoe UI），确保在各平台上的最佳渲染。

- **Font Family**: `Inter`, system-ui, sans-serif.
- **Scale**:
  - `Display`: 48px/60px, Bold/ExtraBold (用于落地页大标题).
  - `H1`: 36px/44px, Bold.
  - `H2`: 30px/36px, SemiBold.
  - `H3`: 24px/32px, SemiBold.
  - `Body Large`: 18px/28px, Regular.
  - `Body`: 16px/24px, Regular.
  - `Small`: 14px/20px, Medium.
  - `Tiny`: 12px/16px, Medium.

## 4. 布局与组件规范

### 4.1 导航栏 (Navbar)
- **位置**: 顶部固定 (Sticky Top).
- **样式**: Glassmorphism 效果（backdrop-blur-md, bg-white/70）。
- **内容**:
  - Left: Logo (MyAgent) - 渐变文字。
  - Center: 导航链接 (Home, Chat, Agent) - Pill shape active state.
  - Right: User Profile / Settings / GitHub Icon.

### 4.2 落地页 (Landing Page)
- **Hero Section**:
  - 居中大标题，配以动态渐变文字。
  - 副标题清晰易读。
  - CTA 按钮：高光泽度、渐变背景、Hover 悬浮效果。
  - 背景：抽象的 3D 或几何图形动画（使用 CSS 或 SVG）。
- **Features Section**:
  - 3列网格布局。
  - 卡片式设计，Hover 时轻微上浮并加强阴影。

### 4.3 Chat 界面 (重构)
- **Sidebar (History)**:
  - 更加隐形的设计，背景色与主背景融合，或使用极淡的分割线。
  - 选中项使用柔和的背景色块。
- **Chat Area**:
  - **Message Bubbles**:
    - User: 品牌色渐变背景，白色文字，大圆角。
    - AI: 白色/浅灰背景，深色文字，精微阴影。
  - **Input Area**:
    - 悬浮于底部的胶囊状容器，带有很强的阴影（Elevation）。
    - 整合发送按钮与附件图标。

### 4.4 Agent 页面
- **Grid Layout**: 响应式网格展示不同的 Agents。
- **Agent Card**:
  - 包含图标/Avatar。
  - 名称与简短描述。
  - 状态指示灯（Online/Offline）。
  - "Chat" 按钮。

## 5. Tailwind 配置预览

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Indigo
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: {
          500: '#14b8a0', // Teal
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
```

## 6. CSS 变量与全局样式

我们将使用 CSS 变量来管理主题颜色，以便未来轻松切换 Dark Mode。

```css
:root {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```
