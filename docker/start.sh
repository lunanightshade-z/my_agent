#!/bin/bash
# 启动脚本：同时启动uvicorn和cron服务

set -e

# 确保日志目录存在
mkdir -p /app/logs
touch /app/logs/rss_cache.log
chmod 666 /app/logs/rss_cache.log

# 启动cron服务（后台运行）
echo "启动cron服务..."
cron

# 等待cron启动
sleep 1

# 验证cron是否运行
if pgrep cron > /dev/null; then
    echo "✓ Cron服务已启动"
    # 显示crontab内容
    echo "当前crontab配置:"
    crontab -l || echo "无法读取crontab"
else
    echo "✗ Cron服务启动失败"
fi

# 启动uvicorn应用（前台运行，保持容器运行）
echo "启动uvicorn应用..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
