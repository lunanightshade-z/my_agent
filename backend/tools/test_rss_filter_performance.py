"""
RSS智能筛选服务 - 多线程性能测试

测试多线程筛选的性能和效果
"""
import sys
import time
from pathlib import Path

# 添加路径
sys.path.insert(0, str(Path(__file__).parent))

from rss_filter_service import filter_rss_from_file


def test_performance_comparison():
    """性能对比测试"""
    print("="*70)
    print("RSS智能筛选 - 多线程性能测试")
    print("="*70)
    
    user_query = "关于人工智能、AI技术和机器学习的发展"
    json_file = str(Path(__file__).parent / "rss_news_output.json")
    
    # 测试配置
    test_configs = [
        {"max_workers": 1, "batch_size": 10, "name": "单线程"},
        {"max_workers": 3, "batch_size": 10, "name": "3线程"},
        {"max_workers": 5, "batch_size": 10, "name": "5线程"},
    ]
    
    results = []
    
    for config in test_configs:
        print(f"\n{'='*70}")
        print(f"测试场景: {config['name']} (batch_size={config['batch_size']})")
        print(f"{'='*70}\n")
        
        start_time = time.time()
        
        try:
            result = filter_rss_from_file(
                json_file=json_file,
                user_query=user_query,
                min_relevance=6,
                max_workers=config['max_workers'],
                batch_size=config['batch_size'],
                show_progress=True
            )
            
            end_time = time.time()
            elapsed_time = end_time - start_time
            
            results.append({
                'config': config['name'],
                'workers': config['max_workers'],
                'time': elapsed_time,
                'matched': result.matched_articles,
                'total': result.total_articles
            })
            
            print(f"\n✓ 完成: 耗时 {elapsed_time:.2f}秒")
            print(f"  匹配文章: {result.matched_articles}/{result.total_articles}")
            
        except Exception as e:
            print(f"\n✗ 失败: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # 打印性能对比
    print(f"\n{'='*70}")
    print("性能对比总结")
    print(f"{'='*70}\n")
    
    print(f"{'配置':<15} {'线程数':<10} {'耗时(秒)':<12} {'匹配文章':<15} {'加速比'}")
    print("-"*70)
    
    base_time = results[0]['time'] if results else 1
    
    for r in results:
        speedup = base_time / r['time']
        print(f"{r['config']:<15} {r['workers']:<10} {r['time']:<12.2f} "
              f"{r['matched']}/{r['total']:<10} {speedup:.2f}x")
    
    print(f"\n{'='*70}")


def test_with_different_queries():
    """测试不同查询的筛选效果"""
    print("\n\n" + "="*70)
    print("多查询测试 (使用5线程)")
    print("="*70)
    
    json_file = str(Path(__file__).parent / "rss_news_output.json")
    
    queries = [
        "人工智能和机器学习技术",
        "环境保护和生态建设",
        "经济发展和市场动态"
    ]
    
    for i, query in enumerate(queries, 1):
        print(f"\n--- 测试 {i}/{len(queries)}: {query} ---\n")
        
        try:
            result = filter_rss_from_file(
                json_file=json_file,
                user_query=query,
                min_relevance=6,
                max_workers=5,
                batch_size=10,
                show_progress=True
            )
            
            print(f"\n匹配结果: {result.matched_articles} 篇相关文章")
            
            # 显示前3篇
            if result.matched_articles > 0:
                print("\n前3篇相关文章:")
                for j, article in enumerate(result.filtered_articles[:3], 1):
                    print(f"  {j}. {article.title[:50]}...")
                    print(f"     相关度: {article.relevance_score}/10 - {article.relevance_reason}")
            
        except Exception as e:
            print(f"查询失败: {str(e)}")


if __name__ == "__main__":
    # 运行性能对比测试
    test_performance_comparison()
    
    # 运行多查询测试
    test_with_different_queries()
    
    print("\n\n" + "="*70)
    print("所有测试完成!")
    print("="*70)
