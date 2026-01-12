# API Key 配置修复

## 问题描述

发送消息时出现 `Connection error` 和 `APIConnectionError`，无法连接到智谱AI API。

## 问题分析

### 根本原因

1. **.env 文件位置不正确**
   - `.env` 文件在项目根目录 `/home/superdev/my_agent/.env`
   - 但 `docker-compose.yml` 在 `backend/docker/` 目录下执行
   - docker-compose 默认在当前执行目录查找 `.env` 文件

2. **docker-compose.yml 配置问题**
   - 使用 `${ZHIPU_API_KEY}` 语法，从环境变量读取
   - 但没有使用 `env_file` 指令来加载 `.env` 文件
   - 导致容器启动时环境变量为空

3. **容器内环境变量为空**
   - 检查发现：`ZHIPU_API_KEY=` (空值)
   - 导致智谱AI客户端无法初始化，连接失败

## 修复步骤

### 1. 复制 .env 文件到正确位置

```bash
cd /home/superdev/my_agent/backend/docker
cp ../../.env .env
```

### 2. 修改 docker-compose.yml

添加 `env_file` 配置，确保从 `.env` 文件读取环境变量：

```yaml
services:
  api:
    env_file:
      - .env
    environment:
      - ZHIPU_API_KEY=${ZHIPU_API_KEY}
      # ... 其他配置
```

### 3. 重启容器

```bash
cd /home/superdev/my_agent/backend/docker
docker compose down
docker compose up -d
```

或者只重启 API 服务：

```bash
docker compose restart api
```

### 4. 验证配置

检查容器内的环境变量：

```bash
docker exec ai_agent_api env | grep ZHIPU
```

应该显示：
```
ZHIPU_API_KEY=bac235adf98b4605890c1bc7cda0544a.3E0y9MSsv8FB6cbm
```

验证应用配置：

```bash
docker exec ai_agent_api python -c "from app.config import settings; print('API Key exists:', bool(settings.ZHIPU_API_KEY))"
```

应该显示：
```
API Key exists: True
```

## 修复结果

✅ **API Key 已正确配置**
- 环境变量已正确加载到容器
- 应用配置已正确读取 API Key
- 智谱AI客户端可以正常初始化

## 测试验证

1. **发送测试消息**
   - 打开前端页面
   - 发送一条消息
   - 应该能正常收到回复

2. **检查日志**
   ```bash
   docker logs ai_agent_api --tail 50
   ```
   - 应该看到 `llm_call_success` 而不是 `llm_call_failed`
   - 不应该再出现 `Connection error`

## 相关文件

- `/home/superdev/my_agent/.env` - 项目根目录的 .env 文件
- `/home/superdev/my_agent/backend/docker/.env` - docker-compose 使用的 .env 文件（已复制）
- `/home/superdev/my_agent/backend/docker/docker-compose.yml` - Docker Compose 配置文件（已修改）

## 注意事项

1. **.env 文件位置**
   - 确保 `backend/docker/.env` 文件存在
   - 如果修改根目录的 `.env`，需要重新复制到 `backend/docker/`

2. **环境变量优先级**
   - `env_file` 中的变量会被 `environment` 中的变量覆盖
   - 如果同时使用 `${ZHIPU_API_KEY}` 和 `env_file`，`environment` 中的值优先

3. **安全建议**
   - `.env` 文件包含敏感信息，不要提交到版本控制
   - 确保 `.env` 文件权限正确（建议 600）
   - 生产环境建议使用密钥管理服务

4. **重启容器**
   - 修改环境变量后必须重启容器才能生效
   - 使用 `docker compose restart api` 快速重启

## 修复日期

2024-01-12
