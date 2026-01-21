"""
测试ArXiv论文检索工具

测试基于关键词检索ArXiv论文的功能

使用方法:
cd backend && source .venv/bin/activate && python3 tests/test_arxiv_fetcher.py
"""
import sys
from pathlib import Path
import json

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from tools.arxiv_fetcher import ArxivFetcher


def test_basic_search():
    """测试基本搜索功能"""
    print("=" * 80)
    print("测试1: 基本关键词搜索")
    print("=" * 80)
    
    fetcher = ArxivFetcher()
    
    # 搜索"machine learning"相关论文
    result = fetcher.search_by_keywords("machine learning", max_results=5)
    
    print(f"\n查询关键词: {result.query}")
    print(f"检索到论文数: {len(result.papers)}")
    print(f"检索时间: {result.search_time}\n")
    
    for i, paper in enumerate(result.papers, 1):
        print(f"\n【论文 {i}】")
        print(f"ArXiv ID: {paper.arxiv_id}")
        print(f"标题: {paper.title}")
        print(f"作者: {', '.join(paper.authors[:3])}")
        if len(paper.authors) > 3:
            print(f"      ... 共 {len(paper.authors)} 位作者")
        print(f"发布日期: {paper.published}")
        print(f"主要分类: {paper.primary_category}")
        print(f"摘要: {paper.summary[:200]}...")
        print(f"ArXiv链接: {paper.arxiv_url}")
        print("-" * 80)


def test_custom_query():
    """测试自定义查询语法"""
    print("\n" + "=" * 80)
    print("测试2: 自定义查询语法（标题中包含transformer）")
    print("=" * 80)
    
    fetcher = ArxivFetcher()
    
    # 只在标题中搜索
    result = fetcher.search("ti:transformer", max_results=3)
    
    print(f"\n查询关键词: {result.query}")
    print(f"检索到论文数: {len(result.papers)}\n")
    
    for i, paper in enumerate(result.papers, 1):
        print(f"{i}. {paper.title}")
        print(f"   {paper.arxiv_url}\n")


def test_large_result():
    """测试检索大量论文"""
    print("\n" + "=" * 80)
    print("测试3: 检索大量论文（20篇）")
    print("=" * 80)
    
    fetcher = ArxivFetcher()
    
    result = fetcher.search_by_keywords("deep learning", max_results=20)
    
    print(f"\n查询关键词: {result.query}")
    print(f"检索到论文数: {len(result.papers)}")
    
    # 统计分类分布
    category_count = {}
    for paper in result.papers:
        if paper.primary_category:
            category_count[paper.primary_category] = category_count.get(paper.primary_category, 0) + 1
    
    print(f"\n分类分布:")
    for category, count in sorted(category_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  {category}: {count}篇")


def test_export_json():
    """测试导出JSON格式"""
    print("\n" + "=" * 80)
    print("测试4: 导出JSON格式")
    print("=" * 80)
    
    fetcher = ArxivFetcher()
    
    result = fetcher.search_by_keywords("neural network", max_results=3)
    
    # 转换为字典并导出JSON
    result_dict = result.to_dict()
    json_str = json.dumps(result_dict, indent=2, ensure_ascii=False)
    
    print(f"\nJSON格式输出（前500字符）:")
    print(json_str[:500])
    print("...")
    
    # 保存到文件
    output_file = Path(__file__).parent / "arxiv_test_output.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result_dict, f, indent=2, ensure_ascii=False)
    
    print(f"\n完整结果已保存到: {output_file}")


def test_error_handling():
    """测试错误处理"""
    print("\n" + "=" * 80)
    print("测试5: 错误处理")
    print("=" * 80)
    
    fetcher = ArxivFetcher()
    
    # 测试空查询
    try:
        fetcher.search("", max_results=5)
        print("❌ 空查询应该抛出异常")
    except ValueError as e:
        print(f"✅ 空查询正确抛出异常: {e}")
    
    # 测试无效的max_results
    try:
        fetcher.search("machine learning", max_results=-1)
        print("❌ 负数max_results应该抛出异常")
    except ValueError as e:
        print(f"✅ 负数max_results正确抛出异常: {e}")


def main():
    """主测试函数"""
    print("\n" + "=" * 80)
    print("ArXiv论文检索工具测试")
    print("=" * 80)
    
    try:
        # 测试1: 基本搜索
        test_basic_search()
        
        # 测试2: 自定义查询
        test_custom_query()
        
        # 测试3: 大量结果
        test_large_result()
        
        # 测试4: JSON导出
        test_export_json()
        
        # 测试5: 错误处理
        test_error_handling()
        
        print("\n" + "=" * 80)
        print("✅ 所有测试完成！")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ 测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
