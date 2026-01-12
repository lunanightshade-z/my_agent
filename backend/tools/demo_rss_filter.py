"""
RSS智能筛选服务 - 简单演示

这个脚本演示如何使用大模型筛选RSS新闻
"""
import sys
from pathlib import Path

# 添加路径
sys.path.insert(0, str(Path(__file__).parent))

from rss_filter_service import filter_rss_from_file


def demo_simple():
    """简单演示"""
    print("="*60)
    print("RSS智能筛选服务演示")
    print("="*60)
    
    # 示例查询
    user_query = "关于人工智能和AI技术的发展"
    
    print(f"\n用户需求: {user_query}")
    print(f"正在从RSS数据文件中筛选...")
    
    try:
        # 使用完整路径
        json_path = Path(__file__).parent / "rss_news_output.json"
        result = filter_rss_from_file(
            str(json_path),
            user_query,
            min_relevance=6
        )
        
        print(f"\n筛选结果:")
        print(f"  总文章数: {result.total_articles}")
        print(f"  匹配文章数: {result.matched_articles}")
        
        if result.matched_articles > 0:
            print(f"\n前5篇相关文章:")
            for i, article in enumerate(result.filtered_articles[:5], 1):
                print(f"\n{i}. {article.title}")
                print(f"   来源: {article.source}")
                print(f"   相关度: {article.relevance_score}/10")
                print(f"   原因: {article.relevance_reason}")
        else:
            print("\n未找到相关文章")
        
        print("\n" + "="*60)
        print("演示完成!")
        
    except Exception as e:
        print(f"\n错误: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    demo_simple()
