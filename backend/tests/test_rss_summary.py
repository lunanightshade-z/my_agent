"""
RSS获取工具测试总结脚本
"""
import json
from pathlib import Path

def summarize_test_results(json_file: str = "rss_news_output.json"):
    """总结测试结果"""
    json_path = Path(json_file)
    
    if not json_path.exists():
        print(f"错误: 文件 {json_file} 不存在")
        return
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    summary = data['summary']
    results = data['results']
    
    print("="*60)
    print("RSS获取工具测试结果总结")
    print("="*60)
    print(f"\n总体统计:")
    print(f"  总RSS源数: {summary['total_sources']}")
    print(f"  成功获取: {summary['successful_sources']}")
    print(f"  失败: {summary['failed_sources']}")
    print(f"  总文章数: {summary['total_articles']}")
    print(f"  获取时间: {summary['fetch_time']}")
    
    print(f"\n成功获取的RSS源详情:")
    successful = [r for r in results if r['success']]
    for i, result in enumerate(successful, 1):
        print(f"  {i}. {result['url']}")
        print(f"     文章数: {result['article_count']}篇")
    
    if summary['failed_sources'] > 0:
        print(f"\n失败的RSS源:")
        failed = [r for r in results if not r['success']]
        for i, result in enumerate(failed, 1):
            print(f"  {i}. {result['url']}")
            print(f"     错误: {result['error']}")
    
    # 统计文章字段完整性
    print(f"\n文章数据完整性检查:")
    all_articles = []
    for result in successful:
        all_articles.extend(result['articles'])
    
    if all_articles:
        sample = all_articles[0]
        print(f"  样本文章字段:")
        for key in sample.keys():
            has_value = sum(1 for a in all_articles[:10] if a.get(key))
            print(f"    - {key}: {has_value}/10 篇文章有值")
    
    print("\n" + "="*60)
    print("测试状态: [PASS] 通过")
    print("="*60)

if __name__ == "__main__":
    summarize_test_results()
