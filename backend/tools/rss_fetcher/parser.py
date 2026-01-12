"""
RSS解析器

负责解析RSS/Atom XML格式内容，提取文章信息。
"""
import feedparser
from typing import List, Optional
from datetime import datetime
import logging

from .models import RSSArticle

logger = logging.getLogger(__name__)


class RSSParser:
    """RSS/Atom解析器"""
    
    @staticmethod
    def parse(content: str, source_name: Optional[str] = None) -> List[RSSArticle]:
        """
        解析RSS/Atom内容
        
        Args:
            content: RSS XML字符串
            source_name: 来源名称
            
        Returns:
            解析出的文章列表
        """
        try:
            # 使用feedparser解析，支持RSS和Atom格式
            feed = feedparser.parse(content)
            
            if feed.bozo and feed.bozo_exception:
                logger.warning(f"RSS解析警告: {feed.bozo_exception}")
            
            articles = []
            for entry in feed.entries:
                article = RSSParser._parse_entry(entry, source_name)
                if article:
                    articles.append(article)
            
            logger.info(f"成功解析 {len(articles)} 篇文章 from {source_name or 'unknown'}")
            return articles
            
        except Exception as e:
            logger.error(f"RSS解析失败: {str(e)}")
            return []
    
    @staticmethod
    def _parse_entry(entry, source_name: Optional[str] = None) -> Optional[RSSArticle]:
        """
        解析单个RSS条目
        
        Args:
            entry: feedparser解析的entry对象
            source_name: 来源名称
            
        Returns:
            RSSArticle对象或None
        """
        try:
            # 提取标题
            title = entry.get('title', '').strip()
            if not title:
                return None
            
            # 提取链接
            link = entry.get('link', '').strip()
            if not link:
                return None
            
            # 提取描述/摘要
            description = ''
            if 'summary' in entry:
                description = entry.summary
            elif 'description' in entry:
                description = entry.description
            elif 'content' in entry and len(entry.content) > 0:
                description = entry.content[0].get('value', '')
            description = description.strip()
            
            # 提取发布日期
            pub_date = None
            if 'published' in entry:
                pub_date = entry.published
            elif 'updated' in entry:
                pub_date = entry.updated
            
            # 提取作者
            author = None
            if 'author' in entry:
                author = entry.author
            elif 'author_detail' in entry and 'name' in entry.author_detail:
                author = entry.author_detail.name
            
            # 提取分类/标签
            categories = []
            if 'tags' in entry:
                categories = [tag.get('term', '') for tag in entry.tags if tag.get('term')]
            
            return RSSArticle(
                title=title,
                link=link,
                description=description,
                pub_date=pub_date,
                author=author,
                source=source_name,
                categories=categories
            )
            
        except Exception as e:
            logger.error(f"解析RSS条目失败: {str(e)}")
            return None
