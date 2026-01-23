"""
RSS工具集成

将RSS获取和筛选功能集成为智能体工具
从JSON缓存文件读取数据，避免实时抓取耗时
"""
import json
import logging
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

logger = logging.getLogger(__name__)

# 缓存文件路径
# 优先使用环境变量指定的路径，否则使用相对路径
# Docker环境下使用 /app/data，本地开发使用 backend/data
import os
if os.getenv("DOCKER_ENV") or os.path.exists("/app"):
    # Docker环境
    CACHE_FILE_PATH = Path("/app/data/rss_cache.json")
else:
    # 本地开发环境
    CACHE_FILE_PATH = Path(__file__).parent.parent / "data" / "rss_cache.json"

# 确保目录存在
CACHE_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)


def _load_cached_articles() -> Dict[str, Any]:
    """
    从缓存文件加载RSS文章数据
    
    Returns:
        包含缓存数据的字典，格式: {"summary": {...}, "articles": [...]}
        
    Raises:
        FileNotFoundError: 缓存文件不存在
        json.JSONDecodeError: JSON解析失败
    """
    if not CACHE_FILE_PATH.exists():
        raise FileNotFoundError(
            f"RSS缓存文件不存在: {CACHE_FILE_PATH}\n"
            f"请先运行定时任务生成缓存: python backend/tools/rss_cache_job.py"
        )
    
    try:
        with open(CACHE_FILE_PATH, 'r', encoding='utf-8') as f:
            cache_data = json.load(f)
        
        # 验证数据结构
        if "articles" not in cache_data or "summary" not in cache_data:
            raise ValueError("缓存文件格式错误：缺少必要字段")
        
        logger.info(
            f"成功加载缓存: {len(cache_data.get('articles', []))} 篇文章, "
            f"生成时间: {cache_data.get('summary', {}).get('generated_at', 'unknown')}"
        )
        
        return cache_data
        
    except json.JSONDecodeError as e:
        raise ValueError(f"缓存文件JSON解析失败: {e}")


def tool_fetch_rss_news(
    max_articles: Optional[int] = None,
    sources_limit: Optional[int] = None
) -> Dict[str, Any]:
    """
    从缓存获取RSS新闻
    
    Args:
        max_articles: 最大文章数限制（可选）
        sources_limit: 限制RSS源数量（可选，已废弃，保留以兼容接口）
    
    Returns:
        包含新闻摘要和文章列表的字典
    """
    try:
        logger.info(f"从缓存读取RSS新闻, max_articles={max_articles}")
        
        # 从缓存加载数据
        cache_data = _load_cached_articles()
        articles_list = cache_data.get("articles", [])
        summary = cache_data.get("summary", {})
        
        # 限制文章数量
        if max_articles and max_articles > 0:
            articles_list = articles_list[:max_articles]
        
        return {
            "success": True,
            "summary": {
                "total_sources": summary.get("total_sources", 0),
                "successful_sources": summary.get("successful_sources", 0),
                "failed_sources": summary.get("failed_sources", 0),
                "total_articles": len(articles_list),
                "cached_articles": summary.get("cached_articles", 0),
                "generated_at": summary.get("generated_at", "unknown"),
                "status_message": f"已从缓存加载 {len(articles_list)} 篇文章（缓存生成时间: {summary.get('generated_at', 'unknown')}）。"
            },
            "articles": articles_list,
            "note": "数据来自每日更新的缓存，如需最新数据请等待定时任务更新。"
        }
            
    except FileNotFoundError as e:
        logger.error(f"缓存文件不存在: {e}")
        return {
            "success": False,
            "error": str(e),
            "articles": [],
            "hint": "请先运行定时任务生成缓存: python backend/tools/rss_cache_job.py"
        }
    except Exception as e:
        logger.error(f"读取RSS缓存失败: {e}")
        return {
            "success": False,
            "error": str(e),
            "articles": []
        }


def _simple_text_filter(
    articles: List[Dict[str, Any]],
    query: str,
    top_k: int = 10
) -> List[Dict[str, Any]]:
    """
    简单的文本匹配筛选（降级方案）
    
    Args:
        articles: 文章列表
        query: 查询关键词
        top_k: 返回前k篇
    
    Returns:
        筛选后的文章列表
    """
    query_lower = query.lower()
    query_words = query_lower.split()
    
    scored_articles = []
    for article in articles:
        title = article.get("title", "").lower()
        description = article.get("description", "").lower()
        
        # 简单评分：标题匹配权重3，描述匹配权重1
        score = 0
        for word in query_words:
            if word in title:
                score += 3
            if word in description:
                score += 1
        
        if score > 0:
            article_copy = article.copy()
            article_copy["relevance_score"] = min(10, score)
            article_copy["relevance_reason"] = f"包含相关关键词"
            scored_articles.append(article_copy)
    
    # 排序并返回前k篇
    scored_articles.sort(key=lambda x: x["relevance_score"], reverse=True)
    return scored_articles[:top_k]


def tool_filter_rss_news(
    query: str,
    max_articles: int = 50,
    top_k: int = 10
) -> Dict[str, Any]:
    """
    根据查询关键词筛选和排序RSS新闻（从缓存读取）
    
    Args:
        query: 查询关键词或问题
        max_articles: 最大获取文章数（从缓存中筛选的范围）
        top_k: 返回最相关的前k篇文章
    
    Returns:
        包含筛选后文章的字典
    """
    try:
        logger.info(f"开始筛选RSS新闻, query={query}, max_articles={max_articles}, top_k={top_k}")
        
        # 从缓存获取RSS新闻
        rss_result = tool_fetch_rss_news(max_articles=max_articles)
        
        if not rss_result["success"]:
            return rss_result
        
        articles = rss_result["articles"]
        
        if not articles:
            return {
                "success": True,
                "query": query,
                "total_articles": 0,
                "filtered_articles": []
            }
        
        # 使用简单文本匹配筛选
        filtered_articles = _simple_text_filter(articles, query, top_k)
        
        return {
            "success": True,
            "query": query,
            "total_articles": len(articles),
            "filtered_count": len(filtered_articles),
            "filtered_articles": filtered_articles,
            "note": f"已从缓存中的{len(articles)}篇文章筛选出最相关的{len(filtered_articles)}篇，无需重复调用。"
        }
        
    except Exception as e:
        logger.error(f"筛选RSS新闻失败: {e}")
        return {
            "success": False,
            "error": str(e),
            "query": query,
            "filtered_articles": []
        }


def tool_search_rss_by_keywords(
    keywords: List[str],
    max_articles: int = 50
) -> Dict[str, Any]:
    """
    根据关键词列表搜索RSS新闻（简单的文本匹配）
    
    Args:
        keywords: 关键词列表
        max_articles: 最大获取文章数
    
    Returns:
        包含匹配文章的字典
    """
    try:
        logger.info(f"开始搜索RSS新闻, keywords={keywords}, max_articles={max_articles}")
        
        # 获取RSS新闻
        rss_result = tool_fetch_rss_news(max_articles=max_articles)
        
        if not rss_result["success"]:
            return rss_result
        
        articles = rss_result["articles"]
        matched_articles = []
        
        # 简单的关键词匹配
        for article in articles:
            title = article.get("title", "").lower()
            description = article.get("description", "").lower()
            
            # 检查是否包含任一关键词
            if any(keyword.lower() in title or keyword.lower() in description 
                   for keyword in keywords):
                matched_articles.append(article)
        
        return {
            "success": True,
            "keywords": keywords,
            "total_articles": len(articles),
            "matched_count": len(matched_articles),
            "matched_articles": matched_articles
        }
        
    except Exception as e:
        logger.error(f"搜索RSS新闻失败: {e}")
        return {
            "success": False,
            "error": str(e),
            "keywords": keywords,
            "matched_articles": []
        }


# OpenAI格式的工具定义
RSS_TOOLS_DEFINITIONS = [
    {
        "name": "fetch_rss_news",
        "description": "从缓存获取最新的RSS新闻。数据每日自动更新，包含200条最新文章。如果缓存不存在，请先运行定时任务生成缓存。",
        "parameters": {
            "type": "object",
            "properties": {
                "max_articles": {
                    "type": "integer",
                    "description": "最大文章数限制，默认获取所有文章。建议范围: 20-100",
                    "minimum": 1,
                    "maximum": 200
                },
                "sources_limit": {
                    "type": "integer", 
                    "description": "限制RSS源数量（可选）",
                    "minimum": 1,
                    "maximum": 20
                }
            },
            "required": []
        },
        "function": tool_fetch_rss_news
    },
    {
        "name": "filter_rss_news",
        "description": "根据用户的查询问题或关键词，从缓存中智能筛选和排序RSS新闻。数据来自每日更新的缓存，一次调用即可完成。如果返回结果较少，说明相关新闻确实不多，无需重复调用。",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "查询关键词或问题，例如: 'AI', '人工智能的最新进展', '科技公司'"
                },
                "max_articles": {
                    "type": "integer",
                    "description": "最大获取文章数，默认50",
                    "default": 50,
                    "minimum": 10,
                    "maximum": 200
                },
                "top_k": {
                    "type": "integer",
                    "description": "返回最相关的前k篇文章，默认10",
                    "default": 10,
                    "minimum": 1,
                    "maximum": 50
                }
            },
            "required": ["query"]
        },
        "function": tool_filter_rss_news
    },
    {
        "name": "search_rss_by_keywords",
        "description": "根据关键词列表从缓存中搜索RSS新闻（简单文本匹配）。适用于精确的关键词搜索场景。数据来自每日更新的缓存。",
        "parameters": {
            "type": "object",
            "properties": {
                "keywords": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "关键词列表，例如: ['AI', '人工智能', '机器学习']"
                },
                "max_articles": {
                    "type": "integer",
                    "description": "最大获取文章数，默认50",
                    "default": 50,
                    "minimum": 10,
                    "maximum": 200
                }
            },
            "required": ["keywords"]
        },
        "function": tool_search_rss_by_keywords
    }
]
