# RSS Fetcher - RSS新闻多线程获取工具

## 📋 项目概述

这是一个高性能的RSS新闻获取工具，支持多线程并发获取多个RSS源，自动解析并汇总所有数据到统一的JSON格式。

## 🏗️ 项目结构

```
backend/tools/
├── rss_fetcher/              # RSS获取核心包
│   ├── __init__.py          # 包初始化，导出主要接口
│   ├── models.py            # 数据模型定义（文章、结果、汇总）
│   ├── config.py            # RSS源配置和全局参数
│   ├── parser.py            # RSS/Atom解析器
│   ├── fetcher.py           # 多线程获取核心逻辑
│   └── requirements.txt     # 依赖说明
└── get_rss_news.py          # 使用示例和快速入口
```

## ✨ 核心特性

- ✅ **多线程并发**: 使用线程池并发获取，大幅提升速度
- ✅ **自动解析**: 支持RSS和Atom格式，自动提取标题、链接、描述等信息
- ✅ **错误处理**: 完善的异常处理和重试机制
- ✅ **数据汇总**: 统一的JSON输出格式，便于后续处理
- ✅ **日志记录**: 详细的日志输出，便于调试和监控
- ✅ **灵活配置**: 支持自定义线程数、超时时间、重试次数等
- ✅ **上下文管理**: 自动资源管理，防止资源泄露

## 📦 依赖安装

```bash
pip install requests feedparser
```

## 🚀 快速开始

### 基本使用

```python
from backend.tools.rss_fetcher import RSSFetcher

# 使用默认配置获取所有RSS源
with RSSFetcher() as fetcher:
    result = fetcher.fetch_all()
    data = result.to_dict()
    print(f"共获取 {data['summary']['total_articles']} 篇文章")
```

### 保存到JSON文件

```python
import json
from backend.tools.rss_fetcher import RSSFetcher

with RSSFetcher() as fetcher:
    result = fetcher.fetch_all()
    
    # 保存完整结果
    with open('rss_news.json', 'w', encoding='utf-8') as f:
        json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)
```

### 自定义配置

```python
from backend.tools.rss_fetcher import RSSFetcher, FetchConfig

# 自定义配置
config = FetchConfig(
    max_workers=15,      # 增加并发线程数
    timeout=15,          # 延长超时时间
    max_retries=3,       # 增加重试次数
    retry_delay=2.0      # 重试延迟
)

with RSSFetcher(config) as fetcher:
    result = fetcher.fetch_all()
```

### 获取自定义URL列表

```python
from backend.tools.rss_fetcher import RSSFetcher

custom_urls = [
    "https://www.geekpark.net/rss",
    "https://sspai.com/feed",
    "https://techcrunch.com/category/artificial-intelligence/feed/"
]

with RSSFetcher() as fetcher:
    result = fetcher.fetch_urls(custom_urls)
    data = result.to_dict()
```

### 获取所有文章的扁平列表

```python
from backend.tools.rss_fetcher import RSSFetcher

with RSSFetcher() as fetcher:
    result = fetcher.fetch_all()
    
    # 获取所有成功获取的文章
    all_articles = result.get_all_articles()
    
    # 转换为字典列表
    articles_data = [article.to_dict() for article in all_articles]
    print(f"共 {len(articles_data)} 篇文章")
```

## 📊 输出数据结构

### 完整汇总结果

```json
{
  "summary": {
    "total_sources": 11,
    "successful_sources": 10,
    "failed_sources": 1,
    "total_articles": 245,
    "fetch_time": "2026-01-09T14:30:00.123456"
  },
  "results": [
    {
      "url": "https://www.geekpark.net/rss",
      "success": true,
      "article_count": 20,
      "fetch_time": "2026-01-09T14:30:00.123456",
      "error": null,
      "articles": [
        {
          "title": "文章标题",
          "link": "https://example.com/article",
          "description": "文章摘要或描述",
          "pub_date": "2026-01-09T10:00:00",
          "author": "作者名",
          "source": "极客公园",
          "categories": ["科技", "AI"]
        }
      ]
    }
  ]
}
```

### 单篇文章结构

```json
{
  "title": "文章标题",
  "link": "https://example.com/article",
  "description": "文章摘要或描述",
  "pub_date": "2026-01-09T10:00:00",
  "author": "作者名",
  "source": "极客公园",
  "categories": ["科技", "AI"]
}
```

## 🔧 配置说明

### FetchConfig 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `max_workers` | int | 10 | 最大并发线程数 |
| `timeout` | int | 10 | 请求超时时间（秒） |
| `max_retries` | int | 2 | 最大重试次数 |
| `retry_delay` | float | 1.0 | 重试延迟时间（秒） |
| `user_agent` | str | "Mozilla/5.0..." | User-Agent字符串 |

### 添加新的RSS源

编辑 `rss_fetcher/config.py` 文件中的 `RSS_SOURCES` 列表：

```python
RSS_SOURCES: List[Dict[str, str]] = [
    {
        "name": "你的RSS源名称",
        "url": "https://example.com/rss"
    },
    # ... 其他源
]
```

## 📝 使用示例

运行示例脚本：

```bash
cd backend/tools
python get_rss_news.py
```

这将：
1. 获取所有配置的RSS源
2. 显示获取进度和结果摘要
3. 保存完整结果到 `rss_news_output.json`

## 🎯 设计原则

### 1. 模块化设计
- **models.py**: 数据模型层，定义清晰的数据结构
- **config.py**: 配置层，集中管理RSS源和参数
- **parser.py**: 解析层，专注RSS内容解析
- **fetcher.py**: 核心层，实现并发获取和汇总逻辑

### 2. 单一职责
每个模块职责明确：
- Parser只负责解析
- Fetcher只负责获取和协调
- Models只负责数据结构定义

### 3. 错误处理
- 网络异常自动重试
- 解析错误不影响其他源
- 详细的错误信息记录

### 4. 性能优化
- 线程池并发，充分利用I/O等待时间
- Session复用，减少连接开销
- 合理的超时和重试配置

### 5. 可扩展性
- 易于添加新的RSS源
- 配置参数灵活调整
- 支持自定义URL列表

## 🔍 日志输出

工具提供详细的日志信息：

```
2026-01-09 14:30:00 - INFO - 开始并发获取 11 个RSS源
2026-01-09 14:30:01 - INFO - 开始获取: 极客公园 (https://www.geekpark.net/rss)
2026-01-09 14:30:02 - INFO - 成功解析 20 篇文章 from 极客公园
2026-01-09 14:30:02 - INFO - 成功获取: 极客公园, 文章数: 20
2026-01-09 14:30:05 - WARNING - BBC中文 第1次尝试超时
2026-01-09 14:30:10 - INFO - 获取完成: 成功 10/11, 共 245 篇文章
```

## 🛠️ 扩展建议

### 作为LLM Agent工具使用

可以将此工具集成到你的LLM Agent中：

```python
def get_rss_news_tool():
    """LLM Agent调用的RSS新闻获取工具"""
    from backend.tools.rss_fetcher import RSSFetcher
    
    with RSSFetcher() as fetcher:
        result = fetcher.fetch_all()
        # 返回简化的文章列表供LLM处理
        articles = result.get_all_articles()
        return [
            {
                "title": a.title,
                "source": a.source,
                "link": a.link,
                "summary": a.description[:200]  # 截取摘要
            }
            for a in articles[:50]  # 限制数量
        ]
```

## 📄 License

MIT License
