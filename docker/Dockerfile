FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 配置阿里云 Debian 镜像源（加速 apt-get）
RUN sed -i 's/deb.debian.org/mirrors.aliyun.com/g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's|security.debian.org/debian-security|mirrors.aliyun.com/debian-security|g' /etc/apt/sources.list.d/debian.sources || \
    (echo "deb https://mirrors.aliyun.com/debian/ bookworm main" > /etc/apt/sources.list && \
     echo "deb https://mirrors.aliyun.com/debian/ bookworm-updates main" >> /etc/apt/sources.list && \
     echo "deb https://mirrors.aliyun.com/debian-security/ bookworm-security main" >> /etc/apt/sources.list)

# 安装系统依赖（提前执行，利用Docker缓存）
RUN apt-get update && \
    apt-get install -y --no-install-recommends cron && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 配置国内pip镜像源加速
RUN pip config set global.index-url https://mirrors.aliyun.com/pypi/simple && \
    pip config set global.extra-index-url "https://pypi.tuna.tsinghua.edu.cn/simple" && \
    pip config set install.trusted-host "mirrors.aliyun.com pypi.tuna.tsinghua.edu.cn" && \
    pip install --upgrade pip setuptools wheel

# 复制依赖文件
COPY backend/requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 创建data目录用于存储缓存和数据库（提前创建，利用缓存）
RUN mkdir -p /app/data /app/logs

# 复制应用代码（放在最后，代码变更时只重建这一层）
COPY backend/app/ ./app/
COPY backend/agents/ ./agents/
COPY backend/tools/ ./tools/

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
