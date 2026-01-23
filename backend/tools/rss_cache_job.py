"""
RSS缓存生成任务

每日定时任务：抓取所有RSS源的最新文章，保存为JSON缓存文件。
用于加速智能体工具调用，避免实时抓取耗时。

使用方法：
    python backend/tools/rss_cache_job.py

Cron配置示例（每日01:00执行）：
    0 1 * * * cd /path/to/project && python backend/tools/rss_cache_job.py
"""
import json
import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from tools.rss_fetcher import RSSFetcher, FetchConfig
from tools.rss_fetcher.models import RSSArticle

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 配置常量
# 优先使用环境变量指定的路径，否则使用相对路径
# Docker环境下使用 /app/data，本地开发使用 backend/data
import os
if os.getenv("DOCKER_ENV") or os.path.exists("/app"):
    # Docker环境
    CACHE_FILE_PATH = Path("/app/data/rss_cache.json")
else:
    # 本地开发环境
    CACHE_FILE_PATH = Path(__file__).parent.parent / "data" / "rss_cache.json"

MAX_ARTICLES = 200  # 固定保存200条最新文章


def parse_pub_date(pub_date_str: str) -> datetime:
    """
    解析发布日期字符串为datetime对象（统一为naive datetime）
    
    Args:
        pub_date_str: 发布日期字符串（RSS格式）
        
    Returns:
        datetime对象（naive，无时区信息），解析失败则返回最旧时间（1970-01-01）
    """
    if not pub_date_str:
        return datetime(1970, 1, 1)
    
    try:
        # 尝试使用email.utils.parsedate_to_datetime解析RFC 2822格式
        from email.utils import parsedate_to_datetime
        dt = parsedate_to_datetime(pub_date_str)
        # 转换为naive datetime（去掉时区信息）
        if dt.tzinfo is not None:
            dt = dt.replace(tzinfo=None)
        return dt
    except (ValueError, TypeError):
        try:
            # 尝试解析ISO格式
            dt = datetime.fromisoformat(pub_date_str.replace('Z', '+00:00'))
            # 转换为naive datetime
            if dt.tzinfo is not None:
                dt = dt.replace(tzinfo=None)
            return dt
        except (ValueError, AttributeError):
            # 解析失败，返回最旧时间（排序时会被排到最后）
            logger.warning(f"无法解析发布日期: {pub_date_str}")
            return datetime(1970, 1, 1)


def sort_articles_by_date(articles: List[RSSArticle]) -> List[RSSArticle]:
    """
    按发布日期排序文章，最新的在前
    
    Args:
        articles: 文章列表
        
    Returns:
        排序后的文章列表
    """
    def get_sort_key(article: RSSArticle) -> datetime:
        """获取排序键"""
        if article.pub_date:
            return parse_pub_date(article.pub_date)
        return datetime(1970, 1, 1)  # 没有日期的排到最后
    
    return sorted(articles, key=get_sort_key, reverse=True)


def generate_cache() -> Dict[str, Any]:
    """
    生成RSS缓存数据
    
    Returns:
        包含缓存数据的字典
    """
    logger.info("开始生成RSS缓存...")
    
    # 配置获取器
    config = FetchConfig(
        max_workers=10,
        timeout=10,
        max_retries=2
    )
    
    # 获取所有RSS源
    with RSSFetcher(config) as fetcher:
        result = fetcher.fetch_all()
        all_articles = result.get_all_articles()
        
        logger.info(
            f"获取完成: 成功 {result.successful_sources}/{result.total_sources} 个源，"
            f"共 {len(all_articles)} 篇文章"
        )
        
        # 按发布日期排序，最新的在前
        sorted_articles = sort_articles_by_date(all_articles)
        
        # 取最新200条
        latest_articles = sorted_articles[:MAX_ARTICLES]
        
        # 转换为字典格式
        articles_list = [article.to_dict() for article in latest_articles]
        
        # 构建缓存数据结构
        cache_data = {
            "summary": {
                "total_sources": result.total_sources,
                "successful_sources": result.successful_sources,
                "failed_sources": result.failed_sources,
                "total_articles_fetched": len(all_articles),
                "cached_articles": len(articles_list),
                "fetch_time": result.fetch_time,
                "generated_at": datetime.now().isoformat()
            },
            "articles": articles_list
        }
        
        logger.info(
            f"缓存生成完成: 从 {len(all_articles)} 篇文章中选取最新 {len(articles_list)} 条"
        )
        
        return cache_data


def save_cache(cache_data: Dict[str, Any], cache_path: Path) -> None:
    """
    保存缓存数据到JSON文件
    
    Args:
        cache_data: 缓存数据字典
        cache_path: 缓存文件路径
    """
    # 确保目录存在
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    
    # 保存到文件
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"缓存已保存到: {cache_path}")


def main():
    """主函数"""
    try:
        # 生成缓存
        cache_data = generate_cache()
        
        # 保存缓存
        save_cache(cache_data, CACHE_FILE_PATH)
        
        logger.info("RSS缓存任务执行成功")
        return 0
        
    except Exception as e:
        logger.error(f"RSS缓存任务执行失败: {e}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
