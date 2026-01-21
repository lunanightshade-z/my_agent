"""
ArXiv数据模型定义

定义ArXiv论文和检索结果的数据结构，使用dataclass提供类型安全和便捷的数据操作。
"""
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import Optional, List, Dict, Any


@dataclass
class ArxivPaper:
    """ArXiv论文数据模型"""
    
    arxiv_id: str  # ArXiv ID（如：2301.12345）
    title: str  # 论文标题
    summary: str  # 论文摘要
    authors: List[str] = field(default_factory=list)  # 作者列表
    published: Optional[str] = None  # 发布日期
    updated: Optional[str] = None  # 更新日期
    pdf_url: Optional[str] = None  # PDF链接
    arxiv_url: Optional[str] = None  # ArXiv页面链接
    primary_category: Optional[str] = None  # 主要分类
    categories: List[str] = field(default_factory=list)  # 所有分类
    comment: Optional[str] = None  # 评论/备注
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return asdict(self)
    
    def __str__(self) -> str:
        """友好的字符串表示"""
        authors_str = ", ".join(self.authors[:3])
        if len(self.authors) > 3:
            authors_str += f" et al. ({len(self.authors)} authors)"
        return f"{self.title}\nAuthors: {authors_str}\n{self.summary[:200]}..."


@dataclass
class ArxivSearchResult:
    """ArXiv检索结果模型"""
    
    query: str  # 检索关键词
    total_results: int  # 总结果数
    papers: List[ArxivPaper] = field(default_factory=list)  # 论文列表
    search_time: str = field(default_factory=lambda: datetime.now().isoformat())  # 检索时间
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典格式"""
        return {
            'query': self.query,
            'total_results': self.total_results,
            'papers': [paper.to_dict() for paper in self.papers],
            'search_time': self.search_time,
            'paper_count': len(self.papers)
        }
    
    def get_papers(self) -> List[ArxivPaper]:
        """获取所有论文"""
        return self.papers
