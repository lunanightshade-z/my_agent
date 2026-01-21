# RSS智能筛选服务

## 📋 功能概述

RSS智能筛选服务是一个基于大模型的新闻筛选工具，可以根据用户的自然语言需求，从大量RSS新闻中智能筛选出相关文章。

### 核心特性

- ✅ **智能理解**: 使用大模型理解用户需求，而非简单的关键词匹配
- ✅ **精准筛选**: 基于文章description内容进行深度分析
- ✅ **相关度评分**: 为每篇文章提供1-10分的相关度评分
- ✅ **解释性强**: 给出每篇文章被选中的原因
- ✅ **批量处理**: 支持大规模文章的高效筛选
- ✅ **灵活配置**: 可自定义相关度阈值

## 🏗️ 架构设计

```
rss_filter_service.py
├── FilteredArticle (数据模型)
│   ├── 基础文章信息
│   ├── 相关度评分
│   └── 相关原因
├── FilterResult (结果模型)
│   ├── 用户查询
│   ├── 统计信息
│   └── 筛选结果列表
└── RSSFilterService (核心服务)
    ├── filter_articles()      # 主筛选方法
    ├── _filter_batch()        # 批量筛选
    ├── _build_filter_prompt() # 构建prompt
    └── _parse_filter_response() # 解析结果
```

## 🚀 使用方法

### 方法1: 从已有JSON文件筛选（推荐）

```python
from rss_filter_service import filter_rss_from_file

# 根据用户需求筛选
result = filter_rss_from_file(
    json_file="rss_news_output.json",
    user_query="关于人工智能和AI技术的最新发展",
    min_relevance=6  # 最低相关度阈值
)

# 查看结果
print(f"共找到 {result.matched_articles} 篇相关文章")

for article in result.filtered_articles:
    print(f"{article.title} - 相关度: {article.relevance_score}/10")
    print(f"原因: {article.relevance_reason}")
```

### 方法2: 直接获取并筛选

```python
from rss_filter_service import filter_rss_by_query

# 自动获取RSS并筛选
result = filter_rss_by_query(
    user_query="环境保护和生态建设相关的新闻",
    min_relevance=7
)
```

### 方法3: 使用服务类（更灵活）

```python
from rss_filter_service import RSSFilterService
from rss_fetcher import RSSFetcher

# 获取RSS文章
with RSSFetcher() as fetcher:
    rss_result = fetcher.fetch_all()
    articles = rss_result.get_all_articles()

# 创建筛选服务
service = RSSFilterService(batch_size=10)

# 筛选文章
filter_result = service.filter_articles(
    user_query="科技创新和技术突破",
    articles=articles,
    min_relevance=6
)
```

## 📊 输出数据结构

### FilterResult

```json
{
  "user_query": "用户需求描述",
  "total_articles": 263,
  "matched_articles": 15,
  "filtered_articles": [
    {
      "title": "文章标题",
      "link": "文章链接",
      "description": "文章描述",
      "source": "来源名称",
      "pub_date": "发布日期",
      "relevance_score": 8,
      "relevance_reason": "文章讨论了AI技术在医疗领域的应用"
    }
  ]
}
```

## 🔧 配置参数

### RSSFilterService

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `batch_size` | int | 10 | 每批次发送给大模型的文章数量 |

### filter_articles / filter_rss_from_file

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `user_query` | str | - | 用户需求描述 |
| `min_relevance` | int | 6 | 最低相关度阈值（1-10） |
| `articles` | List | - | 待筛选文章列表 |
| `json_file` | str | - | RSS数据文件路径 |

## 💡 使用示例

### 示例1: 筛选AI相关新闻

```python
result = filter_rss_from_file(
    "rss_news_output.json",
    "关于人工智能、机器学习、深度学习的技术进展",
    min_relevance=7
)

# 按相关度排序，结果已自动排序
for article in result.filtered_articles[:5]:  # 显示前5篇
    print(f"【{article.relevance_score}/10】{article.title}")
```

### 示例2: 筛选特定领域新闻

```python
# 医疗健康
result = filter_rss_from_file(
    "rss_news_output.json",
    "医疗健康、疾病预防、医药研发相关新闻"
)

# 经济金融
result = filter_rss_from_file(
    "rss_news_output.json",
    "经济形势、金融市场、股市动态"
)

# 教育科研
result = filter_rss_from_file(
    "rss_news_output.json",
    "教育改革、科研成果、学术进展"
)
```

### 示例3: 保存筛选结果

```python
import json

result = filter_rss_from_file(
    "rss_news_output.json",
    "环境保护和气候变化",
    min_relevance=6
)

# 保存为JSON
with open("filtered_results.json", "w", encoding="utf-8") as f:
    json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)

print(f"结果已保存，共筛选出 {result.matched_articles} 篇文章")
```

## 🧪 运行测试

```bash
cd backend/tools
python test_rss_filter.py
```

测试脚本会执行多个测试用例：
1. AI和人工智能相关新闻筛选
2. 环境保护和生态建设新闻筛选
3. 科技创新和技术突破新闻筛选
4. 自定义查询测试

## 📈 性能考虑

### 批量处理策略

- 默认每批处理10篇文章
- 可通过`batch_size`参数调整
- 批次越大，调用次数越少，但单次耗时越长

### 推荐配置

| 文章总数 | batch_size | 预计耗时 |
|---------|-----------|---------|
| < 50 | 10 | ~10秒 |
| 50-100 | 10-15 | ~20秒 |
| 100-200 | 15-20 | ~30秒 |
| > 200 | 20 | ~1分钟 |

### 优化建议

1. **缓存结果**: 对于相同查询，缓存筛选结果
2. **预筛选**: 先用关键词快速过滤，再用AI精筛
3. **异步处理**: 对于大量文章，使用异步批处理
4. **调整阈值**: 根据需求调整`min_relevance`，减少无关结果

## 🎯 应用场景

### 1. 个性化新闻推荐

```python
user_interests = "我关注AI技术、环保议题和科技创新"
result = filter_rss_from_file("rss_news_output.json", user_interests)
# 推送给用户
```

### 2. 主题监控

```python
monitoring_topics = [
    "人工智能监管政策",
    "新能源汽车发展",
    "芯片技术突破"
]

for topic in monitoring_topics:
    result = filter_rss_from_file("rss_news_output.json", topic, min_relevance=8)
    if result.matched_articles > 0:
        send_alert(topic, result.filtered_articles)
```

### 3. 舆情分析

```python
# 筛选特定主题的新闻
result = filter_rss_from_file(
    "rss_news_output.json",
    "关于某公司或某产品的报道",
    min_relevance=7
)

# 分析舆情
analyze_sentiment(result.filtered_articles)
```

### 4. 内容聚合

```python
# 为特定用户群聚合内容
tech_news = filter_rss_from_file("rss_news_output.json", "技术开发者关注的内容")
business_news = filter_rss_from_file("rss_news_output.json", "企业管理者关注的内容")

# 生成个性化简报
generate_newsletter(tech_news, business_news)
```

## 🔍 工作原理

### 1. 文章准备
- 提取文章的标题、描述、来源
- 限制description长度为300字，减少token消耗

### 2. Prompt构建
- 将用户需求和文章列表组织成结构化prompt
- 指定输出格式为JSON，包含相关度评分和原因

### 3. 大模型分析
- 调用智谱AI的glm-4-flash模型
- 批量分析文章与需求的相关性
- 返回结构化的筛选结果

### 4. 结果解析
- 解析大模型返回的JSON
- 匹配原始文章信息
- 按相关度排序

### 5. 结果返回
- 返回FilterResult对象
- 包含统计信息和筛选后的文章列表

## 🛠️ 依赖要求

```
requests>=2.31.0
feedparser>=6.0.10
zhipuai  # 智谱AI SDK
python-dotenv
```

## 📝 注意事项

1. **API密钥**: 需要配置`ZHIPU_API_KEY`环境变量
2. **Token消耗**: 每批次会消耗一定的token，注意控制批次大小
3. **准确性**: 筛选结果依赖大模型理解能力，建议设置合理的阈值
4. **异常处理**: 网络问题或API错误会导致该批次筛选失败
5. **描述质量**: 筛选效果取决于RSS源提供的description质量

## 🤝 集成到LLM Agent

```python
def rss_filter_tool(user_query: str) -> str:
    """
    LLM Agent工具函数：RSS新闻筛选
    
    Args:
        user_query: 用户的需求描述
    
    Returns:
        格式化的筛选结果文本
    """
    result = filter_rss_from_file(
        "rss_news_output.json",
        user_query,
        min_relevance=6
    )
    
    if result.matched_articles == 0:
        return f"未找到与「{user_query}」相关的新闻。"
    
    # 格式化输出
    output = f"找到 {result.matched_articles} 篇相关新闻：\n\n"
    
    for i, article in enumerate(result.filtered_articles[:10], 1):
        output += f"{i}. {article.title}\n"
        output += f"   来源：{article.source}\n"
        output += f"   相关度：{article.relevance_score}/10\n"
        output += f"   原因：{article.relevance_reason}\n"
        output += f"   链接：{article.link}\n\n"
    
    return output
```

## 📄 License

MIT License
