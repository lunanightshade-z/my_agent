# Docker 部署说明

## 快速开始

### 1. 准备环境变量

在 `backend` 目录创建 `.env` 文件：

```env
ZHIPU_API_KEY=your_api_key_here
```

### 2. 构建并启动服务

```bash
cd backend/docker
docker-compose up -d
```

### 3. 查看服务状态

```bash
docker-compose ps
docker-compose logs -f api
```

### 4. 停止服务

```bash
docker-compose down
```

## 服务说明

### API 服务
- 端口：8000
- 健康检查：http://localhost:8000/health
- API 文档：http://localhost:8000/docs

### Redis 服务（可选）
- 端口：6379
- 用于分布式缓存

### Nginx 服务（可选）
- 端口：80
- 反向代理和负载均衡

## 数据持久化

数据库文件和日志将保存在以下目录：
- `backend/docker/data/` - 数据库文件
- `backend/docker/logs/` - 应用日志
- Redis 数据存储在 Docker 卷中

## 环境变量配置

可以通过修改 `docker-compose.yml` 中的 `environment` 部分来配置应用：

```yaml
environment:
  - ENVIRONMENT=production
  - LOG_LEVEL=INFO
  - CACHE_ENABLED=true
  - CACHE_TYPE=redis  # 使用 Redis 缓存
  - REDIS_URL=redis://redis:6379
```

## 生产环境建议

1. 使用 HTTPS（配置 SSL 证书）
2. 启用 Redis 作为分布式缓存
3. 配置日志收集系统（如 ELK）
4. 设置监控和告警
5. 定期备份数据库

## 故障排查

### 查看日志
```bash
docker-compose logs -f api
```

### 进入容器
```bash
docker-compose exec api bash
```

### 重启服务
```bash
docker-compose restart api
```
