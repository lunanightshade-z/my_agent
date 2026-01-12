# 智谱AI聊天系统 - 企业级架构版

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

一个基于智谱AI API的企业级聊天应用，采用现代化的四层架构设计，包含完整的可观测性、容错机制和测试覆盖。

## ✨ 核心特性

### 🏗️ 企业级架构
- **四层架构设计**：API层、业务逻辑层、数据访问层、基础设施层
- **Repository模式**：清晰的数据访问抽象
- **依赖注入**：解耦组件，便于测试和维护
- **配置管理**：基于 pydantic-settings 的环境隔离

### 📊 可观测性
- **结构化日志**：使用 structlog，支持 JSON 格式输出
- **请求追踪**：每个请求都有唯一 ID，便于追踪
- **性能监控**：记录每个操作的耗时
- **错误处理**：统一的异常处理和错误响应

### 🛡️ 可靠性与容错
- **重试机制**：LLM 调用失败自动重试（指数退避）
- **超时控制**：防止请求无限等待
- **缓存策略**：内存缓存减少重复调用
- **优雅降级**：服务异常时提供友好的错误信息

### 🚀 功能特性
- 💬 **智能对话**：基于智谱AI GLM-4模型
- 🔄 **流式响应**：实时展示AI回复（SSE）
- 🧠 **深度思考模式**：启用thinking模式获得更深入的回答
- 💾 **历史记录**：自动保存所有对话内容
- 📱 **多会话管理**：支持创建、切换和删除多个对话

## 📂 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI应用入口
│   ├── config.py               # 配置管理
│   ├── dependencies.py         # 依赖注入
│   │
│   ├── api/                    # API层
│   │   ├── schemas.py          # Pydantic模型
│   │   └── v1/
│   │       ├── conversations.py # 会话端点
│   │       ├── messages.py      # 消息端点
│   │       └── chat.py          # 聊天端点
│   │
│   ├── services/               # 服务层（业务逻辑）
│   │   └── chat_service.py     # 聊天服务
│   │
│   ├── infrastructure/         # 基础设施层
│   │   ├── database/
│   │   │   ├── connection.py   # 数据库连接
│   │   │   ├── models.py       # ORM模型
│   │   │   └── repositories.py # Repository模式
│   │   ├── llm/
│   │   │   └── zhipu_client.py # 智谱AI客户端
│   │   ├── logging/
│   │   │   ├── setup.py        # 日志配置
│   │   │   └── utils.py        # 日志工具
│   │   └── cache/
│   │       └── memory_cache.py # 内存缓存
│   │
│   └── utils/                  # 工具函数
│
├── tests/                      # 测试
│   ├── conftest.py             # pytest配置
│   ├── unit/                   # 单元测试
│   └── integration/            # 集成测试
│
├── docker/                     # Docker配置
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── requirements.txt            # Python依赖
└── README.md                   # 本文件
```

## 🚀 快速开始

### 环境要求

- Python 3.11+
- pip 或 poetry

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

在 `backend` 目录创建 `.env` 文件：

```env
# LLM 配置
ZHIPU_API_KEY=your_api_key_here

# 应用配置（可选）
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# 数据库配置（可选）
DATABASE_URL=sqlite:///./chat_history.db

# 缓存配置（可选）
CACHE_ENABLED=true
CACHE_TYPE=memory
CACHE_TTL=3600
```

### 3. 启动服务

```bash
# 开发模式（自动重载）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

服务将在 http://localhost:8000 启动

### 4. 访问 API 文档

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🧪 运行测试

```bash
# 运行所有测试
pytest

# 运行单元测试
pytest tests/unit/

# 运行集成测试
pytest tests/integration/

# 查看测试覆盖率
pytest --cov=app --cov-report=html
```

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
cd backend/docker

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

详见 [Docker 部署文档](docker/README.md)

## 📖 API 使用

### 创建会话

```bash
curl -X POST "http://localhost:8000/api/conversations" \
  -H "Content-Type: application/json" \
  -d '{"title": "新对话"}'
```

### 发送消息（流式）

```bash
curl -X POST "http://localhost:8000/api/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": 1,
    "message": "你好",
    "thinking_enabled": false
  }'
```

### 获取会话历史

```bash
curl "http://localhost:8000/api/conversations/1/messages"
```

更多 API 详情请访问 `/docs` 端点。

## 🏗️ 架构设计

### 分层架构

1. **API Layer（API层）**
   - 请求验证（Pydantic）
   - 响应序列化
   - 错误处理
   - 请求追踪

2. **Business Logic Layer（业务逻辑层）**
   - 领域模型
   - 业务用例（Services）
   - 编排逻辑

3. **Data Access Layer（数据访问层）**
   - Repository 模式
   - ORM 模型（SQLAlchemy）
   - 数据库操作

4. **Infrastructure Layer（基础设施层）**
   - 日志系统（structlog）
   - 缓存（Memory/Redis）
   - 外部 API 客户端（智谱AI）
   - 配置管理

### 核心设计原则

- **可观测性优先**：结构化日志、请求追踪、性能监控
- **容错与重试**：LLM 调用失败自动重试，超时控制
- **配置隔离**：环境变量管理，支持多环境部署
- **测试覆盖**：单元测试 + 集成测试

## 📊 日志示例

开发环境（带颜色的可读格式）：
```
2024-01-12 10:30:45 [info] http_request request_id=abc-123 method=POST path=/api/chat/stream status_code=200 duration_ms=1234.56
```

生产环境（JSON格式，便于日志收集）：
```json
{
  "event": "http_request",
  "request_id": "abc-123",
  "method": "POST",
  "path": "/api/chat/stream",
  "status_code": 200,
  "duration_ms": 1234.56,
  "timestamp": "2024-01-12T10:30:45.123456Z"
}
```

## 🔧 配置说明

所有配置都在 `app/config.py` 中定义，可通过环境变量覆盖：

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `ZHIPU_API_KEY` | 智谱AI API密钥 | 必填 |
| `ENVIRONMENT` | 运行环境 | development |
| `LOG_LEVEL` | 日志级别 | INFO |
| `DATABASE_URL` | 数据库连接 | sqlite:///./chat_history.db |
| `CACHE_ENABLED` | 是否启用缓存 | true |
| `LLM_REQUEST_TIMEOUT` | LLM请求超时（秒） | 30 |
| `MAX_CONVERSATION_HISTORY` | 最大历史消息数 | 20 |

## 🛠️ 开发指南

### 添加新的 API 端点

1. 在 `app/api/schemas.py` 定义请求/响应模型
2. 在 `app/api/v1/` 创建路由文件
3. 在 `app/main.py` 注册路由
4. 编写单元测试和集成测试

### 添加新的服务

1. 在 `app/services/` 创建服务类
2. 在 `app/dependencies.py` 添加依赖注入
3. 在业务逻辑中使用服务
4. 编写单元测试

### 代码规范

```bash
# 格式化代码
black app/ tests/

# 检查代码风格
flake8 app/ tests/

# 类型检查
mypy app/
```

## 🚦 性能优化建议

1. **启用 Redis 缓存**：适合多实例部署
2. **使用连接池**：PostgreSQL/MySQL 替代 SQLite
3. **启用 Nginx**：反向代理和负载均衡
4. **水平扩展**：运行多个 worker 进程
5. **CDN 加速**：静态资源使用 CDN

## 📝 更新日志

### v2.0.0 (2024-01-12)

- ✨ 全新的企业级四层架构
- 📊 结构化日志系统（structlog）
- 🛡️ LLM 调用容错机制（重试、超时、缓存）
- 🏗️ Repository 模式数据访问层
- 🧪 完整的测试覆盖
- 🐳 Docker 容器化支持
- 📖 详细的文档和注释

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
- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的Python Web框架
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python ORM 框架
- [structlog](https://www.structlog.org/) - 结构化日志库
