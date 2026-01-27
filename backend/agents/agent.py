"""
智能体核心实现

基于OpenAI工具调用标准的智能体，支持流式输出和多轮工具调用
"""
import json
import logging
from typing import Generator, List, Dict, Any, Optional
from dataclasses import dataclass, field
from openai import OpenAI

from .tools import ToolRegistry

logger = logging.getLogger(__name__)


@dataclass
class AgentConfig:
    """智能体配置"""
    model: str = "qwen3-235b-instruct"
    api_key: str = ""
    base_url: str = ""
    system_prompt: str = """你是一个智能助手，可以帮助用户回答问题并使用工具完成任务。

重要原则：
1. 工具调用结果说明：当你调用RSS获取工具时，由于网络原因部分RSS源可能失败，这是正常现象。只要成功获取了部分文章（如6/11个源成功），就应该基于这些结果进行分析和回答，而不是重复调用。
2. 避免重复调用：如果一个工具调用已经返回了有效结果（即使不是全部源都成功），不要使用相同或相似的参数再次调用。
3. 结果利用：充分利用已获取的信息进行分析，即使数据不完整，也要尽力给出有价值的回答。
4. 单次调用原则：对于RSS工具，通常一次调用就能获取足够的信息，无需重复调用相同参数。"""
    max_tool_iterations: int = 5  # 最大工具调用迭代次数
    temperature: float = 0.7


class Agent:
    """
    智能体类
    
    支持功能：
    1. 普通对话流式输出
    2. 单轮工具调用
    3. 多轮工具调用
    4. 自动判断是否需要调用工具
    """
    
    def __init__(self, config: AgentConfig):
        """
        初始化智能体
        
        Args:
            config: 智能体配置
        """
        self.config = config
        self.client = OpenAI(
            api_key=config.api_key,
            base_url=config.base_url
        )
        self.tool_registry = ToolRegistry()
        
        logger.info(f"智能体已初始化，模型: {config.model}")
    
    def register_tool(
        self, 
        name: str,
        description: str,
        parameters: Dict[str, Any],
        function: callable
    ) -> None:
        """
        注册工具到智能体
        
        Args:
            name: 工具名称
            description: 工具描述
            parameters: 参数定义（JSON Schema格式）
            function: 工具执行函数
        """
        self.tool_registry.register(name, description, parameters, function)
    
    def chat_stream(
        self,
        messages: List[Dict[str, str]],
        use_tools: bool = True
    ) -> Generator[Dict[str, Any], None, None]:
        """
        流式聊天（支持工具调用）
        
        Args:
            messages: 对话历史
            use_tools: 是否启用工具调用
            
        Yields:
            流式输出的chunk，格式:
            {
                "type": "text" | "tool_call" | "tool_result" | "done",
                "content": str,
                "tool_name": str (仅type=tool_call时),
                "tool_arguments": dict (仅type=tool_call时),
                "metadata": dict (可选的额外信息)
            }
        """
        # 添加系统提示
        full_messages = [
            {"role": "system", "content": self.config.system_prompt}
        ] + messages
        
        # 当前迭代次数
        iteration = 0
        
        # 添加工具调用历史追踪
        tool_call_history: List[Dict[str, Any]] = []
        
        def is_similar_call(tool_name: str, arguments: Dict[str, Any]) -> bool:
            """检查是否是相似的工具调用"""
            for past_call in tool_call_history:
                if past_call["name"] == tool_name:
                    # 检查参数相似度
                    if tool_name in ["fetch_rss_news", "filter_rss_news"]:
                        # 对于RSS工具，如果主要参数相同则认为相似
                        past_args = past_call["arguments"]
                        if tool_name == "filter_rss_news":
                            # query参数相同视为重复
                            if arguments.get("query") == past_args.get("query"):
                                return True
                        elif tool_name == "fetch_rss_news":
                            # 参数基本相同视为重复
                            return True
            return False
        
        def count_tool_calls(tool_name: str) -> int:
            """统计某个工具的调用次数"""
            return sum(1 for call in tool_call_history if call["name"] == tool_name)
        
        while iteration < self.config.max_tool_iterations:
            iteration += 1
            logger.info(f"开始第 {iteration} 轮对话")
            
            # 准备工具定义
            tools = None
            if use_tools and self.tool_registry.list_tools():
                tools = self.tool_registry.get_all_tools_for_openai()
            
            # 调用LLM
            try:
                completion = self.client.chat.completions.create(
                    model=self.config.model,
                    messages=full_messages,
                    tools=tools,
                    temperature=self.config.temperature,
                    stream=True
                )
                
                # 收集完整的响应用于工具调用
                collected_messages = []
                collected_tool_calls = []
                current_tool_call = None
                
                # 流式处理响应
                for chunk in completion:
                    if not chunk.choices:
                        continue
                    
                    delta = chunk.choices[0].delta
                    finish_reason = chunk.choices[0].finish_reason
                    
                    # 处理文本内容
                    if delta.content:
                        collected_messages.append(delta.content)
                        yield {
                            "type": "text",
                            "content": delta.content
                        }
                    
                    # 处理工具调用
                    if delta.tool_calls:
                        for tool_call_delta in delta.tool_calls:
                            # 开始新的工具调用
                            if tool_call_delta.index is not None:
                                if current_tool_call is None or tool_call_delta.index != current_tool_call.get('index'):
                                    if current_tool_call:
                                        collected_tool_calls.append(current_tool_call)
                                    current_tool_call = {
                                        'index': tool_call_delta.index,
                                        'id': tool_call_delta.id or '',
                                        'type': 'function',
                                        'function': {
                                            'name': '',
                                            'arguments': ''
                                        }
                                    }
                            
                            # 更新工具调用信息
                            if current_tool_call and tool_call_delta.function:
                                if tool_call_delta.function.name:
                                    current_tool_call['function']['name'] = tool_call_delta.function.name
                                if tool_call_delta.function.arguments:
                                    current_tool_call['function']['arguments'] += tool_call_delta.function.arguments
                    
                    # 处理结束
                    if finish_reason:
                        if current_tool_call:
                            collected_tool_calls.append(current_tool_call)
                            current_tool_call = None
                
                # 检查是否有工具调用
                if collected_tool_calls:
                    logger.info(f"检测到 {len(collected_tool_calls)} 个工具调用")
                    
                    # 构造助手消息（包含工具调用）
                    # 注意：某些模型（如 Kimi）在工具调用后期望有 content 字段
                    # 为了兼容性，确保 content 不为 None
                    assistant_content = ''.join(collected_messages) if collected_messages else ""
                    
                    assistant_message = {
                        "role": "assistant",
                        "content": assistant_content,
                        "tool_calls": collected_tool_calls
                    }
                    full_messages.append(assistant_message)
                    
                    # 执行每个工具调用
                    tool_results = []
                    for tool_call in collected_tool_calls:
                        tool_name = tool_call['function']['name']
                        tool_arguments_str = tool_call['function']['arguments']
                        
                        # 解析参数
                        try:
                            tool_arguments = json.loads(tool_arguments_str)
                        except json.JSONDecodeError as e:
                            logger.error(f"工具参数解析失败: {e}")
                            tool_arguments = {}
                        
                        # 检查是否是重复调用
                        if is_similar_call(tool_name, tool_arguments):
                            call_count = count_tool_calls(tool_name)
                            if call_count >= 2:  # 最多允许2次相似调用
                                warning_msg = f"工具 {tool_name} 已调用{call_count}次且参数相似，跳过此次调用。请基于已有结果进行分析。"
                                logger.warning(warning_msg)
                                
                                tool_results.append({
                                    "tool_call_id": tool_call['id'],
                                    "role": "tool",
                                    "name": tool_name,
                                    "content": warning_msg
                                })
                                
                                yield {
                                    "type": "tool_result",
                                    "tool_name": tool_name,
                                    "content": f"⚠️ {warning_msg}\n"
                                }
                                continue
                        
                        # 记录工具调用
                        tool_call_history.append({
                            "name": tool_name,
                            "arguments": tool_arguments
                        })
                        
                        # 通知用户工具调用
                        yield {
                            "type": "tool_call",
                            "tool_name": tool_name,
                            "tool_arguments": tool_arguments,
                            "content": f"\n\n🔧 调用工具: {tool_name}\n参数: {json.dumps(tool_arguments, ensure_ascii=False, indent=2)}\n"
                        }
                        
                        # 执行工具
                        try:
                            result = self.tool_registry.execute_tool(tool_name, tool_arguments)
                            
                            # 将结果转换为字符串
                            if isinstance(result, (dict, list)):
                                result_str = json.dumps(result, ensure_ascii=False, indent=2)
                            else:
                                result_str = str(result)
                            
                            tool_results.append({
                                "tool_call_id": tool_call['id'],
                                "role": "tool",
                                "name": tool_name,
                                "content": result_str
                            })
                            
                            # 通知用户工具结果
                            yield {
                                "type": "tool_result",
                                "tool_name": tool_name,
                                "content": result_str,  # 包含完整的工具执行结果
                                "metadata": {
                                    "result_preview": result_str[:200] + "..." if len(result_str) > 200 else result_str
                                }
                            }
                            
                        except Exception as e:
                            error_msg = f"工具执行失败: {str(e)}"
                            logger.error(f"工具 '{tool_name}' 执行失败: {e}")
                            
                            tool_results.append({
                                "tool_call_id": tool_call['id'],
                                "role": "tool",
                                "name": tool_name,
                                "content": error_msg
                            })
                            
                            yield {
                                "type": "tool_result",
                                "tool_name": tool_name,
                                "content": error_msg,  # 包含完整的错误信息
                                "metadata": {
                                    "error": True
                                }
                            }
                    
                    # 将工具结果添加到消息历史
                    full_messages.extend(tool_results)
                    
                    # 继续下一轮对话，让模型基于工具结果回答
                    continue
                
                else:
                    # 没有工具调用，正常结束
                    if collected_messages:
                        # 将助手回复添加到历史
                        full_messages.append({
                            "role": "assistant",
                            "content": ''.join(collected_messages)
                        })
                    
                    yield {
                        "type": "done",
                        "content": ""
                    }
                    break
                    
            except Exception as e:
                logger.error(f"聊天流处理失败: {e}")
                yield {
                    "type": "error",
                    "content": f"错误: {str(e)}"
                }
                break
        
        if iteration >= self.config.max_tool_iterations:
            yield {
                "type": "done",
                "content": "\n\n⚠️ 已达到最大工具调用次数限制"
            }
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        use_tools: bool = True
    ) -> str:
        """
        非流式聊天（支持工具调用）
        
        Args:
            messages: 对话历史
            use_tools: 是否启用工具调用
            
        Returns:
            完整的回复文本
        """
        response_parts = []
        
        for chunk in self.chat_stream(messages, use_tools):
            if chunk["type"] in ["text", "tool_call", "tool_result"]:
                response_parts.append(chunk["content"])
        
        return ''.join(response_parts)
