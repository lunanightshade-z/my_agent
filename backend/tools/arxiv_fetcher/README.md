# ArXiv Fetcher - ArXiv论文检索工具

## 📋 项目概述

这是一个简单易用的ArXiv论文检索工具，支持基于关键词检索任意数量的论文，并获取论文的标题、摘要、作者、分类等详细信息。

## ✨ 核心特性

- ✅ **关键词检索**: 支持在所有字段或仅在标题中搜索
- ✅ **灵活数量**: 支持检索任意数量的论文（1-30000篇）
- ✅ **完整信息**: 获取论文标题、摘要、作者、发布日期、分类、PDF链接等
- ✅ **多种排序**: 支持按相关性、更新时间、提交时间排序
- ✅ **JSON导出**: 支持将结果导出为JSON格式
- ✅ **错误处理**: 完善的异常处理和参数验证
- ✅ **日志记录**: 详细的日志输出，便于调试

## 📦 依赖

项目已包含以下依赖：
- `requests`: HTTP请求库

无需额外安装依赖。

## 🚀 快速开始

### 基本使用

```python
from backend.tools.arxiv_fetcher import ArxivFetcher

# 创建检索器
fetcher = ArxivFetcher()

# 搜索论文（在所有字段中搜索）
result = fetcher.search_by_keywords("machine learning", max_results=10)

# 遍历结果
for paper in result.papers:
    print(f"标题: {paper.title}")
    print(f"作者: {', '.join(paper.authors)}")
    print(f"摘要: {paper.summary[:200]}...")
    print(f"链接: {paper.arxiv_url}")
    print("-" * 80)
```

### 高级查询

```python
# 只在标题中搜索
result = fetcher.search("ti:transformer", max_results=5)

# 使用ArXiv查询语法
result = fetcher.search("all:deep learning AND cat:cs.LG", max_results=20)

# 按更新时间排序
result = fetcher.search(
    "all:neural network",
    max_results=10,
    sort_by="lastUpdatedDate",
    sort_order="descending"
)
```

### 导出JSON

```python
import json

result = fetcher.search_by_keywords("reinforcement learning", max_results=5)

# 转换为字典
result_dict = result.to_dict()

# 保存到文件
with open("papers.json", "w", encoding="utf-8") as f:
    json.dump(result_dict, f, indent=2, ensure_ascii=False)
```

### 使用上下文管理器

```python
# 自动管理资源
with ArxivFetcher() as fetcher:
    result = fetcher.search_by_keywords("computer vision", max_results=10)
    # 处理结果...
```

## 📖 API文档

### ArxivFetcher

#### `search(query, max_results=10, sort_by="relevance", sort_order="descending")`

搜索ArXiv论文。

**参数:**
- `query` (str): 搜索查询（支持ArXiv查询语法）
- `max_results` (int): 最大返回结果数（1-30000，默认10）
- `sort_by` (str): 排序方式，可选值：
  - `"relevance"`: 按相关性排序（默认）
  - `"lastUpdatedDate"`: 按更新时间排序
  - `"submittedDate"`: 按提交时间排序
- `sort_order` (str): 排序顺序，`"ascending"` 或 `"descending"`（默认）

**返回:** `ArxivSearchResult` 对象

**示例:**
```python
result = fetcher.search("all:machine learning", max_results=20)
```

#### `search_by_keywords(keywords, max_results=10, search_all_fields=True)`

通过关键词搜索论文（便捷方法）。

**参数:**
- `keywords` (str): 搜索关键词
- `max_results` (int): 最大返回结果数
- `search_all_fields` (bool): 是否在所有字段中搜索
  - `True`: 在所有字段中搜索（`all:keywords`）
  - `False`: 仅在标题中搜索（`ti:keywords`）

**返回:** `ArxivSearchResult` 对象

**示例:**
```python
# 在所有字段中搜索
result = fetcher.search_by_keywords("transformer", max_results=10)

# 仅在标题中搜索
result = fetcher.search_by_keywords("transformer", max_results=10, search_all_fields=False)
```

### ArxivPaper

论文数据模型，包含以下属性：

- `arxiv_id` (str): ArXiv ID
- `title` (str): 论文标题
- `summary` (str): 论文摘要
- `authors` (List[str]): 作者列表
- `published` (str): 发布日期（ISO格式）
- `updated` (str): 更新日期（ISO格式）
- `pdf_url` (str): PDF下载链接
- `arxiv_url` (str): ArXiv页面链接
- `primary_category` (str): 主要分类
- `categories` (List[str]): 所有分类列表
- `comment` (str): 评论/备注

**方法:**
- `to_dict()`: 转换为字典格式

### ArxivSearchResult

检索结果模型，包含以下属性：

- `query` (str): 查询关键词
- `total_results` (int): 总结果数
- `papers` (List[ArxivPaper]): 论文列表
- `search_time` (str): 检索时间（ISO格式）

**方法:**
- `to_dict()`: 转换为字典格式
- `get_papers()`: 获取所有论文列表

## 🔍 ArXiv查询语法

ArXiv支持丰富的查询语法，以下是一些常用示例：

- `all:machine learning`: 在所有字段中搜索"machine learning"
- `ti:transformer`: 在标题中搜索"transformer"
- `au:Smith`: 搜索作者名包含"Smith"的论文
- `cat:cs.LG`: 搜索计算机科学-机器学习分类的论文
- `all:deep learning AND cat:cs.CV`: 搜索包含"deep learning"且属于计算机视觉分类的论文
- `all:neural network OR all:deep learning`: 搜索包含"neural network"或"deep learning"的论文

更多查询语法请参考 [ArXiv API文档](https://arxiv.org/help/api/user-manual#query_details)。

## 📝 使用示例

### 示例1: 检索最新论文

```python
from backend.tools.arxiv_fetcher import ArxivFetcher

fetcher = ArxivFetcher()

# 检索最新的10篇机器学习论文
result = fetcher.search(
    "all:machine learning",
    max_results=10,
    sort_by="submittedDate",
    sort_order="descending"
)

for paper in result.papers:
    print(f"{paper.published}: {paper.title}")
```

### 示例2: 检索特定作者的论文

```python
result = fetcher.search("au:Yann LeCun", max_results=5)

for paper in result.papers:
    print(f"{paper.title}")
    print(f"作者: {', '.join(paper.authors)}")
```

### 示例3: 批量检索并保存

```python
import json
from pathlib import Path

keywords = ["transformer", "BERT", "GPT"]
all_papers = []

fetcher = ArxivFetcher()

for keyword in keywords:
    result = fetcher.search_by_keywords(keyword, max_results=20)
    all_papers.extend(result.papers)
    print(f"检索 '{keyword}': {len(result.papers)} 篇论文")

# 保存所有论文
output_file = Path("all_papers.json")
with open(output_file, "w", encoding="utf-8") as f:
    papers_dict = [paper.to_dict() for paper in all_papers]
    json.dump(papers_dict, f, indent=2, ensure_ascii=False)

print(f"\n共检索到 {len(all_papers)} 篇论文，已保存到 {output_file}")
```

## 🧪 测试

运行测试脚本：

```bash
cd backend
python3 tests/test_arxiv_fetcher.py
```

测试脚本包含以下测试：
1. 基本关键词搜索
2. 自定义查询语法
3. 检索大量论文
4. JSON导出
5. 错误处理

## ⚠️ 注意事项

1. **API限制**: ArXiv API对请求频率有限制，建议在请求之间添加适当延迟
2. **网络连接**: 需要能够访问 `http://export.arxiv.org`
3. **结果数量**: 单次查询最多返回30000条结果
4. **超时设置**: 默认超时时间为30秒，可以通过构造函数参数调整

## 📄 许可证

本项目遵循项目主许可证。
