#!/bin/bash
# 测试cron定时任务脚本

set -e

echo "=========================================="
echo "RSS缓存定时任务测试"
echo "=========================================="
echo ""

# 检查容器是否运行
CONTAINER_NAME="ai_agent_api"
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "错误: 容器 $CONTAINER_NAME 未运行"
    echo "请先启动容器: docker compose up -d"
    exit 1
fi

echo "1. 检查cron服务状态..."
docker exec $CONTAINER_NAME pgrep cron > /dev/null && echo "✓ Cron服务正在运行" || echo "✗ Cron服务未运行"

echo ""
echo "2. 查看crontab配置..."
docker exec $CONTAINER_NAME crontab -l || echo "✗ 无法读取crontab"

echo ""
echo "3. 手动执行一次缓存生成任务（测试）..."
docker exec $CONTAINER_NAME python3 /app/tools/rss_cache_job.py

echo ""
echo "4. 检查缓存文件..."
if docker exec $CONTAINER_NAME test -f /app/data/rss_cache.json; then
    echo "✓ 缓存文件存在"
    FILE_SIZE=$(docker exec $CONTAINER_NAME stat -c%s /app/data/rss_cache.json)
    echo "  文件大小: $FILE_SIZE 字节"
    echo "  生成时间:"
    docker exec $CONTAINER_NAME python3 -c "import json; f=open('/app/data/rss_cache.json'); d=json.load(f); print('  ', d['summary']['generated_at'])" 2>/dev/null || echo "  无法读取生成时间"
else
    echo "✗ 缓存文件不存在"
fi

echo ""
echo "5. 查看最近的cron日志..."
echo "最近10行日志:"
docker exec $CONTAINER_NAME tail -n 10 /app/logs/rss_cache.log 2>/dev/null || echo "  日志文件为空或不存在"

echo ""
echo "6. 测试cron任务执行（等待1分钟查看是否执行）..."
echo "   注意: 如果当前时间接近01:00，cron任务可能会立即执行"
echo "   否则需要等待到01:00才会执行"
echo ""
echo "=========================================="
echo "测试完成！"
echo "=========================================="
echo ""
echo "提示:"
echo "- 查看实时日志: docker exec $CONTAINER_NAME tail -f /app/logs/rss_cache.log"
echo "- 手动触发: docker exec $CONTAINER_NAME python3 /app/tools/rss_cache_job.py"
echo "- 查看cron状态: docker exec $CONTAINER_NAME pgrep cron"
