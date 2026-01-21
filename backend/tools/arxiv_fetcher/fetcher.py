"""
ArXiv论文检索器

使用ArXiv API检索论文，支持关键词搜索和结果解析。
"""
import requests
from typing import List, Optional
import logging
import xml.etree.ElementTree as ET
from urllib.parse import quote, urlencode
from datetime import datetime

from .models import ArxivPaper, ArxivSearchResult

logger = logging.getLogger(__name__)

# ArXiv API基础URL
ARXIV_API_BASE = "http://export.arxiv.org/api/query"


class ArxivFetcher:
    """ArXiv论文检索器"""
    
    def __init__(self, timeout: int = 30):
        """
        初始化检索器
        
        Args:
            timeout: 请求超时时间（秒）
        """
        self.timeout = timeout
        self.session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """创建requests会话，配置通用参数"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; ArxivFetcher/1.0)'
        })
        return session
    
    def search(
        self, 
        query: str, 
        max_results: int = 10,
        sort_by: str = "relevance",
        sort_order: str = "descending"
    ) -> ArxivSearchResult:
        """
        搜索ArXiv论文
        
        Args:
            query: 搜索关键词（支持ArXiv查询语法，如 "all:machine learning" 或 "ti:transformer"）
            max_results: 最大返回结果数（默认10，最大30000）
            sort_by: 排序方式（relevance, lastUpdatedDate, submittedDate）
            sort_order: 排序顺序（ascending, descending）
        
        Returns:
            ArxivSearchResult: 检索结果对象
        
        Raises:
            requests.RequestException: 网络请求异常
            ValueError: 参数无效
        """
        if not query or not query.strip():
            raise ValueError("查询关键词不能为空")
        
        if max_results <= 0 or max_results > 30000:
            raise ValueError("max_results必须在1-30000之间")
        
        # 构建查询参数
        params = {
            'search_query': query,
            'start': 0,
            'max_results': min(max_results, 30000),
            'sortBy': sort_by,
            'sortOrder': sort_order
        }
        
        try:
            logger.info(f"搜索ArXiv论文: query={query}, max_results={max_results}")
            
            # 发送请求
            response = self.session.get(
                ARXIV_API_BASE,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            # 解析XML响应
            papers = self._parse_xml_response(response.text)
            
            # 构建结果对象
            result = ArxivSearchResult(
                query=query,
                total_results=len(papers),
                papers=papers[:max_results],
                search_time=datetime.now().isoformat()
            )
            
            logger.info(f"成功检索到 {len(papers)} 篇论文")
            return result
            
        except requests.RequestException as e:
            logger.error(f"ArXiv API请求失败: {e}")
            raise
        except ET.ParseError as e:
            logger.error(f"XML解析失败: {e}")
            raise ValueError(f"无法解析ArXiv API响应: {e}")
        except Exception as e:
            logger.error(f"检索论文时发生未知错误: {e}")
            raise
    
    def _parse_xml_response(self, xml_content: str) -> List[ArxivPaper]:
        """
        解析ArXiv API返回的XML内容
        
        Args:
            xml_content: XML字符串内容
        
        Returns:
            List[ArxivPaper]: 论文列表
        """
        papers = []
        
        try:
            root = ET.fromstring(xml_content)
            
            # ArXiv API使用Atom格式，命名空间
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            
            # 查找所有entry元素
            entries = root.findall('atom:entry', ns)
            
            for entry in entries:
                try:
                    paper = self._parse_entry(entry, ns)
                    if paper:
                        papers.append(paper)
                except Exception as e:
                    logger.warning(f"解析论文条目失败: {e}")
                    continue
            
        except ET.ParseError as e:
            logger.error(f"XML解析错误: {e}")
            raise
        
        return papers
    
    def _parse_entry(self, entry: ET.Element, ns: dict) -> Optional[ArxivPaper]:
        """
        解析单个论文条目
        
        Args:
            entry: XML entry元素
            ns: 命名空间字典
        
        Returns:
            ArxivPaper: 论文对象，解析失败返回None
        """
        try:
            # 提取ArXiv ID（从id标签中提取，格式如：http://arxiv.org/abs/2301.12345v1）
            arxiv_id_elem = entry.find('atom:id', ns)
            if arxiv_id_elem is None or arxiv_id_elem.text is None:
                return None
            
            arxiv_id = arxiv_id_elem.text.split('/')[-1]  # 提取最后一部分作为ID
            
            # 提取标题
            title_elem = entry.find('atom:title', ns)
            title = title_elem.text.strip() if title_elem is not None and title_elem.text else ""
            
            # 提取摘要
            summary_elem = entry.find('atom:summary', ns)
            summary = summary_elem.text.strip() if summary_elem is not None and summary_elem.text else ""
            
            # 提取作者列表
            authors = []
            author_elems = entry.findall('atom:author', ns)
            for author_elem in author_elems:
                name_elem = author_elem.find('atom:name', ns)
                if name_elem is not None and name_elem.text:
                    authors.append(name_elem.text.strip())
            
            # 提取发布日期和更新日期
            published_elem = entry.find('atom:published', ns)
            published = published_elem.text if published_elem is not None and published_elem.text else None
            
            updated_elem = entry.find('atom:updated', ns)
            updated = updated_elem.text if updated_elem is not None and updated_elem.text else None
            
            # 提取链接
            pdf_url = None
            arxiv_url = None
            link_elems = entry.findall('atom:link', ns)
            for link_elem in link_elems:
                rel = link_elem.get('rel', '')
                href = link_elem.get('href', '')
                if rel == 'alternate':
                    arxiv_url = href
                elif 'pdf' in rel or 'application/pdf' in link_elem.get('type', ''):
                    pdf_url = href
            
            # 提取分类
            categories = []
            primary_category = None
            category_elems = entry.findall('atom:category', ns)
            for category_elem in category_elems:
                term = category_elem.get('term', '')
                if term:
                    categories.append(term)
                    # 检查是否是主要分类（通过scheme属性）
                    scheme = category_elem.get('scheme', '')
                    if scheme.endswith('#primary') or 'primary' in scheme.lower():
                        primary_category = term
            
            # 如果没有找到主要分类，使用第一个分类作为主要分类
            if not primary_category and categories:
                primary_category = categories[0]
            
            # 提取评论
            comment_elem = entry.find('atom:comment', ns)
            comment = comment_elem.text if comment_elem is not None and comment_elem.text else None
            
            # 创建论文对象
            paper = ArxivPaper(
                arxiv_id=arxiv_id,
                title=title,
                summary=summary,
                authors=authors,
                published=published,
                updated=updated,
                pdf_url=pdf_url,
                arxiv_url=arxiv_url or f"http://arxiv.org/abs/{arxiv_id}",
                primary_category=primary_category,
                categories=categories,
                comment=comment
            )
            
            return paper
            
        except Exception as e:
            logger.warning(f"解析论文条目时出错: {e}")
            return None
    
    def search_by_keywords(
        self,
        keywords: str,
        max_results: int = 10,
        search_all_fields: bool = True
    ) -> ArxivSearchResult:
        """
        通过关键词搜索论文（便捷方法）
        
        Args:
            keywords: 搜索关键词
            max_results: 最大返回结果数
            search_all_fields: 是否在所有字段中搜索（True: all:keyword, False: ti:keyword）
        
        Returns:
            ArxivSearchResult: 检索结果对象
        """
        if search_all_fields:
            query = f"all:{keywords}"
        else:
            query = f"ti:{keywords}"
        
        return self.search(query, max_results=max_results)
    
    def __enter__(self):
        """上下文管理器入口"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器出口，关闭会话"""
        if hasattr(self, 'session'):
            self.session.close()
        return False
