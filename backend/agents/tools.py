"""
工具注册和管理模块

提供工具的注册、管理和OpenAI格式转换功能
"""
import json
import logging
from typing import Callable, Dict, Any, List, Optional
from dataclasses import dataclass, field
from inspect import signature, Parameter

logger = logging.getLogger(__name__)


@dataclass
class ToolDefinition:
    """工具定义"""
    name: str
    description: str
    parameters: Dict[str, Any]
    function: Callable
    
    def to_openai_format(self) -> Dict[str, Any]:
        """转换为OpenAI工具格式"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters
            }
        }


class ToolRegistry:
    """工具注册器"""
    
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        
    def register(
        self, 
        name: str,
        description: str,
        parameters: Dict[str, Any],
        function: Callable
    ) -> None:
        """
        注册工具
        
        Args:
            name: 工具名称
            description: 工具描述
            parameters: 参数定义（JSON Schema格式）
            function: 工具执行函数
        """
        if name in self._tools:
            logger.warning(f"工具 '{name}' 已存在，将被覆盖")
            
        tool_def = ToolDefinition(
            name=name,
            description=description,
            parameters=parameters,
            function=function
        )
        self._tools[name] = tool_def
        logger.info(f"工具已注册: {name}")
        
    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        """获取工具定义"""
        return self._tools.get(name)
    
    def execute_tool(self, name: str, arguments: Dict[str, Any]) -> Any:
        """
        执行工具
        
        Args:
            name: 工具名称
            arguments: 工具参数
            
        Returns:
            工具执行结果
        """
        tool = self.get_tool(name)
        if not tool:
            raise ValueError(f"工具 '{name}' 不存在")
        
        try:
            logger.info(f"执行工具: {name}, 参数: {arguments}")
            result = tool.function(**arguments)
            logger.info(f"工具 '{name}' 执行成功")
            return result
        except Exception as e:
            logger.error(f"工具 '{name}' 执行失败: {str(e)}")
            raise
    
    def get_all_tools_for_openai(self) -> List[Dict[str, Any]]:
        """获取所有工具的OpenAI格式定义"""
        return [tool.to_openai_format() for tool in self._tools.values()]
    
    def list_tools(self) -> List[str]:
        """列出所有已注册的工具名称"""
        return list(self._tools.keys())


def tool_decorator(
    name: str,
    description: str,
    parameters: Dict[str, Any]
):
    """
    工具装饰器，用于快速注册工具函数
    
    Args:
        name: 工具名称
        description: 工具描述
        parameters: 参数定义（JSON Schema格式）
    
    Example:
        @tool_decorator(
            name="get_weather",
            description="获取天气信息",
            parameters={
                "type": "object",
                "properties": {
                    "city": {
                        "type": "string",
                        "description": "城市名称"
                    }
                },
                "required": ["city"]
            }
        )
        def get_weather(city: str) -> str:
            return f"{city}的天气是晴天"
    """
    def decorator(func: Callable):
        # 在实际使用时需要将装饰的函数注册到全局registry
        func._tool_name = name
        func._tool_description = description
        func._tool_parameters = parameters
        return func
    return decorator
