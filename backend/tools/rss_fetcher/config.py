"""
RSS源配置管理

集中管理RSS源URL和获取配置参数。
"""
from typing import List, Dict
from dataclasses import dataclass


@dataclass
class FetchConfig:
    """RSS获取配置"""
    
    max_workers: int = 10  # 最大并发线程数
    timeout: int = 10  # 请求超时时间(秒)
    max_retries: int = 2  # 最大重试次数
    retry_delay: float = 1.0  # 重试延迟(秒)
    user_agent: str = "Mozilla/5.0 (RSS Fetcher/1.0)"  # User-Agent


# RSS源配置，包含URL和友好名称
RSS_SOURCES: List[Dict[str, str]] = [
    {
        "name": "FT中文网",
        "url": "http://www.ftchinese.com/rss/feed"
    },
    {
        "name": "BBC中文",
        "url": "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml"
    },
    {
        "name": "中国新闻网",
        "url": "https://www.chinanews.com.cn/rss/scroll-news.xml"
    },
    {
        "name": "人民网-政治",
        "url": "http://www.people.com.cn/rss/politics.xml"
    },
    {
        "name": "极客公园",
        "url": "https://www.geekpark.net/rss"
    },
    {
        "name": "少数派",
        "url": "https://sspai.com/feed"
    },
    {
        "name": "散花每日新闻",
        "url": "https://sanhua.himrr.com/daily-news/feed"
    },
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/"
    },
    {
        "name": "AIBase新闻",
        "url": "https://rsshub.app/aibase/news"
    },
    {
        "name": "V2EX热门话题",
        "url": "https://rsshub.app/v2ex/topics/hot"
    },
    {
        "name": "Solidot",
        "url": "https://www.solidot.org/index.rss"
    }
]


def get_rss_urls() -> List[str]:
    """获取所有RSS源URL列表"""
    return [source["url"] for source in RSS_SOURCES]


def get_rss_sources() -> List[Dict[str, str]]:
    """获取所有RSS源配置（包含名称和URL）"""
    return RSS_SOURCES


def get_source_name(url: str) -> str:
    """根据URL获取RSS源名称"""
    for source in RSS_SOURCES:
        if source["url"] == url:
            return source["name"]
    return url  # 如果找不到，返回URL本身
