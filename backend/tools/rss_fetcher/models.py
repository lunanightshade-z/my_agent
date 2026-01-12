"""
RSS数据模型定义

定义RSS文章和获取结果的数据结构，使用dataclass提供类型安全和便捷的数据操作。
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional, List, Dict, Any


@dataclass
class RSSArticle:
    """RSS文章数据模型"""
    
    title: str  # 文章标题
    link: str  # 文章链接
    description: str  # 文章描述/摘要
    pub_date: Optional[str] = None  # 发布日期
    author: Optional[str] = None  # 作者
    source: Optional[str] = None  # 来源（RSS源名称）
    categories: List[str] = field(default_factory=list)  # 分类标签
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return asdict(self)


@dataclass
class RSSFetchResult:
    """RSS获取结果模型"""
    
    url: str  # RSS源URL
    success: bool  # 是否成功获取
    articles: List[RSSArticle] = field(default_factory=list)  # 文章列表
    error: Optional[str] = None  # 错误信息
    fetch_time: str = field(default_factory=lambda: datetime.now().isoformat())  # 获取时间
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            'url': self.url,
            'success': self.success,
            'articles': [article.to_dict() for article in self.articles],
            'error': self.error,
            'fetch_time': self.fetch_time,
            'article_count': len(self.articles)
        }


@dataclass
class RSSAggregatedResult:
    """RSS汇总结果模型"""
    
    total_sources: int  # 总RSS源数量
    successful_sources: int  # 成功获取的源数量
    failed_sources: int  # 失败的源数量
    total_articles: int  # 总文章数
    results: List[RSSFetchResult] = field(default_factory=list)  # 各源结果
    fetch_time: str = field(default_factory=lambda: datetime.now().isoformat())  # 汇总时间
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            'summary': {
                'total_sources': self.total_sources,
                'successful_sources': self.successful_sources,
                'failed_sources': self.failed_sources,
                'total_articles': self.total_articles,
                'fetch_time': self.fetch_time
            },
            'results': [result.to_dict() for result in self.results]
        }
    
    def get_all_articles(self) -> List[RSSArticle]:
        """获取所有成功获取的文章"""
        all_articles = []
        for result in self.results:
            if result.success:
                all_articles.extend(result.articles)
        return all_articles
