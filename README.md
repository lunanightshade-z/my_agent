# 智谱AI聊天系统 - 企业级架构版

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个基于智谱AI API的**企业级**聊天应用，采用 React + FastAPI 四层架构，支持流式响应、Markdown渲染、代码高亮和深度思考模式。

## 🎉 v2.0 新特性

- 🏗️ **企业级四层架构**：API层、业务逻辑层、数据访问层、基础设施层
- 📊 **完整可观测性**：结构化日志（structlog）、请求追踪、性能监控
- 🛡️ **生产级容错**：重试机制、超时控制、缓存策略、优雅降级
- 🧪 **测试覆盖**：pytest 单元测试 + 集成测试
- 🐳 **Docker支持**：完整的容器化部署方案
- 📖 **详细文档**：架构说明、迁移指南、快速启动

## ✨ 功能特性

- 🎨 **小清新UI设计**：柔和的配色、流畅的动画效果
- 💬 **智能对话**：基于智谱AI GLM-4-Flash模型
- 🔄 **流式响应**：实时展示AI回复内容
- 📝 **Markdown支持**：富文本渲染，支持代码高亮
- 🧠 **深度思考模式**：启用thinking模式获得更深入的回答
- 💾 **历史记录**：自动保存所有对话内容
- 📱 **多会话管理**：支持创建、切换和删除多个对话

## 🏗️ 技术栈

### 后端（企业级架构）
- **FastAPI**：现代化 Python Web 框架
- **SQLAlchemy**：ORM + Repository 模式
- **Structlog**：结构化日志系统
- **Tenacity**：智能重试机制
- **Pydantic Settings**：配置管理
- **智谱AI SDK**：LLM 调用（带缓存和容错）
- **Server-Sent Events**：流式传输

### 前端
- React 18 + Vite
- Redux Toolkit（状态管理）
- TailwindCSS（样式框架）
- Framer Motion（动画）
- react-markdown + react-syntax-highlighter（内容渲染）

## 📦 项目结构

```
building_agent/
├── backend/                      # FastAPI 后端（企业级架构）
│   ├── app/                      # 应用代码
│   │   ├── main.py               # FastAPI 主应用
│   │   ├── config.py             # 配置管理
│   │   ├── dependencies.py       # 依赖注入
│   │   ├── api/                  # API 层
│   │   │   ├── schemas.py        # Pydantic 模型
│   │   │   └── v1/               # API v1 版本
│   │   │       ├── conversations.py
│   │   │       ├── messages.py
│   │   │       └── chat.py
│   │   ├── services/             # 服务层（业务逻辑）
│   │   │   └── chat_service.py
│   │   └── infrastructure/       # 基础设施层
│   │       ├── database/         # 数据访问（Repository）
│   │       ├── llm/              # LLM 客户端（容错）
│   │       ├── logging/          # 日志系统
│   │       └── cache/            # 缓存系统
│   ├── tests/                    # 测试
│   │   ├── unit/                 # 单元测试
│   │   └── integration/          # 集成测试
│   ├── docker/                   # Docker 配置
│   ├── requirements.txt
│   ├── README.md                 # 后端文档
│   ├── QUICKSTART.md             # 快速启动
│   ├── MIGRATION_GUIDE.md        # 迁移指南
│   └── ARCHITECTURE_MIGRATION.md # 架构说明
├── frontend/                     # React 前端
│   ├── src/
│   │   ├── components/
│   │   ├── store/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
├── docs/                         # 项目文档
└── README.md                     # 本文件
```

## 🚀 快速开始

### 环境要求

- Python 3.9+
- Node.js 16+
- npm 或 yarn

### 1. 克隆项目

```bash
cd building_agent
```

### 2. 配置环境变量

确保项目根目录有 `.env` 文件，包含智谱API密钥：

```env
ZHIPU_API_KEY=your_api_key_here
```

### 3. 启动后端（新架构）

```bash
# 进入后端目录
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务（默认端口 8000）
uvicorn app.main:app --reload
```

后端服务将在 `http://localhost:8000` 启动

> 💡 **注意**：启动命令已更改为 `app.main:app`（原为 `main:app`）

**查看详细文档：**
- [后端 README](backend/README.md) - 完整功能和 API 文档
- [快速启动指南](backend/QUICKSTART.md) - 快速上手
- [迁移指南](backend/MIGRATION_GUIDE.md) - 从旧版本迁移

### 4. 启动前端

打开新的终端窗口：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器（默认端口 5173）
npm run dev
```

前端应用将在 `http://localhost:5173` 启动

### 5. 访问应用

打开浏览器访问 `http://localhost:5173`，开始使用聊天应用！

## 📖 使用说明

1. **创建新对话**：点击左侧"新建对话"按钮
2. **发送消息**：在底部输入框输入内容，按 Enter 发送（Shift+Enter 换行）
3. **深度思考**：点击"深度思考"开关启用 thinking 模式
4. **切换对话**：点击左侧历史列表中的对话进行切换
5. **删除对话**：悬停在对话上，点击删除图标

## 🎨 界面预览

- **左侧面板**：显示所有对话历史，支持快速切换
- **主聊天区**：展示用户和AI的对话内容，支持Markdown渲染
- **输入框**：底部输入区域，支持多行输入和快捷键

## 🔧 API 端点

所有 API 端点路径**保持不变**，前端无需修改！

### 会话管理
- `POST /api/conversations` - 创建新对话
- `GET /api/conversations` - 获取所有对话列表
- `DELETE /api/conversations/{id}` - 删除对话
- `GET /api/conversations/{id}/messages` - 获取对话消息

### 聊天
- `POST /api/chat/stream` - 流式聊天（SSE）

### 文档和监控
- `GET /docs` - Swagger API 文档
- `GET /health` - 健康检查
- `GET /` - API 信息

## 🐛 故障排查

### 后端无法启动
- 确保已安装所有 Python 依赖：`pip install -r backend/requirements.txt`
- 检查 `.env` 文件中的 `ZHIPU_API_KEY` 是否正确
- 确认端口 8000 未被占用

### 前端无法连接后端
- 确认后端服务已启动并运行在 `http://localhost:8000`
- 检查浏览器控制台是否有 CORS 错误
- 确认前端代理配置正确（`vite.config.js`）

### 流式响应不工作
- 确保使用支持 SSE 的现代浏览器
- 检查网络连接和防火墙设置

## 📝 开发说明

### 后端开发
- **API 文档**：http://localhost:8000/docs（Swagger UI）
- **架构设计**：四层架构（API → Service → Repository → Infrastructure）
- **日志系统**：结构化日志（开发环境带颜色，生产环境 JSON）
- **测试**：`pytest`（单元测试 + 集成测试）
- **代码规范**：`black`（格式化）、`flake8`（检查）

**运行测试：**
```bash
cd backend
pytest
```

**查看 API 文档：**
```bash
# 启动后访问
http://localhost:8000/docs
```

### 前端开发
- **热更新**：Vite 自动刷新
- **状态管理**：Redux Toolkit + Redux DevTools
- **样式**：TailwindCSS 实用类
- **API 调用**：`src/services/api.js`

## 🐳 Docker 部署

使用 Docker Compose 快速部署：

```bash
cd backend/docker
docker-compose up -d
```

详见 [Docker 部署文档](backend/docker/README.md)

## 📚 文档导航

- **[后端完整文档](backend/README.md)** - 架构设计、API 文档、配置说明
- **[快速启动指南](backend/QUICKSTART.md)** - 新手入门
- **[迁移指南](backend/MIGRATION_GUIDE.md)** - 从 v1.0 升级到 v2.0
- **[架构改造说明](backend/ARCHITECTURE_MIGRATION.md)** - 架构对比和改进点

## 🎯 v2.0 架构亮点

### 1. 可观测性（Observability）
- 📊 **结构化日志**：JSON 格式，便于日志分析
- 🔍 **请求追踪**：每个请求有唯一 ID
- ⏱️ **性能监控**：记录每个操作的耗时

### 2. 可靠性（Reliability）
- 🔄 **智能重试**：LLM 调用失败自动重试（指数退避）
- ⏰ **超时控制**：防止请求无限等待
- 💾 **缓存策略**：减少重复的 LLM 调用
- 🛡️ **优雅降级**：服务异常时提供友好错误信息

### 3. 可维护性（Maintainability）
- 🏗️ **清晰分层**：API → Service → Repository → Infrastructure
- 💉 **依赖注入**：组件解耦，便于测试
- 🧪 **测试覆盖**：单元测试 + 集成测试
- 📖 **详细文档**：代码注释 + 架构说明

### 4. 可扩展性（Scalability）
- 🐳 **Docker 支持**：容器化部署
- 🔌 **模块化设计**：易于添加新功能
- ⚙️ **配置管理**：环境变量管理，支持多环境
- 📈 **性能优化**：缓存、连接池、异步处理

## 📝 更新日志

### v2.0.0 (2024-01-12)

**重大更新：企业级架构重构**

- ✨ 全新的四层架构设计
- 📊 结构化日志系统（structlog）
- 🛡️ LLM 调用容错机制（重试、超时、缓存）
- 🏗️ Repository 模式数据访问层
- 🧪 完整的测试覆盖（pytest）
- 🐳 Docker 容器化支持
- 📖 详细的文档和注释
- ⚠️ **重要**：启动命令变更为 `uvicorn app.main:app`

### v1.0.0

- 基础聊天功能
- SQLite 数据持久化
- 流式响应支持

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [智谱AI](https://open.bigmodel.cn/) - 提供强大的AI能力
- [FastAPI](https://fastapi.tiangolo.com/) - 高性能Python Web框架
- [React](https://react.dev/) - 用户界面库
- [TailwindCSS](https://tailwindcss.com/) - CSS框架

