"""
RSS新闻智能筛选服务

使用大模型根据用户需求筛选RSS文章，基于文章的description进行智能判断。
支持多线程并发处理和进度条显示。
"""
import json
import sys
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import threading

# 添加路径以导入智谱服务
sys.path.insert(0, str(Path(__file__).parent.parent))
from zhipu_service import get_zhipu_response_sync

# 添加rss_fetcher路径
sys.path.insert(0, str(Path(__file__).parent))
from rss_fetcher import RSSFetcher, RSSArticle


@dataclass
class FilteredArticle:
    """筛选后的文章数据模型"""
    
    title: str
    link: str
    description: str
    source: str
    pub_date: Optional[str] = None
    relevance_score: Optional[int] = None  # 相关度评分 1-10
    relevance_reason: Optional[str] = None  # 相关原因
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return asdict(self)


@dataclass
class FilterResult:
    """筛选结果模型"""
    
    user_query: str  # 用户需求
    total_articles: int  # 总文章数
    matched_articles: int  # 匹配的文章数
    filtered_articles: List[FilteredArticle]  # 筛选后的文章列表
    
    def to_dict(self) -> Dict:
        """转换为字典"""
        return {
            'user_query': self.user_query,
            'total_articles': self.total_articles,
            'matched_articles': self.matched_articles,
            'filtered_articles': [a.to_dict() for a in self.filtered_articles]
        }


class RSSFilterService:
    """RSS新闻智能筛选服务（支持多线程和进度条）"""
    
    def __init__(self, batch_size: int = 10, max_workers: int = 5):
        """
        初始化筛选服务
        
        Args:
            batch_size: 每批次发送给大模型的文章数量
            max_workers: 最大并发线程数
        """
        self.batch_size = batch_size
        self.max_workers = max_workers
        self._lock = threading.Lock()  # 线程锁，保护共享资源
    
    def filter_articles(
        self, 
        user_query: str, 
        articles: List[RSSArticle],
        min_relevance: int = 6,
        show_progress: bool = True
    ) -> FilterResult:
        """
        根据用户需求筛选文章（多线程并发）
        
        Args:
            user_query: 用户的需求描述
            articles: 待筛选的文章列表
            min_relevance: 最低相关度阈值（1-10），默认6
            show_progress: 是否显示进度条
        
        Returns:
            FilterResult 筛选结果
        """
        # 分批准备任务
        batches = []
        for i in range(0, len(articles), self.batch_size):
            batch = articles[i:i + self.batch_size]
            batches.append((user_query, batch, min_relevance))
        
        total_batches = len(batches)
        filtered_articles = []
        
        # 使用线程池并发处理
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有批次任务
            future_to_batch = {
                executor.submit(self._filter_batch_wrapper, batch_data): idx
                for idx, batch_data in enumerate(batches)
            }
            
            # 创建进度条
            if show_progress:
                pbar = tqdm(
                    total=total_batches,
                    desc="筛选进度",
                    unit="批次",
                    bar_format="{l_bar}{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]"
                )
            
            # 收集结果
            for future in as_completed(future_to_batch):
                try:
                    batch_results = future.result()
                    with self._lock:
                        filtered_articles.extend(batch_results)
                    
                    if show_progress:
                        pbar.update(1)
                        pbar.set_postfix({"已筛选": len(filtered_articles)})
                        
                except Exception as e:
                    print(f"\n批次处理异常: {str(e)}")
                    if show_progress:
                        pbar.update(1)
            
            if show_progress:
                pbar.close()
        
        # 按相关度排序
        filtered_articles.sort(key=lambda x: x.relevance_score or 0, reverse=True)
        
        return FilterResult(
            user_query=user_query,
            total_articles=len(articles),
            matched_articles=len(filtered_articles),
            filtered_articles=filtered_articles
        )
    
    def _filter_batch_wrapper(self, batch_data: tuple) -> List[FilteredArticle]:
        """
        批次处理包装器（用于线程池）
        
        Args:
            batch_data: (user_query, articles, min_relevance) 元组
        
        Returns:
            筛选后的文章列表
        """
        user_query, articles, min_relevance = batch_data
        return self._filter_batch(user_query, articles, min_relevance)
    
    def _filter_batch(
        self, 
        user_query: str, 
        articles: List[RSSArticle],
        min_relevance: int
    ) -> List[FilteredArticle]:
        """
        批量筛选文章（使用大模型）
        
        Args:
            user_query: 用户需求
            articles: 文章批次
            min_relevance: 最低相关度阈值
        
        Returns:
            筛选后的文章列表
        """
        # 构建文章列表供大模型分析
        articles_info = []
        for idx, article in enumerate(articles):
            articles_info.append({
                "index": idx,
                "title": article.title,
                "description": article.description[:300] if article.description else "",  # 限制长度
                "source": article.source or "未知来源"
            })
        
        # 构建prompt
        prompt = self._build_filter_prompt(user_query, articles_info, min_relevance)
        
        # 调用大模型
        conversations = [
            {
                "role": "system",
                "content": "你是一个专业的新闻筛选助手。你需要根据用户需求，从给定的新闻列表中筛选出相关的文章，并给出相关度评分和理由。"
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        try:
            response = get_zhipu_response_sync(conversations, thinking="disabled")
            
            # 解析大模型返回的结果
            filtered = self._parse_filter_response(response, articles)
            
            return filtered
            
        except Exception as e:
            print(f"批次筛选失败: {str(e)}")
            return []
    
    def _build_filter_prompt(
        self, 
        user_query: str, 
        articles_info: List[Dict],
        min_relevance: int
    ) -> str:
        """
        构建筛选prompt
        
        Args:
            user_query: 用户需求
            articles_info: 文章信息列表
            min_relevance: 最低相关度阈值
        
        Returns:
            完整的prompt
        """
        articles_text = json.dumps(articles_info, ensure_ascii=False, indent=2)
        
        prompt = f"""用户需求：{user_query}

请从以下新闻列表中筛选出与用户需求相关的文章。

新闻列表：
{articles_text}

筛选要求：
1. 仔细阅读每篇文章的标题和描述
2. 判断文章是否与用户需求相关
3. 对于相关的文章，给出相关度评分（1-10分，10分最相关）
4. 只保留相关度 >= {min_relevance} 分的文章
5. 简要说明每篇文章的相关原因（20字以内）

请以JSON格式返回结果，格式如下：
{{
  "matched_articles": [
    {{
      "index": 0,
      "relevance_score": 8,
      "relevance_reason": "文章讨论了AI技术在教育领域的应用"
    }},
    ...
  ]
}}

注意：
- 如果没有相关文章，返回空列表
- 只返回JSON，不要有其他文字
- 相关原因要简洁明确"""
        
        return prompt
    
    def _parse_filter_response(
        self, 
        response: str, 
        original_articles: List[RSSArticle]
    ) -> List[FilteredArticle]:
        """
        解析大模型的筛选结果
        
        Args:
            response: 大模型返回的JSON字符串
            original_articles: 原始文章列表
        
        Returns:
            筛选后的文章列表
        """
        try:
            # 提取JSON部分（去除可能的markdown代码块）
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()
            
            # 解析JSON
            result = json.loads(response)
            matched = result.get("matched_articles", [])
            
            filtered_articles = []
            for match in matched:
                idx = match.get("index")
                if idx is not None and 0 <= idx < len(original_articles):
                    article = original_articles[idx]
                    filtered_articles.append(FilteredArticle(
                        title=article.title,
                        link=article.link,
                        description=article.description,
                        source=article.source or "未知来源",
                        pub_date=article.pub_date,
                        relevance_score=match.get("relevance_score"),
                        relevance_reason=match.get("relevance_reason")
                    ))
            
            return filtered_articles
            
        except json.JSONDecodeError as e:
            # 尝试更宽松的JSON解析
            try:
                # 尝试找到JSON对象
                start_idx = response.find('{')
                end_idx = response.rfind('}') + 1
                if start_idx >= 0 and end_idx > start_idx:
                    json_str = response[start_idx:end_idx]
                    result = json.loads(json_str)
                    matched = result.get("matched_articles", [])
                    
                    filtered_articles = []
                    for match in matched:
                        idx = match.get("index")
                        if idx is not None and 0 <= idx < len(original_articles):
                            article = original_articles[idx]
                            filtered_articles.append(FilteredArticle(
                                title=article.title,
                                link=article.link,
                                description=article.description,
                                source=article.source or "未知来源",
                                pub_date=article.pub_date,
                                relevance_score=match.get("relevance_score"),
                                relevance_reason=match.get("relevance_reason")
                            ))
                    return filtered_articles
            except:
                pass
            
            # 如果还是失败，记录错误但不打印（避免干扰进度条）
            import logging
            logging.debug(f"JSON解析失败: {str(e)}, 响应: {response[:200]}")
            return []
        except Exception as e:
            import logging
            logging.debug(f"结果解析失败: {str(e)}")
            return []


def filter_rss_by_query(
    user_query: str, 
    min_relevance: int = 6,
    max_workers: int = 5,
    show_progress: bool = True
) -> FilterResult:
    """
    便捷函数：获取RSS并根据用户需求筛选（多线程）
    
    Args:
        user_query: 用户需求描述
        min_relevance: 最低相关度阈值
        max_workers: 最大并发线程数
        show_progress: 是否显示进度条
    
    Returns:
        FilterResult 筛选结果
    """
    print(f"正在获取RSS新闻...")
    
    # 获取RSS新闻
    with RSSFetcher() as fetcher:
        result = fetcher.fetch_all()
        all_articles = result.get_all_articles()
    
    print(f"共获取 {len(all_articles)} 篇文章")
    print(f"正在使用AI多线程筛选（{max_workers}个线程）...")
    
    # 使用AI筛选
    service = RSSFilterService(batch_size=10, max_workers=max_workers)
    filter_result = service.filter_articles(
        user_query, 
        all_articles, 
        min_relevance,
        show_progress=show_progress
    )
    
    print(f"筛选完成，找到 {filter_result.matched_articles} 篇相关文章")
    
    return filter_result


def filter_rss_from_file(
    json_file: str, 
    user_query: str, 
    min_relevance: int = 6,
    max_workers: int = 5,
    batch_size: int = 10,
    show_progress: bool = True
) -> FilterResult:
    """
    从已有的RSS JSON文件中筛选（多线程）
    
    Args:
        json_file: RSS数据JSON文件路径
        user_query: 用户需求描述
        min_relevance: 最低相关度阈值
        max_workers: 最大并发线程数
        batch_size: 每批次处理的文章数量
        show_progress: 是否显示进度条
    
    Returns:
        FilterResult 筛选结果
    """
    print(f"从文件加载RSS数据: {json_file}")
    
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 转换为RSSArticle对象
    articles = []
    for source_result in data['results']:
        if source_result['success']:
            for article_data in source_result['articles']:
                articles.append(RSSArticle(
                    title=article_data['title'],
                    link=article_data['link'],
                    description=article_data['description'],
                    pub_date=article_data.get('pub_date'),
                    author=article_data.get('author'),
                    source=article_data.get('source'),
                    categories=article_data.get('categories', [])
                ))
    
    total_batches = (len(articles) + batch_size - 1) // batch_size
    print(f"共加载 {len(articles)} 篇文章，分为 {total_batches} 个批次")
    print(f"正在使用AI多线程筛选（{max_workers}个线程并发）...")
    
    # 使用AI筛选
    service = RSSFilterService(batch_size=batch_size, max_workers=max_workers)
    filter_result = service.filter_articles(
        user_query, 
        articles, 
        min_relevance,
        show_progress=show_progress
    )
    
    print(f"[完成] 筛选完成，找到 {filter_result.matched_articles} 篇相关文章")
    
    return filter_result


if __name__ == "__main__":
    # 示例1: 从已有JSON文件筛选
    user_query = "关于人工智能和AI技术的最新发展"
    
    result = filter_rss_from_file(
        "rss_news_output.json",
        user_query,
        min_relevance=6
    )
    
    # 打印结果
    print("\n" + "="*60)
    print(f"筛选结果")
    print("="*60)
    print(f"用户需求: {result.user_query}")
    print(f"总文章数: {result.total_articles}")
    print(f"匹配文章数: {result.matched_articles}")
    print("\n相关文章列表:")
    
    for i, article in enumerate(result.filtered_articles[:10], 1):  # 只显示前10篇
        print(f"\n{i}. {article.title}")
        print(f"   来源: {article.source}")
        print(f"   相关度: {article.relevance_score}/10")
        print(f"   原因: {article.relevance_reason}")
        print(f"   链接: {article.link}")
    
    # 保存结果
    output_file = "filtered_rss_result.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)
    print(f"\n完整结果已保存到: {output_file}")
    
    # 示例2: 直接获取RSS并筛选（注释掉，避免重复获取）
    # result = filter_rss_by_query("关于环境保护和生态建设的新闻")
