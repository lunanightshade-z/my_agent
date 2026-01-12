# 从旧架构迁移到新架构指南

## 📋 迁移步骤

### 步骤 1: 备份现有数据

```bash
# 备份数据库文件
cp backend/chat_history.db backend/chat_history.db.backup

# 备份旧代码（可选）
cd backend
mkdir old_version
cp main.py models.py database.py zhipu_service.py schemas.py old_version/
```

### 步骤 2: 安装新依赖

```bash
cd backend
pip install -r requirements.txt
```

新增的依赖包括：
- `pydantic-settings` - 配置管理
- `structlog` - 结构化日志
- `tenacity` - 重试机制
- `pytest`, `pytest-asyncio` - 测试框架

### 步骤 3: 创建配置文件

在 `backend` 目录创建 `.env` 文件：

```env
# 复制现有的 API Key
ZHIPU_API_KEY=your_existing_api_key

# 使用现有的数据库文件
DATABASE_URL=sqlite:///./chat_history.db

# 开发环境配置
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
CACHE_ENABLED=true
```

### 步骤 4: 数据库迁移（无需操作）

新架构的数据库模型与旧版本兼容，无需迁移数据。
新架构会自动使用现有的 `chat_history.db` 文件。

### 步骤 5: 启动新版本

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 步骤 6: 验证功能

1. **健康检查**
   ```bash
   curl http://localhost:8000/health
   ```

2. **获取会话列表**
   ```bash
   curl http://localhost:8000/api/conversations
   ```

3. **查看 API 文档**
   访问 http://localhost:8000/docs

### 步骤 7: 更新前端配置（如果需要）

API 端点路径没有变化，前端应该可以直接工作。
如果前端有问题，检查 CORS 配置：

在 `.env` 中添加：
```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## 🔄 API 端点对照表

| 功能 | 旧版本路径 | 新版本路径 | 变化 |
|------|-----------|-----------|------|
| 创建会话 | `POST /api/conversations` | `POST /api/conversations` | ✅ 无变化 |
| 获取会话列表 | `GET /api/conversations` | `GET /api/conversations` | ✅ 无变化 |
| 删除会话 | `DELETE /api/conversations/{id}` | `DELETE /api/conversations/{id}` | ✅ 无变化 |
| 更新标题 | `PUT /api/conversations/{id}/title` | `PUT /api/conversations/{id}/title` | ✅ 无变化 |
| 生成标题 | `POST /api/conversations/{id}/generate-title` | `POST /api/conversations/{id}/generate-title` | ✅ 无变化 |
| 获取消息 | `GET /api/conversations/{id}/messages` | `GET /api/conversations/{id}/messages` | ✅ 无变化 |
| 流式聊天 | `POST /api/chat/stream` | `POST /api/chat/stream` | ✅ 无变化 |
| 健康检查 | `GET /health` | `GET /health` | ✅ 无变化 |

**结论：所有 API 端点路径保持不变，前端无需修改！**

## 📊 响应格式对照

### 会话响应
**旧版本和新版本完全相同：**
```json
{
  "id": 1,
  "title": "测试会话",
  "created_at": "2024-01-12T10:00:00",
  "updated_at": "2024-01-12T10:00:00"
}
```

### 消息响应
**旧版本和新版本完全相同：**
```json
{
  "id": 1,
  "conversation_id": 1,
  "role": "user",
  "content": "你好",
  "thinking_mode": false,
  "timestamp": "2024-01-12T10:00:00"
}
```

### 流式响应
**旧版本和新版本完全相同：**
```
data: {"type": "delta", "content": "你好"}
data: {"type": "done"}
```

## 🆕 新增功能

### 1. 结构化日志

**示例输出（开发环境）：**
```
2024-01-12 10:30:45 [info] http_request request_id=abc-123 method=POST path=/api/chat/stream status_code=200 duration_ms=1234.56
```

**示例输出（生产环境）：**
```json
{
  "event": "http_request",
  "request_id": "abc-123",
  "method": "POST",
  "path": "/api/chat/stream",
  "status_code": 200,
  "duration_ms": 1234.56,
  "timestamp": "2024-01-12T10:30:45Z"
}
```

### 2. 请求追踪

每个 API 请求都会返回 `X-Request-ID` 响应头，用于追踪请求。

### 3. 缓存系统

标题生成等非流式调用会被缓存，减少重复的 LLM 调用。

### 4. 重试机制

LLM 调用失败时会自动重试（最多3次），提高可靠性。

### 5. 超时控制

LLM 调用默认超时时间为 30 秒，防止请求无限等待。

## 🔧 配置对比

### 旧版本
配置通过 `.env` 文件和代码中的常量混合管理。

### 新版本
所有配置集中在 `app/config.py`，可通过环境变量覆盖。

**常用配置：**
```env
# 应用配置
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# LLM 配置
ZHIPU_API_KEY=your_key
LLM_MODEL=glm-4-flash
LLM_REQUEST_TIMEOUT=30

# 数据库配置
DATABASE_URL=sqlite:///./chat_history.db

# 缓存配置
CACHE_ENABLED=true
CACHE_TTL=3600
```

## 🧪 测试迁移后的系统

### 1. 基础功能测试
```bash
# 创建会话
curl -X POST http://localhost:8000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "测试会话"}'

# 发送消息
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": 1,
    "message": "你好",
    "thinking_enabled": false
  }'
```

### 2. 运行自动化测试
```bash
cd backend
pytest
```

### 3. 压力测试（可选）
```bash
# 使用 Apache Bench
ab -n 100 -c 10 http://localhost:8000/health

# 使用 wrk
wrk -t4 -c100 -d30s http://localhost:8000/health
```

## 🐛 常见问题排查

### 问题 1: 启动时提示 `ModuleNotFoundError`

**原因**：新依赖未安装。

**解决**：
```bash
pip install -r requirements.txt
```

### 问题 2: 找不到数据库文件

**原因**：`.env` 中的 `DATABASE_URL` 路径错误。

**解决**：
```env
# 使用相对路径
DATABASE_URL=sqlite:///./chat_history.db

# 或使用绝对路径
DATABASE_URL=sqlite:////absolute/path/to/chat_history.db
```

### 问题 3: 前端连接失败（CORS 错误）

**原因**：CORS 配置不正确。

**解决**：在 `.env` 中添加前端地址：
```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### 问题 4: 日志输出太多

**原因**：日志级别为 DEBUG。

**解决**：修改 `.env`：
```env
LOG_LEVEL=INFO
```

### 问题 5: 缓存不生效

**原因**：缓存可能被禁用。

**解决**：检查 `.env`：
```env
CACHE_ENABLED=true
```

## 📈 性能对比

| 指标 | 旧版本 | 新版本 | 改进 |
|------|-------|--------|------|
| 标题生成（重复调用） | ~2秒 | ~10毫秒 | 缓存加速 |
| LLM 调用失败恢复 | 失败即返回错误 | 自动重试3次 | 提高可靠性 |
| 请求追踪能力 | 无 | 每个请求有唯一ID | 便于排查问题 |
| 日志可读性 | 简单文本 | 结构化JSON | 便于分析 |
| 错误处理 | 基础异常处理 | 统一错误响应 | 更友好 |

## 🎯 后续优化建议

迁移完成后，可以考虑以下优化：

1. **数据库升级**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/aiagent
   ```

2. **启用 Redis 缓存**
   ```env
   CACHE_TYPE=redis
   REDIS_URL=redis://localhost:6379
   ```

3. **Docker 部署**
   ```bash
   cd backend/docker
   docker-compose up -d
   ```

4. **配置监控**
   - 集成 Prometheus
   - 配置 Grafana 仪表盘
   - 设置告警规则

## ✅ 迁移检查清单

- [ ] 备份现有数据库
- [ ] 安装新依赖 (`pip install -r requirements.txt`)
- [ ] 创建 `.env` 配置文件
- [ ] 启动新版本应用
- [ ] 验证健康检查端点
- [ ] 测试现有会话是否可访问
- [ ] 测试新会话创建和聊天功能
- [ ] 验证前端连接正常
- [ ] 运行自动化测试 (`pytest`)
- [ ] 检查日志输出是否正常
- [ ] 记录迁移过程中的问题（如有）

## 🆘 回滚到旧版本

如果迁移过程中遇到问题，可以快速回滚：

```bash
# 1. 停止新版本
# Ctrl+C 或 kill process

# 2. 恢复旧版本代码（如果已备份）
cd backend
cp old_version/* .

# 3. 启动旧版本
uvicorn main:app --reload

# 4. 恢复数据库（如果需要）
cp chat_history.db.backup chat_history.db
```

## 📞 获取帮助

如果迁移过程中遇到问题：

1. 查看日志输出，寻找错误信息
2. 检查 `.env` 配置是否正确
3. 访问 API 文档 (http://localhost:8000/docs) 测试端点
4. 运行 `pytest` 查看哪些测试失败
5. 查看 `ARCHITECTURE_MIGRATION.md` 了解架构变化

---

**祝您迁移顺利！🎉**
