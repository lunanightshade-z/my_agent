"""
测试 Kimi API 集成
"""
import asyncio
import sys
import os

# 添加项目路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv()

from backend.app.infrastructure.llm.openrouter_client import get_openrouter_client


async def test_kimi_stream():
    """测试 Kimi 流式响应"""
    print("=" * 50)
    print("测试 Kimi 流式响应")
    print("=" * 50)
    
    client = get_openrouter_client()
    
    messages = [
        {"role": "user", "content": "什么是大模型？请简要回答。"}
    ]
    
    print("\n🤖 正在调用 Kimi API...\n")
    
    full_response = ""
    full_thinking = ""
    
    async for chunk in client.chat_stream(messages, thinking="disabled"):
        chunk_type = chunk.get("type")
        content = chunk.get("content", "")
        
        if chunk_type == "thinking":
            full_thinking += content
            print(f"💭 思考: {content}", end="", flush=True)
        elif chunk_type == "content":
            full_response += content
            print(content, end="", flush=True)
        elif chunk_type == "error":
            print(f"\n❌ 错误: {content}")
            return False
    
    print("\n")
    print("=" * 50)
    print("✓ 测试完成")
    print(f"回答长度: {len(full_response)} 字符")
    if full_thinking:
        print(f"思考长度: {len(full_thinking)} 字符")
    print("=" * 50)
    
    return True


async def test_kimi_with_thinking():
    """测试 Kimi 带思考模式的流式响应"""
    print("\n" + "=" * 50)
    print("测试 Kimi 思考模式")
    print("=" * 50)
    
    client = get_openrouter_client()
    
    messages = [
        {"role": "user", "content": "解释一下量子纠缠的原理"}
    ]
    
    print("\n🤖 正在调用 Kimi API (思考模式)...\n")
    
    full_response = ""
    full_thinking = ""
    
    async for chunk in client.chat_stream(messages, thinking="enabled"):
        chunk_type = chunk.get("type")
        content = chunk.get("content", "")
        
        if chunk_type == "thinking":
            full_thinking += content
            print(f"💭 {content}", end="", flush=True)
        elif chunk_type == "content":
            full_response += content
            print(content, end="", flush=True)
        elif chunk_type == "error":
            print(f"\n❌ 错误: {content}")
            return False
    
    print("\n")
    print("=" * 50)
    print("✓ 测试完成")
    print(f"回答长度: {len(full_response)} 字符")
    if full_thinking:
        print(f"思考长度: {len(full_thinking)} 字符")
    print("=" * 50)
    
    return True


async def main():
    """运行所有测试"""
    print("\n🚀 开始测试 Kimi API 集成\n")
    
    # 测试基本流式响应
    result1 = await test_kimi_stream()
    
    if result1:
        # 测试思考模式
        result2 = await test_kimi_with_thinking()
        
        if result2:
            print("\n✅ 所有测试通过！")
        else:
            print("\n❌ 思考模式测试失败")
    else:
        print("\n❌ 基本流式测试失败")


if __name__ == "__main__":
    asyncio.run(main())
