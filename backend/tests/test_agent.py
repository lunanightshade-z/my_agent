"""
智能体测试 - 单轮和多轮工具调用

测试智能体的以下功能：
1. 普通对话（不需要工具）
2. 单轮工具调用
3. 多轮工具调用

运行方式:
cd backend && source .venv/bin/activate && python3 tests/test_agent.py
"""

import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents import Agent, AgentConfig
from agents.rss_tools import RSS_TOOLS_DEFINITIONS

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# 加载环境变量
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def create_agent() -> Agent:
    """创建并配置智能体"""
    config = AgentConfig(
        model="qwen3-235b-instruct",
        api_key=os.getenv("QWEN_API_KEY"),
        base_url=os.getenv("QWEN_API_BASE_URL"),
        system_prompt="""你是一个智能新闻助手，可以帮助用户获取和分析最新的RSS新闻。

你有以下能力：
1. 获取最新的RSS新闻（来自FT中文网、BBC中文、极客公园、少数派等多个优质新闻源）
2. 根据用户的问题智能筛选相关新闻
3. 根据关键词搜索新闻

当用户询问新闻或资讯时，请合理使用这些工具。如果需要多个工具配合使用，可以多次调用工具。""",
        max_tool_iterations=5,
        temperature=0.7
    )
    
    # 创建智能体
    agent = Agent(config)
    
    # 注册RSS工具
    for tool_def in RSS_TOOLS_DEFINITIONS:
        agent.register_tool(
            name=tool_def["name"],
            description=tool_def["description"],
            parameters=tool_def["parameters"],
            function=tool_def["function"]
        )
    
    print(f"✅ 智能体已创建，已注册 {len(RSS_TOOLS_DEFINITIONS)} 个工具")
    print(f"   工具列表: {agent.tool_registry.list_tools()}")
    
    return agent


def print_separator(title: str):
    """打印分隔符"""
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80 + "\n")


def test_normal_chat(agent: Agent):
    """测试1: 普通对话（不需要工具）"""
    print_separator("测试1: 普通对话（不需要工具）")
    
    messages = [
        {"role": "user", "content": "你好，你能做什么？"}
    ]
    
    print("用户: 你好，你能做什么？")
    print("\n助手: ", end="", flush=True)
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


def test_single_tool_call(agent: Agent):
    """测试2: 单轮工具调用"""
    print_separator("测试2: 单轮工具调用 - 获取最新新闻")
    
    messages = [
        {"role": "user", "content": "帮我获取最新的新闻，最多20条"}
    ]
    
    print("用户: 帮我获取最新的新闻，最多20条")
    print("\n助手: ", end="", flush=True)
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_call":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_result":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


def test_filtered_search(agent: Agent):
    """测试3: 使用筛选工具"""
    print_separator("测试3: 单轮工具调用 - 筛选特定主题新闻")
    
    messages = [
        {"role": "user", "content": "帮我找一些关于AI和人工智能的最新新闻"}
    ]
    
    print("用户: 帮我找一些关于AI和人工智能的最新新闻")
    print("\n助手: ", end="", flush=True)
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_call":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_result":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


def test_multi_turn_conversation(agent: Agent):
    """测试4: 多轮对话"""
    print_separator("测试4: 多轮对话")
    
    messages = [
        {"role": "user", "content": "先获取最新新闻，然后从中筛选科技相关的内容"}
    ]
    
    print("用户: 先获取最新新闻，然后从中筛选科技相关的内容")
    print("\n助手: ", end="", flush=True)
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_call":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_result":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


def test_keyword_search(agent: Agent):
    """测试5: 关键词搜索"""
    print_separator("测试5: 关键词搜索")
    
    messages = [
        {"role": "user", "content": "搜索包含'AI'、'人工智能'或'机器学习'关键词的新闻"}
    ]
    
    print("用户: 搜索包含'AI'、'人工智能'或'机器学习'关键词的新闻")
    print("\n助手: ", end="", flush=True)
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_call":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_result":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


def test_complex_query(agent: Agent):
    """测试6: 复杂查询（可能触发多轮工具调用）"""
    print_separator("测试6: 复杂查询")
    
    messages = [
        {"role": "user", "content": "请帮我了解一下今天的热点新闻，特别是科技和AI领域的"}
    ]
    
    print("用户: 请帮我了解一下今天的热点新闻，特别是科技和AI领域的")
    print("\n助手: ", end="", flush=True)
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_call":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_result":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


def run_all_tests():
    """运行所有测试"""
    print("\n" + "🚀 " + "="*76)
    print("  智能体测试套件 - RSS工具集成")
    print("="*78)
    
    # 创建智能体
    agent = create_agent()
    
    # 运行测试
    try:
        # 测试1: 普通对话
        test_normal_chat(agent)
        
        # 测试2: 单轮工具调用
        test_single_tool_call(agent)
        
        # 测试3: 筛选工具
        test_filtered_search(agent)
        
        # 测试4: 多轮对话
        # test_multi_turn_conversation(agent)
        
        # 测试5: 关键词搜索
        # test_keyword_search(agent)
        
        # 测试6: 复杂查询
        # test_complex_query(agent)
        
        print_separator("✅ 所有测试完成")
        
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    run_all_tests()
