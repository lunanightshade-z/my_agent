
"""
RSS新闻获取工具 - 使用示例

这个模块展示如何使用rss_fetcher包来获取和处理RSS新闻。

cd backend && source venv/bin/activate && cd tools && python get_rss_news.py
"""
import json
import logging
import sys
from pathlib import Path

# 添加当前目录到Python路径，确保可以导入rss_fetcher
sys.path.insert(0, str(Path(__file__).parent))

from rss_fetcher import RSSFetcher, FetchConfig

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


def fetch_rss_news(output_file: str = None) -> dict:
    """
    获取所有RSS源的新闻并汇总到JSON
    
    Args:
        output_file: 可选的输出文件路径，如果指定则保存到文件
    
    Returns:
        包含所有新闻的字典
    """
    # 创建自定义配置（可选）
    config = FetchConfig(
        max_workers=10,      # 并发线程数
        timeout=10,          # 请求超时时间
        max_retries=2,       # 重试次数
        retry_delay=1.0      # 重试延迟
    )
    
    # 使用上下文管理器确保资源正确释放
    with RSSFetcher(config) as fetcher:
        # 获取所有RSS源
        result = fetcher.fetch_all()
        
        # 转换为字典格式
        data = result.to_dict()
        
        # 打印摘要信息
        print("\n" + "="*50)
        print(f"RSS获取完成")
        print(f"总源数: {data['summary']['total_sources']}")
        print(f"成功: {data['summary']['successful_sources']}")
        print(f"失败: {data['summary']['failed_sources']}")
        print(f"总文章数: {data['summary']['total_articles']}")
        print("="*50 + "\n")
        
        # 显示各源详情
        for source_result in data['results']:
            status = "[OK]" if source_result['success'] else "[FAIL]"
            print(f"{status} {source_result['url']}")
            if source_result['success']:
                print(f"  文章数: {source_result['article_count']}")
            else:
                print(f"  错误: {source_result['error']}")
        
        # 如果指定了输出文件，保存到文件
        if output_file:
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"\n结果已保存到: {output_path}")
        
        return data


def fetch_custom_urls(urls: list[str]) -> dict:
    """
    获取自定义URL列表的RSS新闻
    
    Args:
        urls: RSS源URL列表
    
    Returns:
        包含所有新闻的字典
    """
    with RSSFetcher() as fetcher:
        result = fetcher.fetch_urls(urls)
        return result.to_dict()


def get_all_articles_list() -> list[dict]:
    """
    获取所有文章的扁平列表（不包含源信息）
    
    Returns:
        文章字典列表
    """
    with RSSFetcher() as fetcher:
        result = fetcher.fetch_all()
        # 获取所有文章
        all_articles = result.get_all_articles()
        return [article.to_dict() for article in all_articles]


if __name__ == "__main__":
    # 示例1: 获取所有RSS源并保存到文件
    data = fetch_rss_news(output_file="rss_news_output.json")
    
    # 示例2: 只获取特定的RSS源
    # custom_urls = [
    #     "https://www.geekpark.net/rss",
    #     "https://sspai.com/feed"
    # ]
    # data = fetch_custom_urls(custom_urls)
    
    # 示例3: 获取所有文章的扁平列表
    # articles = get_all_articles_list()
    # print(f"共获取 {len(articles)} 篇文章")
