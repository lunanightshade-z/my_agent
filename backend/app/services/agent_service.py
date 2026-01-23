"""
智能体服务层
集成Agent工具调用功能
"""
import os
import sys
from pathlib import Path
from textwrap import dedent
from typing import AsyncGenerator, Dict, Generator, List, Any

from sqlalchemy.orm import Session

from app.config import settings
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.infrastructure.logging.setup import get_logger

# ==================== 配置常量 ====================
# Agent模型配置
AGENT_MODEL_NAME = "qwen3-235b-instruct"  # 默认模型（用于通义千问）
AGENT_MAX_TOOL_ITERATIONS = 10
AGENT_TEMPERATURE = 0.7

# 智谱AI模型配置（当base_url指向智谱AI时使用）
ZHIPU_MODEL_NAME = "glm-4-flash"  # 智谱AI支持的模型

# Agent系统提示词
AGENT_SYSTEM_PROMPT = dedent("""
    你是一个智能新闻助手，可以帮助用户获取和分析最新的RSS新闻。

    你有以下能力：
    1. 获取最新的RSS新闻（来自FT中文网、BBC中文、极客公园、少数派等多个优质新闻源）
    2. 根据用户的问题智能筛选相关新闻
    3. 根据关键词搜索新闻

    重要原则：
    1. 工具调用结果说明：当你调用RSS获取工具时，由于网络原因部分RSS源可能失败，这是正常现象。只要成功获取了部分文章（如6/11个源成功），就应该基于这些结果进行分析和回答，而不是重复调用。
    2. 避免重复调用：如果一个工具调用已经返回了有效结果（即使不是全部源都成功），不要使用相同或相似的参数再次调用。
    3. 结果利用：充分利用已获取的信息进行分析，即使数据不完整，也要尽力给出有价值的回答。
    4. 单次调用原则：对于RSS工具，通常一次调用就能获取足够的信息，无需重复调用相同参数。

    当用户询问新闻或资讯时，请合理使用这些工具。回答要简洁明了，结构化展示。

    # 你的输出
    你在最终根据搜索结果进行输出时，需要用markdown链接形式，将所有搜索结果链接起来，并添加标题和描述。
    ### 示例
    1. [标题1](链接1)：描述1
    2. [标题2](链接2)：描述2
    3. [标题3](链接3)：描述3
    ...

    """
).strip()

# 环境变量配置键
ENV_QWEN_API_KEY = "QWEN_API_KEY"
ENV_QWEN_API_BASE_URL = "QWEN_API_BASE_URL"

# 标题生成配置
TITLE_MAX_LENGTH = 20
TITLE_ELLIPSIS = "..."
DEFAULT_CONVERSATION_TITLE = "智能体对话"

# ==================== 模块导入 ====================
# 导入智能体模块 - 修正路径
backend_path = Path(__file__).parent.parent.parent
sys.path.insert(0, str(backend_path))

try:
    from agents import Agent, AgentConfig
    from agents.rss_tools import RSS_TOOLS_DEFINITIONS
except ImportError as e:
    # Docker环境下可能需要不同的路径
    agents_path = backend_path / "agents"
    if agents_path.exists():
        sys.path.insert(0, str(agents_path.parent))
        from agents import Agent, AgentConfig
        from agents.rss_tools import RSS_TOOLS_DEFINITIONS
    else:
        raise ImportError(f"无法导入agents模块: {e}\n路径: {backend_path}")

logger = get_logger(__name__)


def _detect_model_from_base_url(base_url: str) -> str:
    """
    根据base_url自动检测应该使用的模型名称
    
    Args:
        base_url: API基础URL
        
    Returns:
        模型名称
    """
    if not base_url:
        return AGENT_MODEL_NAME
    
    # 如果base_url包含智谱AI的域名，使用智谱AI的模型
    if "bigmodel.cn" in base_url.lower() or "zhipuai" in base_url.lower():
        logger.info(f"检测到智谱AI API，使用模型: {ZHIPU_MODEL_NAME}")
        return ZHIPU_MODEL_NAME
    
    # 默认使用通义千问模型
    logger.info(f"使用默认模型: {AGENT_MODEL_NAME}")
    return AGENT_MODEL_NAME


class AgentService:
    """智能体服务 - 支持工具调用"""
    
    def __init__(self, db: Session):
        self.db = db
        self.conversation_repo = ConversationRepository(db)
        self.message_repo = MessageRepository(db)
        self._agent = None
    
    def _get_agent(self) -> Agent:
        """获取或创建智能体实例（单例）"""
        if self._agent is None:
            self._agent = self._create_agent()
        
        return self._agent
    
    def _create_agent(self) -> Agent:
        """
        创建并配置智能体实例
        
        Returns:
            Agent: 配置好的智能体实例
            
        Raises:
            ValueError: 当必需的环境变量未配置时
        """
        # 从环境变量读取配置
        api_key = os.getenv(ENV_QWEN_API_KEY)
        base_url = os.getenv(ENV_QWEN_API_BASE_URL)
        
        if not api_key or not base_url:
            raise ValueError(
                f"{ENV_QWEN_API_KEY} 或 {ENV_QWEN_API_BASE_URL} 未配置"
            )
        
        # 根据base_url自动检测应该使用的模型
        model_name = _detect_model_from_base_url(base_url)
        
        # 创建智能体配置
        config = AgentConfig(
            model=model_name,
            api_key=api_key,
            base_url=base_url,
            system_prompt=AGENT_SYSTEM_PROMPT,
            max_tool_iterations=AGENT_MAX_TOOL_ITERATIONS,
            temperature=AGENT_TEMPERATURE
        )
        
        # 创建智能体
        agent = Agent(config)
        
        # 注册RSS工具
        self._register_rss_tools(agent)
        
        logger.info(
            "智能体已初始化",
            model=model_name,
            base_url=base_url,
            tools_count=len(RSS_TOOLS_DEFINITIONS)
        )
        
        return agent
    
    def _register_rss_tools(self, agent: Agent) -> None:
        """
        注册RSS工具到智能体
        
        Args:
            agent: 智能体实例
        """
        for tool_def in RSS_TOOLS_DEFINITIONS:
            agent.register_tool(
                name=tool_def["name"],
                description=tool_def["description"],
                parameters=tool_def["parameters"],
                function=tool_def["function"]
            )
    
    async def chat_stream(
        self,
        conversation_id: int,
        user_message: str,
        user_id: str = None
    ) -> AsyncGenerator[Dict[str, str], None]:
        """
        智能体流式聊天
        
        Args:
            conversation_id: 会话 ID
            user_message: 用户消息
            user_id: 用户ID（用于验证会话所有权）
            
        Yields:
            流式响应数据
        """
        # 验证会话是否存在且属于当前用户
        conversation = self.conversation_repo.get_by_id(conversation_id, user_id=user_id)
        if not conversation:
            yield {"type": "error", "content": "会话不存在或无权访问"}
            return
        
        # 保存用户消息
        self.message_repo.create(
            conversation_id=conversation_id,
            role="user",
            content=user_message,
            thinking_mode=False
        )
        
        logger.info(
            "agent_chat_started",
            conversation_id=conversation_id,
            message_length=len(user_message)
        )
        
        # 获取对话历史
        recent_messages = self.message_repo.get_recent_messages(
            conversation_id=conversation_id,
            limit=settings.MAX_CONVERSATION_HISTORY
        )
        
        # 构建对话历史（Agent格式）
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in recent_messages
        ]
        
        # 调用智能体流式响应
        full_response = ""
        tool_calls_info = []
        
        try:
            agent = self._get_agent()
            
            for chunk in self._process_agent_stream(
                agent.chat_stream(messages),
                tool_calls_info
            ):
                if chunk.get("type") == "error":
                    return
                
                # 只累计文本内容
                if chunk.get("type") == "delta":
                    full_response += chunk.get("content", "")
                
                yield chunk
            
            # 保存助手回复和更新会话
            self._save_conversation_response(
                conversation_id=conversation_id,
                response=full_response
            )
            
            # 发送完成信号
            yield {"type": "done"}
            
            logger.info(
                "agent_chat_completed",
                conversation_id=conversation_id,
                response_length=len(full_response),
                tool_calls_count=len(tool_calls_info)
            )
            
        except Exception as e:
            logger.error(
                "agent_chat_failed",
                conversation_id=conversation_id,
                error=str(e),
                error_type=type(e).__name__
            )
            yield {"type": "error", "content": f"智能体处理失败: {str(e)}"}
    
    def _process_agent_stream(
        self,
        stream: Generator[Dict[str, Any], None, None],
        tool_calls_info: List[Dict[str, Any]]
    ) -> Generator[Dict[str, Any], None, None]:
        """
        处理智能体流式响应
        
        Args:
            stream: 智能体流式响应生成器
            tool_calls_info: 工具调用信息列表（用于记录）
            
        Yields:
            处理后的响应块
        """
        for chunk in stream:
            chunk_type = chunk.get("type")
            chunk_content = chunk.get("content", "")
            
            if chunk_type == "text":
                yield {"type": "delta", "content": chunk_content}
            
            elif chunk_type == "tool_call":
                tool_name = chunk.get("tool_name", "unknown")
                tool_args = chunk.get("tool_arguments", {})
                tool_calls_info.append({
                    "name": tool_name,
                    "arguments": tool_args
                })
                
                yield {
                    "type": "tool_call",
                    "content": f"正在调用工具: {tool_name}",
                    "tool_name": tool_name,
                    "tool_arguments": tool_args
                }
            
            elif chunk_type == "tool_result":
                tool_name = chunk.get("tool_name", "unknown")
                # 获取工具执行的实际结果内容
                result_content = chunk.get("content", "")
                metadata = chunk.get("metadata", {})
                
                yield {
                    "type": "tool_result",
                    "content": result_content or f"工具 {tool_name} 执行完成",
                    "tool_name": tool_name,
                    "metadata": metadata
                }
            
            elif chunk_type == "done":
                break
            
            elif chunk_type == "error":
                yield {"type": "error", "content": chunk_content}
                return
    
    def _save_conversation_response(
        self,
        conversation_id: int,
        response: str
    ) -> None:
        """
        保存助手回复并更新会话时间戳
        
        Args:
            conversation_id: 会话ID
            response: 助手回复内容
        """
        self.message_repo.create(
            conversation_id=conversation_id,
            role="assistant",
            content=response,
            thinking_mode=False
        )
        
        self.conversation_repo.update_timestamp(conversation_id)
    
    async def generate_title(
        self,
        conversation_id: int,
        first_message: str,
        user_id: str = None
    ) -> str:
        """
        生成会话标题
        
        Args:
            conversation_id: 会话 ID
            first_message: 第一条用户消息
            user_id: 用户ID
            
        Returns:
            生成的标题
        """
        try:
            title = self._extract_title_from_message(first_message)
            
            self.conversation_repo.update_title(
                conversation_id,
                title,
                user_id=user_id
            )
            
            logger.info(
                "agent_title_generated",
                conversation_id=conversation_id,
                title=title
            )
            
            return title
            
        except Exception as e:
            logger.warning(
                "agent_title_generation_failed",
                conversation_id=conversation_id,
                error=str(e)
            )
            # 失败时使用默认标题
            self.conversation_repo.update_title(
                conversation_id,
                DEFAULT_CONVERSATION_TITLE,
                user_id=user_id
            )
            return DEFAULT_CONVERSATION_TITLE
    
    def _extract_title_from_message(self, message: str) -> str:
        """
        从消息中提取标题
        
        策略：取前N个字符，超过则添加省略号
        
        Args:
            message: 用户消息
            
        Returns:
            提取的标题
        """
        if len(message) <= TITLE_MAX_LENGTH:
            return message
        
        return message[:TITLE_MAX_LENGTH] + TITLE_ELLIPSIS
