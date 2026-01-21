"""
智能体演示 - 交互式示例

这个脚本展示了如何使用智能体系统进行交互式对话

运行方式:
cd backend && source .venv/bin/activate && python3 tests/demo_agent_interactive.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from agents import Agent, AgentConfig
from agents.rss_tools import RSS_TOOLS_DEFINITIONS

# 加载环境变量
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


def create_agent() -> Agent:
    """创建智能体"""
    config = AgentConfig(
        model="qwen3-235b-instruct",
        api_key=os.getenv("QWEN_API_KEY"),
        base_url=os.getenv("QWEN_API_BASE_URL"),
        system_prompt="""你是一个智能新闻助手，可以帮助用户获取和分析最新的RSS新闻。

你有以下能力：
1. 获取最新的RSS新闻（来自FT中文网、BBC中文、极客公园、少数派等）
2. 根据用户的问题智能筛选相关新闻
3. 根据关键词搜索新闻

当用户询问新闻或资讯时，请合理使用这些工具。回答要简洁明了。""",
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


def main():
    """主函数 - 交互式对话"""
    print("="*80)
    print("  智能体交互式演示")
    print("="*80)
    print("\n欢迎使用智能新闻助手！")
    print("\n你可以尝试问我：")
    print("  - 帮我获取最新的新闻")
    print("  - 找一些关于AI的新闻")
    print("  - 搜索包含'科技'关键词的新闻")
    print("  - 或者任何其他问题\n")
    print("输入 'quit' 或 'exit' 退出\n")
    print("="*80 + "\n")
    
    # 创建智能体
    agent = create_agent()
    
    # 对话历史
    conversation_history = []
    
    while True:
        # 获取用户输入
        user_input = input("你: ").strip()
        
        if not user_input:
            continue
        
        if user_input.lower() in ['quit', 'exit', '退出']:
            print("\n再见！")
            break
        
        # 添加到对话历史
        conversation_history.append({
            "role": "user",
            "content": user_input
        })
        
        # 流式输出
        print("\n助手: ", end="", flush=True)
        
        assistant_response = []
        for chunk in agent.chat_stream(conversation_history):
            if chunk["type"] == "text":
                print(chunk["content"], end="", flush=True)
                assistant_response.append(chunk["content"])
            elif chunk["type"] == "tool_call":
                print(chunk["content"], end="", flush=True)
            elif chunk["type"] == "tool_result":
                print(chunk["content"], end="", flush=True)
        
        print("\n")
        
        # 将助手回复添加到历史（简化版，不包含工具调用细节）
        if assistant_response:
            conversation_history.append({
                "role": "assistant",
                "content": ''.join(assistant_response)
            })


if __name__ == "__main__":
    # 设置日志级别为WARNING，避免过多输出
    import logging
    logging.basicConfig(level=logging.WARNING)
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n程序被用户中断。再见！")
    except Exception as e:
        print(f"\n\n发生错误: {e}")
        import traceback
        traceback.print_exc()
