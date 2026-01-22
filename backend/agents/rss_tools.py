"""
RSS工具集成

将RSS获取和筛选功能集成为智能体工具
"""
import json
import logging
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from tools.rss_fetcher import RSSFetcher, FetchConfig

logger = logging.getLogger(__name__)


def tool_fetch_rss_news(
    max_articles: Optional[int] = None,
    sources_limit: Optional[int] = None
) -> Dict[str, Any]:
    """
    获取RSS新闻
    
    Args:
        max_articles: 最大文章数限制（可选）
        sources_limit: 限制RSS源数量（可选）
    
    Returns:
        包含新闻摘要和文章列表的字典
    """
    try:
        logger.info(f"开始获取RSS新闻, max_articles={max_articles}, sources_limit={sources_limit}")
        
        # 配置获取器
        config = FetchConfig(
            max_workers=10,
            timeout=10,
            max_retries=2
        )
        
        # 获取RSS新闻
        with RSSFetcher(config) as fetcher:
            result = fetcher.fetch_all()
            all_articles = result.get_all_articles()
            
            # 限制文章数量
            if max_articles:
                all_articles = all_articles[:max_articles]
            
            # 转换为字典格式
            articles_list = [article.to_dict() for article in all_articles]
            
            return {
                "success": True,
                "summary": {
                    "total_sources": result.total_sources,
                    "successful_sources": result.successful_sources,
                    "failed_sources": result.failed_sources,
                    "total_articles": len(articles_list),
                    "fetch_time": result.fetch_time,
                    "status_message": f"已成功获取 {result.successful_sources}/{result.total_sources} 个RSS源，共 {len(articles_list)} 篇文章。部分源失败是正常的网络现象，当前结果已可用于分析。"
                },
                "articles": articles_list,
                "note": "这是最终获取结果，无需重复调用。部分RSS源失败是正常现象。"
            }
            
    except Exception as e:
        logger.error(f"获取RSS新闻失败: {e}")
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
    根据查询关键词筛选和排序RSS新闻
    
    Args:
        query: 查询关键词或问题
        max_articles: 最大获取文章数
        top_k: 返回最相关的前k篇文章
    
    Returns:
        包含筛选后文章的字典
    """
    try:
        logger.info(f"开始筛选RSS新闻, query={query}, max_articles={max_articles}, top_k={top_k}")
        
        # 先获取RSS新闻
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
            "note": f"已从{len(articles)}篇文章中筛选出最相关的{len(filtered_articles)}篇，无需重复调用。"
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
        "description": "获取最新的RSS新闻。支持从多个新闻源获取最新资讯。注意：由于网络原因，部分RSS源可能失败，这是正常现象。只要成功获取部分文章即可使用，无需重复调用。",
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
        "description": "根据用户的查询问题或关键词，智能筛选和排序RSS新闻。该工具会先获取RSS，然后进行筛选，一次调用即可完成。如果返回结果较少，说明相关新闻确实不多，无需重复调用。",
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
        "description": "根据关键词列表搜索RSS新闻（简单文本匹配）。适用于精确的关键词搜索场景。",
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
