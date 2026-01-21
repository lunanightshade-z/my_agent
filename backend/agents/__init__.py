"""
智能体模块

提供基于OpenAI工具调用标准的智能体实现，支持：
- 流式输出
- 单轮和多轮工具调用
- 工具注册和管理
"""

from .agent import Agent, AgentConfig
from .tools import ToolRegistry, tool_decorator

__all__ = [
    'Agent',
    'AgentConfig',
    'ToolRegistry',
    'tool_decorator'
]
