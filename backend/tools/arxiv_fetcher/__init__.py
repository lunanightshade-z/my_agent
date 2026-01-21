"""
ArXiv Fetcher - ArXiv论文检索工具

这个包提供了基于关键词检索ArXiv论文的功能，支持获取论文的标题、摘要、作者等信息。

主要功能：
- 基于关键词检索ArXiv论文
- 支持指定检索数量
- 自动解析论文元数据（标题、摘要、作者、发布日期等）
- 统一的数据结构和JSON输出
- 完善的错误处理和日志记录

基本使用：
```python
from backend.tools.arxiv_fetcher import ArxivFetcher

# 检索论文
fetcher = ArxivFetcher()
papers = fetcher.search("machine learning", max_results=10)
for paper in papers:
    print(f"{paper.title} - {paper.authors}")
```
"""

from .fetcher import ArxivFetcher
from .models import ArxivPaper, ArxivSearchResult

__version__ = "1.0.0"

__all__ = [
    'ArxivFetcher',
    'ArxivPaper',
    'ArxivSearchResult',
]
