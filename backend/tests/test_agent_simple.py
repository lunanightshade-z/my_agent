"""
智能体简化测试 - 快速验证功能

运行方式:
cd backend && source .venv/bin/activate && python3 tests/test_agent_simple.py
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
    level=logging.WARNING,  # 只显示警告和错误
    format='%(levelname)s - %(message)s'
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

当用户询问新闻或资讯时，请合理使用这些工具。""",
        max_tool_iterations=5,
        temperature=0.7
    )
    
    agent = Agent(config)
    
    # 注册RSS工具
    for tool_def in RSS_TOOLS_DEFINITIONS:
        agent.register_tool(
            name=tool_def["name"],
            description=tool_def["description"],
            parameters=tool_def["parameters"],
            function=tool_def["function"]
        )
    
    return agent


def test_case(agent: Agent, title: str, user_message: str):
    """测试单个案例"""
    print("\n" + "="*80)
    print(f"【{title}】")
    print("="*80)
    print(f"\n用户: {user_message}\n")
    print("助手: ", end="", flush=True)
    
    messages = [{"role": "user", "content": user_message}]
    
    for chunk in agent.chat_stream(messages):
        if chunk["type"] == "text":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_call":
            print(chunk["content"], end="", flush=True)
        elif chunk["type"] == "tool_result":
            print(chunk["content"], end="", flush=True)
    
    print("\n")


if __name__ == "__main__":
    print("\n🚀 智能体快速测试\n")
    
    agent = create_agent()
    print(f"✅ 智能体已创建，已注册 {len(agent.tool_registry.list_tools())} 个工具\n")
    
    # 测试1: 普通对话
    test_case(agent, "测试1：普通对话", "你好，介绍一下你的功能")
    
    # 测试2: 单轮工具调用 - 获取新闻
    test_case(agent, "测试2：单轮工具调用", "帮我获取10条最新新闻")
    
    # 测试3: 单轮工具调用 - 筛选新闻
    test_case(agent, "测试3：筛选特定主题", "找一些关于科技的新闻")
    
    # 测试4: 可能触发多轮调用的复杂查询
    # test_case(agent, "测试4：复杂查询", "请总结今天科技领域最重要的3条新闻")
    
    print("="*80)
    print("✅ 测试完成")
    print("="*80)
