"""
RSS智能筛选服务 - 快速演示

演示多线程筛选功能和进度条显示
"""
import sys
from pathlib import Path

# 添加路径
sys.path.insert(0, str(Path(__file__).parent))

from rss_filter_service import filter_rss_from_file


def main():
    """主演示函数"""
    print("="*70)
    print("RSS智能筛选服务 - 多线程快速演示")
    print("="*70)
    
    # 配置
    json_file = str(Path(__file__).parent / "rss_news_output.json")
    user_query = "关于人工智能、AI技术、深度学习的最新发展和应用"
    
    print(f"\n查询需求: {user_query}")
    print(f"数据文件: {json_file}")
    print(f"\n开始筛选...\n")
    
    try:
        # 使用多线程筛选（5个线程并发）
        result = filter_rss_from_file(
            json_file=json_file,
            user_query=user_query,
            min_relevance=6,
            max_workers=5,       # 5个并发线程
            batch_size=10,       # 每批10篇文章
            show_progress=True   # 显示进度条
        )
        
        # 显示结果
        print(f"\n{'='*70}")
        print("筛选结果")
        print(f"{'='*70}\n")
        
        print(f"总文章数: {result.total_articles}")
        print(f"匹配文章数: {result.matched_articles}")
        print(f"匹配率: {result.matched_articles/result.total_articles*100:.1f}%")
        
        if result.matched_articles > 0:
            print(f"\n前10篇相关文章:\n")
            
            for i, article in enumerate(result.filtered_articles[:10], 1):
                print(f"{i}. 【{article.source}】{article.title}")
                print(f"   相关度: {'★' * article.relevance_score} {article.relevance_score}/10")
                print(f"   理由: {article.relevance_reason}")
                print(f"   链接: {article.link[:70]}...")
                print()
            
            # 保存结果
            import json
            output_file = "quick_filter_result.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)
            print(f"完整结果已保存到: {output_file}")
        else:
            print("\n未找到相关文章")
        
        print(f"\n{'='*70}")
        print("演示完成!")
        print(f"{'='*70}")
        
    except FileNotFoundError:
        print(f"\n错误: 找不到文件 {json_file}")
        print("请先运行 get_rss_news.py 生成RSS数据文件")
    except Exception as e:
        print(f"\n错误: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
