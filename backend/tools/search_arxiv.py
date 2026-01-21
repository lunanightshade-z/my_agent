#!/usr/bin/env python3
"""
ArXiv论文检索命令行工具

快速检索ArXiv论文的便捷脚本

使用方法:
    python3 backend/tools/search_arxiv.py "machine learning" --max 10
    python3 backend/tools/search_arxiv.py "transformer" --max 5 --title-only
    python3 backend/tools/search_arxiv.py "deep learning" --max 20 --json output.json
"""
import sys
import argparse
import json
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from tools.arxiv_fetcher import ArxivFetcher


def main():
    parser = argparse.ArgumentParser(
        description="ArXiv论文检索工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  %(prog)s "machine learning" --max 10
  %(prog)s "transformer" --max 5 --title-only
  %(prog)s "deep learning" --max 20 --json papers.json
        """
    )
    
    parser.add_argument(
        "keywords",
        help="搜索关键词"
    )
    
    parser.add_argument(
        "--max",
        type=int,
        default=10,
        help="最大返回结果数（默认: 10）"
    )
    
    parser.add_argument(
        "--title-only",
        action="store_true",
        help="仅在标题中搜索"
    )
    
    parser.add_argument(
        "--json",
        type=str,
        metavar="FILE",
        help="将结果保存为JSON文件"
    )
    
    parser.add_argument(
        "--sort",
        choices=["relevance", "lastUpdatedDate", "submittedDate"],
        default="relevance",
        help="排序方式（默认: relevance）"
    )
    
    args = parser.parse_args()
    
    try:
        # 创建检索器
        fetcher = ArxivFetcher()
        
        # 执行搜索
        if args.title_only:
            result = fetcher.search(f"ti:{args.keywords}", max_results=args.max, sort_by=args.sort)
        else:
            result = fetcher.search_by_keywords(args.keywords, max_results=args.max)
        
        # 显示结果
        print(f"\n查询关键词: {result.query}")
        print(f"检索到论文数: {len(result.papers)}")
        print(f"检索时间: {result.search_time}\n")
        print("=" * 80)
        
        for i, paper in enumerate(result.papers, 1):
            print(f"\n【论文 {i}/{len(result.papers)}】")
            print(f"ArXiv ID: {paper.arxiv_id}")
            print(f"标题: {paper.title}")
            print(f"作者: {', '.join(paper.authors[:3])}")
            if len(paper.authors) > 3:
                print(f"      ... 共 {len(paper.authors)} 位作者")
            if paper.published:
                print(f"发布日期: {paper.published[:10]}")
            if paper.primary_category:
                print(f"主要分类: {paper.primary_category}")
            print(f"摘要: {paper.summary[:300]}...")
            print(f"ArXiv链接: {paper.arxiv_url}")
            if paper.pdf_url:
                print(f"PDF链接: {paper.pdf_url}")
            print("-" * 80)
        
        # 保存JSON
        if args.json:
            output_file = Path(args.json)
            result_dict = result.to_dict()
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(result_dict, f, indent=2, ensure_ascii=False)
            print(f"\n✅ 结果已保存到: {output_file}")
        
    except ValueError as e:
        print(f"❌ 参数错误: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"❌ 检索失败: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
