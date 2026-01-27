# RSS缓存任务说明文档

## 概述

RSS缓存任务用于每日定时抓取RSS新闻并保存为JSON缓存文件，以加速智能体工具调用，避免实时抓取耗时。

## 缓存文件位置

- **路径**: `backend/data/rss_cache.json`
- **格式**: JSON格式，UTF-8编码
- **内容**: 包含200条最新RSS文章

## 数据结构

缓存文件包含以下结构：

```json
{
  "summary": {
    "total_sources": 11,
    "successful_sources": 9,
    "failed_sources": 2,
    "total_articles_fetched": 150,
    "cached_articles": 200,
    "fetch_time": "2026-01-23T01:00:00",
    "generated_at": "2026-01-23T01:00:15.123456"
  },
  "articles": [
    {
      "title": "文章标题",
      "link": "https://example.com/article",
      "description": "文章描述",
      "pub_date": "Mon, 23 Jan 2026 00:00:00 +0800",
      "author": "作者名",
      "source": "来源名称",
      "categories": ["分类1", "分类2"]
    }
  ]
}
```

### 字段说明

- **summary**: 汇总信息
  - `total_sources`: RSS源总数
  - `successful_sources`: 成功获取的源数量
  - `failed_sources`: 失败的源数量
  - `total_articles_fetched`: 抓取到的总文章数
  - `cached_articles`: 缓存保存的文章数（固定200条）
  - `fetch_time`: RSS抓取时间
  - `generated_at`: 缓存生成时间

- **articles**: 文章列表（按发布时间倒序，最新的在前）
  - `title`: 文章标题
  - `link`: 文章链接
  - `description`: 文章描述/摘要
  - `pub_date`: 发布日期（RSS格式字符串）
  - `author`: 作者（可选）
  - `source`: RSS源名称
  - `categories`: 分类标签列表

## 定时任务配置

### Cron配置示例

每日01:00执行缓存任务：

```bash
# 编辑crontab
crontab -e

# 添加以下行（请根据实际项目路径修改）
0 1 * * * cd /home/superdev/my_agent && /usr/bin/python3 backend/tools/rss_cache_job.py >> /home/superdev/my_agent/logs/rss_cache.log 2>&1
```

### 手动执行

如果需要手动生成或更新缓存：

```bash
# 在项目根目录执行
cd /home/superdev/my_agent
python backend/tools/rss_cache_job.py
```

### 执行环境要求

- Python 3.7+
- 已安装项目依赖（requirements.txt）
- 网络连接正常（用于抓取RSS源）

## 工具使用说明

智能体的RSS工具已切换为从缓存读取：

1. **fetch_rss_news**: 从缓存读取RSS新闻
2. **filter_rss_news**: 从缓存中筛选相关新闻
3. **search_rss_by_keywords**: 从缓存中搜索关键词

如果缓存文件不存在，工具会返回错误提示，需要先运行定时任务生成缓存。

## 故障排查

### 缓存文件不存在

**错误**: `RSS缓存文件不存在`

**解决**: 运行缓存生成脚本
```bash
python backend/tools/rss_cache_job.py
```

### JSON解析失败

**错误**: `缓存文件JSON解析失败`

**解决**: 删除损坏的缓存文件，重新运行生成脚本
```bash
rm backend/data/rss_cache.json
python backend/tools/rss_cache_job.py
```

### 定时任务未执行

**检查**:
1. 确认cron服务运行中: `systemctl status cron` (Ubuntu/Debian) 或 `systemctl status crond` (CentOS/RHEL)
2. 检查cron日志: `grep CRON /var/log/syslog` (Ubuntu/Debian)
3. 确认Python路径正确
4. 确认项目路径正确

## 性能优化

- 缓存文件固定保存200条最新文章，避免文件过大
- 文章按发布时间排序，确保最新内容优先
- 智能体工具直接从缓存读取，响应速度大幅提升

## 更新频率

- **默认**: 每日01:00自动更新
- **可调整**: 修改cron配置中的时间设置

## 注意事项

1. 首次使用前需要手动运行一次生成缓存
2. 缓存文件会在定时任务执行时自动更新
3. 如果RSS源部分失败，只要成功获取部分文章即可正常使用
4. 缓存文件路径为 `backend/data/rss_cache.json`，确保该目录有写入权限
