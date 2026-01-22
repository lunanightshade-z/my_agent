"""
测试模型自动检测功能

验证根据base_url自动选择正确的模型
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.services.agent_service import _detect_model_from_base_url, ZHIPU_MODEL_NAME, AGENT_MODEL_NAME


def test_zhipu_detection():
    """测试智谱AI URL检测"""
    print("=" * 60)
    print("测试1：智谱AI URL检测")
    print("=" * 60)
    
    test_cases = [
        ("https://open.bigmodel.cn/api/paas/v4/chat/completions", ZHIPU_MODEL_NAME),
        ("http://open.bigmodel.cn/api/paas/v4/chat/completions", ZHIPU_MODEL_NAME),
        ("https://api.zhipuai.com/v4/chat/completions", ZHIPU_MODEL_NAME),
        ("https://BIGMODEL.CN/api/paas/v4/chat/completions", ZHIPU_MODEL_NAME),  # 大小写不敏感
    ]
    
    for url, expected_model in test_cases:
        result = _detect_model_from_base_url(url)
        status = "✅" if result == expected_model else "❌"
        print(f"{status} URL: {url}")
        print(f"   期望模型: {expected_model}, 实际模型: {result}")
        assert result == expected_model, f"URL {url} 应该检测为 {expected_model}，但得到 {result}"
    
    print("✅ 所有智谱AI URL检测通过\n")


def test_qwen_detection():
    """测试通义千问URL检测"""
    print("=" * 60)
    print("测试2：通义千问URL检测")
    print("=" * 60)
    
    test_cases = [
        ("http://10.0.2.232:12345/v1/chat/completions", AGENT_MODEL_NAME),
        ("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", AGENT_MODEL_NAME),
        ("http://localhost:8000/v1/chat/completions", AGENT_MODEL_NAME),
        ("", AGENT_MODEL_NAME),  # 空URL使用默认
    ]
    
    for url, expected_model in test_cases:
        result = _detect_model_from_base_url(url)
        status = "✅" if result == expected_model else "❌"
        print(f"{status} URL: {url}")
        print(f"   期望模型: {expected_model}, 实际模型: {result}")
        assert result == expected_model, f"URL {url} 应该检测为 {expected_model}，但得到 {result}"
    
    print("✅ 所有通义千问URL检测通过\n")


def summary():
    """输出测试总结"""
    print("=" * 60)
    print("测试总结")
    print("=" * 60)
    print(f"""
✅ 模型自动检测功能正常工作

检测规则：
- 如果base_url包含 "bigmodel.cn" 或 "zhipuai" → 使用 {ZHIPU_MODEL_NAME}
- 其他情况 → 使用 {AGENT_MODEL_NAME}

这样确保了：
1. 当使用智谱AI API时，自动使用智谱AI支持的模型
2. 当使用通义千问API时，使用qwen3-235b-instruct模型
3. 避免了模型名称不匹配导致的API调用失败
    """)


if __name__ == "__main__":
    try:
        test_zhipu_detection()
        test_qwen_detection()
        summary()
        
        print("=" * 60)
        print("🎉 所有测试通过！模型自动检测功能正常")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n❌ 测试失败: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
