# RSS缓存定时任务配置文档

## 实施日期
2026-01-23

## 概述

本文档说明如何在Docker环境中配置RSS缓存每日自动生成任务。

## 配置方案

采用**Docker容器内cron**方案，在容器启动时同时启动cron服务和uvicorn应用。

## 文件结构

```
my_agent/
├── docker/
│   ├── Dockerfile          # 已更新：安装cron，配置定时任务
│   ├── crontab             # 新增：cron任务配置
│   └── start.sh            # 新增：启动脚本（同时启动cron和uvicorn）
├── scripts/
│   └── test_cron.sh        # 新增：测试脚本
└── docs/backend/
    └── rss_cache_cron_setup.md  # 本文档
```

## 配置详情

### 1. Crontab配置 (`docker/crontab`)

```bash
# RSS缓存生成任务 - 每日01:00执行
# 时区: Asia/Shanghai
0 1 * * * /usr/local/bin/python3 /app/tools/rss_cache_job.py >> /app/logs/rss_cache.log 2>&1
```

**说明**:
- 执行时间: 每日01:00（北京时间）
- Python路径: `/usr/local/bin/python3`（Docker镜像中的Python路径）
- 脚本路径: `/app/tools/rss_cache_job.py`
- 日志输出: `/app/logs/rss_cache.log`

### 2. Dockerfile更新

**主要变更**:
1. 安装cron包
2. 复制crontab文件到 `/etc/cron.d/rss-cache`
3. 复制启动脚本到 `/app/start.sh`
4. 设置文件权限
5. 应用crontab配置
6. 修改CMD使用启动脚本

### 3. 启动脚本 (`docker/start.sh`)

**功能**:
- 确保日志目录和文件存在
- 启动cron服务（后台）
- 验证cron服务状态
- 启动uvicorn应用（前台，保持容器运行）

## 部署步骤

### 1. 重新构建镜像

```bash
cd /home/superdev/my_agent
docker compose build api
```

### 2. 重启容器

```bash
docker compose up -d api
```

### 3. 验证配置

```bash
# 运行测试脚本
./scripts/test_cron.sh

# 或手动检查
docker exec ai_agent_api crontab -l
docker exec ai_agent_api pgrep cron
```

## 测试与验证

### 测试脚本

运行 `scripts/test_cron.sh` 脚本会自动检查：
1. Cron服务状态
2. Crontab配置
3. 手动执行一次任务（测试）
4. 缓存文件状态
5. 日志内容

### 手动测试

```bash
# 1. 检查cron服务
docker exec ai_agent_api pgrep cron

# 2. 查看crontab
docker exec ai_agent_api crontab -l

# 3. 手动执行任务
docker exec ai_agent_api python3 /app/tools/rss_cache_job.py

# 4. 查看日志
docker exec ai_agent_api tail -f /app/logs/rss_cache.log

# 5. 检查缓存文件
docker exec ai_agent_api ls -lh /app/data/rss_cache.json
```

### 验证定时执行

**方法1: 查看日志时间戳**
```bash
docker exec ai_agent_api tail -n 20 /app/logs/rss_cache.log
```

**方法2: 检查缓存文件修改时间**
```bash
docker exec ai_agent_api stat /app/data/rss_cache.json
```

**方法3: 临时修改crontab测试**
```bash
# 进入容器
docker exec -it ai_agent_api bash

# 编辑crontab（设置为每分钟执行一次用于测试）
crontab -e
# 修改为: * * * * * /usr/local/bin/python3 /app/tools/rss_cache_job.py >> /app/logs/rss_cache.log 2>&1

# 等待1分钟后查看日志
tail -f /app/logs/rss_cache.log

# 测试完成后恢复原配置
```

## 故障排查

### Cron服务未启动

**症状**: `pgrep cron` 无输出

**解决**:
```bash
# 进入容器检查
docker exec -it ai_agent_api bash
cron
pgrep cron
```

### Crontab配置丢失

**症状**: `crontab -l` 无输出或报错

**解决**:
```bash
docker exec ai_agent_api crontab /etc/cron.d/rss-cache
docker exec ai_agent_api crontab -l
```

### 任务未执行

**检查清单**:
1. Cron服务是否运行: `docker exec ai_agent_api pgrep cron`
2. Crontab是否正确: `docker exec ai_agent_api crontab -l`
3. 日志文件权限: `docker exec ai_agent_api ls -l /app/logs/rss_cache.log`
4. Python路径是否正确: `docker exec ai_agent_api which python3`
5. 脚本路径是否存在: `docker exec ai_agent_api ls -l /app/tools/rss_cache_job.py`

### 日志文件权限问题

**症状**: 日志文件无法写入

**解决**:
```bash
docker exec ai_agent_api chmod 666 /app/logs/rss_cache.log
```

### 时区问题

**症状**: 任务执行时间不对

**检查**:
```bash
docker exec ai_agent_api date
docker exec ai_agent_api cat /etc/timezone
```

**解决**: 确保docker-compose.yml中设置了 `TZ=Asia/Shanghai`

## 修改执行时间

如需修改执行时间，编辑 `docker/crontab` 文件：

```bash
# 示例：每日02:30执行
30 2 * * * /usr/local/bin/python3 /app/tools/rss_cache_job.py >> /app/logs/rss_cache.log 2>&1

# 示例：每6小时执行一次
0 */6 * * * /usr/local/bin/python3 /app/tools/rss_cache_job.py >> /app/logs/rss_cache.log 2>&1
```

修改后需要重新构建镜像：
```bash
docker compose build api
docker compose up -d api
```

## Cron表达式说明

格式: `分钟 小时 日 月 星期 命令`

示例:
- `0 1 * * *` - 每天01:00
- `0 */6 * * *` - 每6小时
- `0 1 * * 1` - 每周一01:00
- `30 2 1 * *` - 每月1号02:30

## 监控建议

1. **日志监控**: 定期检查 `/app/logs/rss_cache.log`
2. **文件监控**: 监控缓存文件修改时间
3. **健康检查**: 可以添加API端点检查缓存文件状态
4. **告警**: 如果缓存文件超过24小时未更新，发送告警

## 注意事项

1. **时区设置**: 确保容器时区为 `Asia/Shanghai`
2. **日志轮转**: 建议配置日志轮转，避免日志文件过大
3. **资源限制**: RSS抓取可能消耗网络和CPU资源，注意容器资源限制
4. **网络连接**: 确保容器可以访问外部RSS源
5. **容器重启**: 容器重启后cron会自动启动（通过start.sh脚本）

## 相关文档

- [RSS缓存任务说明文档](./rss_cache_job.md)
- [RSS缓存Docker修复文档](./rss_cache_docker_fix.md)
- [RSS缓存实施总结](./rss_cache_implementation_summary.md)
