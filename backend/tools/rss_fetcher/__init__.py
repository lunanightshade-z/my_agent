"""
RSS Fetcher - RSS新闻多线程获取工具

这个包提供了并发获取和解析多个RSS源的功能，支持错误处理、重试机制和结果汇总。

主要功能：
- 多线程并发获取多个RSS源
- 自动解析RSS/Atom格式
- 统一的数据结构和JSON输出
- 完善的错误处理和日志记录

基本使用：
```python
from backend.tools.rss_fetcher import RSSFetcher, FetchConfig

# 使用默认配置
with RSSFetcher() as fetcher:
    result = fetcher.fetch_all()
    json_data = result.to_dict()
    print(json_data)

# 自定义配置
config = FetchConfig(max_workers=5, timeout=15)
with RSSFetcher(config) as fetcher:
    result = fetcher.fetch_all()
```
"""

from .fetcher import RSSFetcher
from .config import FetchConfig, RSS_SOURCES, get_rss_urls, get_rss_sources
from .models import RSSArticle, RSSFetchResult, RSSAggregatedResult
from .parser import RSSParser

__version__ = "1.0.0"

__all__ = [
    'RSSFetcher',
    'FetchConfig',
    'RSS_SOURCES',
    'get_rss_urls',
    'get_rss_sources',
    'RSSArticle',
    'RSSFetchResult',
    'RSSAggregatedResult',
    'RSSParser'
]
