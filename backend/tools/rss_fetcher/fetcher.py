"""
RSS多线程获取器

使用线程池并发获取多个RSS源,提供错误处理和重试机制。
"""
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Optional, Dict
import logging
import time

from .models import RSSFetchResult, RSSAggregatedResult, RSSArticle
from .parser import RSSParser
from .config import FetchConfig, get_rss_sources, get_source_name

logger = logging.getLogger(__name__)


class RSSFetcher:
    """RSS多线程获取器"""
    
    def __init__(self, config: Optional[FetchConfig] = None):
        """
        初始化获取器
        
        Args:
            config: 获取配置，如果为None则使用默认配置
        """
        self.config = config or FetchConfig()
        self.parser = RSSParser()
        self.session = self._create_session()
    
    def _create_session(self) -> requests.Session:
        """创建requests会话，配置通用参数"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': self.config.user_agent
        })
        return session
    
    def fetch_single(self, url: str, source_name: Optional[str] = None) -> RSSFetchResult:
        """
        获取单个RSS源
        
        Args:
            url: RSS源URL
            source_name: 来源名称
            
        Returns:
            RSSFetchResult对象
        """
        if not source_name:
            source_name = get_source_name(url)
        
        logger.info(f"开始获取: {source_name} ({url})")
        
        # 重试机制
        last_error = None
        for attempt in range(self.config.max_retries + 1):
            try:
                response = self.session.get(
                    url,
                    timeout=self.config.timeout
                )
                response.raise_for_status()
                
                # 解析内容
                articles = self.parser.parse(response.text, source_name)
                
                logger.info(f"成功获取: {source_name}, 文章数: {len(articles)}")
                return RSSFetchResult(
                    url=url,
                    success=True,
                    articles=articles
                )
                
            except requests.exceptions.Timeout as e:
                last_error = f"请求超时: {str(e)}"
                logger.warning(f"{source_name} 第{attempt + 1}次尝试超时")
                
            except requests.exceptions.RequestException as e:
                last_error = f"网络请求失败: {str(e)}"
                logger.warning(f"{source_name} 第{attempt + 1}次尝试失败: {str(e)}")
                
            except Exception as e:
                last_error = f"未知错误: {str(e)}"
                logger.error(f"{source_name} 发生未知错误: {str(e)}")
                break  # 未知错误不重试
            
            # 等待后重试
            if attempt < self.config.max_retries:
                time.sleep(self.config.retry_delay)
        
        # 所有重试都失败
        logger.error(f"获取失败: {source_name} - {last_error}")
        return RSSFetchResult(
            url=url,
            success=False,
            error=last_error
        )
    
    def fetch_all(self, sources: Optional[List[Dict[str, str]]] = None) -> RSSAggregatedResult:
        """
        并发获取多个RSS源
        
        Args:
            sources: RSS源列表，格式为[{"name": "来源名", "url": "RSS地址"}]
                    如果为None，则使用配置文件中的默认源
        
        Returns:
            RSSAggregatedResult汇总结果
        """
        if sources is None:
            sources = get_rss_sources()
        
        logger.info(f"开始并发获取 {len(sources)} 个RSS源")
        
        results: List[RSSFetchResult] = []
        
        # 使用线程池并发获取
        with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
            # 提交所有任务
            future_to_source = {
                executor.submit(self.fetch_single, source['url'], source['name']): source
                for source in sources
            }
            
            # 收集结果
            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    # 线程异常处理
                    logger.error(f"线程执行异常: {source['name']} - {str(e)}")
                    results.append(RSSFetchResult(
                        url=source['url'],
                        success=False,
                        error=f"线程执行异常: {str(e)}"
                    ))
        
        # 统计结果
        successful = sum(1 for r in results if r.success)
        failed = len(results) - successful
        total_articles = sum(len(r.articles) for r in results if r.success)
        
        logger.info(f"获取完成: 成功 {successful}/{len(sources)}, 共 {total_articles} 篇文章")
        
        return RSSAggregatedResult(
            total_sources=len(sources),
            successful_sources=successful,
            failed_sources=failed,
            total_articles=total_articles,
            results=results
        )
    
    def fetch_urls(self, urls: List[str]) -> RSSAggregatedResult:
        """
        根据URL列表获取RSS
        
        Args:
            urls: RSS源URL列表
            
        Returns:
            RSSAggregatedResult汇总结果
        """
        sources = [{"name": get_source_name(url), "url": url} for url in urls]
        return self.fetch_all(sources)
    
    def close(self):
        """关闭会话，释放资源"""
        if self.session:
            self.session.close()
            logger.info("RSS获取器已关闭")
    
    def __enter__(self):
        """上下文管理器入口"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """上下文管理器退出，自动关闭会话"""
        self.close()
