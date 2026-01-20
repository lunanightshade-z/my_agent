"""
RSS智能筛选功能测试脚本

演示如何使用大模型筛选RSS新闻
"""
import sys
from pathlib import Path

# 添加路径
sys.path.insert(0, str(Path(__file__).parent))

from rss_filter_service import filter_rss_from_file, filter_rss_by_query


def test_filter_from_file():
    """测试从文件筛选"""
    print("="*60)
    print("测试场景1: 从已有RSS数据文件筛选")
    print("="*60)
    
    # 测试用例1: 筛选AI相关新闻
    print("\n【测试1】筛选AI和人工智能相关新闻")
    result1 = filter_rss_from_file(
        "rss_news_output.json",
        "关于人工智能、AI技术、机器学习、深度学习的最新发展和应用",
        min_relevance=6
    )
    print_results(result1, max_show=5)
    
    # 测试用例2: 筛选环境保护相关新闻
    print("\n" + "="*60)
    print("\n【测试2】筛选环境保护和生态建设相关新闻")
    result2 = filter_rss_from_file(
        "rss_news_output.json",
        "关于环境保护、生态建设、绿色发展、气候变化的新闻",
        min_relevance=6
    )
    print_results(result2, max_show=5)
    
    # 测试用例3: 筛选科技创新相关新闻
    print("\n" + "="*60)
    print("\n【测试3】筛选科技创新和技术突破相关新闻")
    result3 = filter_rss_from_file(
        "rss_news_output.json",
        "科技创新、技术突破、研发进展、高科技产品",
        min_relevance=6
    )
    print_results(result3, max_show=5)
    
    return result1, result2, result3


def print_results(result, max_show=10):
    """打印筛选结果"""
    print("\n" + "-"*60)
    print(f"用户需求: {result.user_query}")
    print(f"总文章数: {result.total_articles}")
    print(f"匹配文章数: {result.matched_articles}")
    print(f"匹配率: {result.matched_articles/result.total_articles*100:.1f}%")
    
    if result.matched_articles > 0:
        print(f"\n相关文章列表 (显示前{min(max_show, result.matched_articles)}篇):")
        
        for i, article in enumerate(result.filtered_articles[:max_show], 1):
            print(f"\n{i}. 【{article.source}】{article.title}")
            print(f"   相关度: {'★' * article.relevance_score}{article.relevance_score}/10")
            print(f"   原因: {article.relevance_reason}")
            if article.pub_date:
                print(f"   时间: {article.pub_date}")
            print(f"   链接: {article.link[:80]}...")
    else:
        print("\n未找到相关文章")


def test_with_custom_query():
    """测试自定义查询"""
    print("\n" + "="*60)
    print("测试场景2: 自定义查询测试")
    print("="*60)
    
    custom_queries = [
        "国际政治和外交关系",
        "经济发展和市场动态",
        "教育改革和人才培养"
    ]
    
    for query in custom_queries:
        print(f"\n【查询】{query}")
        result = filter_rss_from_file(
            "rss_news_output.json",
            query,
            min_relevance=7  # 提高阈值
        )
        print(f"匹配: {result.matched_articles}/{result.total_articles} 篇")
        
        if result.matched_articles > 0:
            # 只显示最相关的3篇
            for i, article in enumerate(result.filtered_articles[:3], 1):
                print(f"  {i}. {article.title[:40]}... ({article.relevance_score}/10)")


def save_results(results, filename="filter_test_results.json"):
    """保存测试结果"""
    import json
    
    combined = {
        "test_cases": [
            {
                "query": r.user_query,
                "total": r.total_articles,
                "matched": r.matched_articles,
                "articles": [a.to_dict() for a in r.filtered_articles]
            }
            for r in results
        ]
    }
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)
    
    print(f"\n测试结果已保存到: {filename}")


if __name__ == "__main__":
    print("RSS智能筛选功能测试")
    print("="*60)
    
    # 运行测试
    results = test_filter_from_file()
    
    # 自定义查询测试
    test_with_custom_query()
    
    # 保存结果
    save_results(results)
    
    print("\n" + "="*60)
    print("所有测试完成!")
    print("="*60)
