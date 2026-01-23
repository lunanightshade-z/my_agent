FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 配置国内pip镜像源加速
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple && \
    pip config set global.extra-index-url "https://pypi.tuna.tsinghua.edu.cn/simple" && \
    pip config set install.trusted-host "mirrors.aliyun.com pypi.tuna.tsinghua.edu.cn" && \
    pip install --upgrade pip setuptools wheel

# 复制依赖文件
COPY backend/requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY backend/app/ ./app/
COPY backend/agents/ ./agents/
COPY backend/tools/ ./tools/

# 安装cron和必要的工具
RUN apt-get update && \
    apt-get install -y --no-install-recommends cron && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 创建data目录用于存储缓存和数据库
RUN mkdir -p /app/data /app/logs

# 复制crontab文件和启动脚本
COPY docker/crontab /etc/cron.d/rss-cache
COPY docker/start.sh /app/start.sh

# 设置crontab权限（cron要求文件不能有写权限）
RUN chmod 0644 /etc/cron.d/rss-cache && \
    chmod +x /app/start.sh && \
    # 应用crontab
    crontab /etc/cron.d/rss-cache && \
    # 创建日志文件（如果不存在）
    touch /app/logs/rss_cache.log && \
    chmod 666 /app/logs/rss_cache.log

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# 启动命令：使用启动脚本同时启动cron和uvicorn
CMD ["/app/start.sh"]
