# 快速启动指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，至少需要配置：
- `ZHIPU_API_KEY`: 您的智谱AI API密钥

### 3. 启动应用

**开发模式（推荐）：**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**生产模式：**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. 验证启动

访问以下地址验证服务是否正常：

- **健康检查**: http://localhost:8000/health
- **API 文档**: http://localhost:8000/docs
- **ReDoc 文档**: http://localhost:8000/redoc

## 🐳 使用 Docker 启动

### 快速启动（推荐用于生产环境）

```bash
cd backend/docker
docker-compose up -d
```

### 查看日志

```bash
docker-compose logs -f api
```

### 停止服务

```bash
docker-compose down
```

## 🧪 运行测试

```bash
cd backend

# 运行所有测试
pytest

# 运行单元测试
pytest tests/unit/

# 运行集成测试
pytest tests/integration/

# 查看测试覆盖率
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

## 📊 查看日志

### 开发环境
日志会直接输出到终端，带颜色的可读格式。

### 生产环境（Docker）
日志文件保存在 `backend/docker/logs/` 目录。

### 日志查询示例

```bash
# 查看最近的错误日志
grep "error" logs/app.log

# 查看特定请求的日志（通过 request_id）
grep "abc-123" logs/app.log

# 查看 LLM 调用日志
grep "llm_call" logs/app.log
```

## 🔧 常见问题

### Q: 启动时提示找不到模块

**A:** 确保已安装所有依赖：
```bash
pip install -r requirements.txt
```

### Q: 数据库文件在哪里？

**A:** 默认使用 SQLite，数据库文件在 `backend/chat_history.db`。
如需更换为 PostgreSQL，修改 `.env` 中的 `DATABASE_URL`。

### Q: 如何清空缓存？

**A:** 内存缓存在应用重启时自动清空。
如使用 Redis，执行 `redis-cli FLUSHALL`。

### Q: 如何修改日志级别？

**A:** 修改 `.env` 中的 `LOG_LEVEL`，可选值：DEBUG, INFO, WARNING, ERROR。

### Q: 启动后前端无法连接？

**A:** 检查 CORS 配置，确保前端地址在 `CORS_ORIGINS` 中。

## 📝 与旧版本的差异

| 功能 | 旧版本 | 新版本 |
|------|-------|--------|
| 启动命令 | `uvicorn main:app` | `uvicorn app.main:app` |
| 配置文件 | 无 | `.env` |
| 日志系统 | 简单 logging | structlog（结构化日志） |
| 缓存系统 | 无 | 内存缓存/Redis |
| 容错机制 | 无 | 重试、超时、降级 |
| 测试 | 无 | pytest 单元测试+集成测试 |
| Docker | 无 | 完整的 Docker 支持 |

## 🎯 下一步

1. **修改前端 API 地址**：
   如果前端还在运行，API 端点路径没有变化，应该可以直接工作。

2. **运行测试**：
   确保所有功能正常：`pytest`

3. **查看 API 文档**：
   访问 http://localhost:8000/docs 查看所有可用的 API。

4. **监控日志**：
   观察结构化日志输出，了解系统运行状态。

## 📚 更多文档

- [完整 README](README.md)
- [架构改造说明](ARCHITECTURE_MIGRATION.md)
- [Docker 部署文档](docker/README.md)

## ❓ 需要帮助？

如有问题，请查看：
1. 日志输出（查找错误信息）
2. API 文档（http://localhost:8000/docs）
3. 健康检查端点（http://localhost:8000/health）
