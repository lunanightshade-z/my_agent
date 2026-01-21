"""
智能体服务层
集成Agent工具调用功能
"""
from typing import AsyncGenerator, Dict
from sqlalchemy.orm import Session
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.config import settings
from app.infrastructure.logging.setup import get_logger
import os
import sys
from pathlib import Path

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
            # 从环境变量读取配置
            api_key = os.getenv("QWEN_API_KEY")
            base_url = os.getenv("QWEN_API_BASE_URL")
            
            if not api_key or not base_url:
                raise ValueError("QWEN_API_KEY 或 QWEN_API_BASE_URL 未配置")
            
            # 创建智能体配置
            config = AgentConfig(
                model="qwen3-235b-instruct",
                api_key=api_key,
                base_url=base_url,
                system_prompt="""你是一个智能新闻助手，可以帮助用户获取和分析最新的RSS新闻。

你有以下能力：
1. 获取最新的RSS新闻（来自FT中文网、BBC中文、极客公园、少数派等多个优质新闻源）
2. 根据用户的问题智能筛选相关新闻
3. 根据关键词搜索新闻

当用户询问新闻或资讯时，请合理使用这些工具。回答要简洁明了，结构化展示。""",
                max_tool_iterations=5,
                temperature=0.7
            )
            
            # 创建智能体
            self._agent = Agent(config)
            
            # 注册RSS工具
            for tool_def in RSS_TOOLS_DEFINITIONS:
                self._agent.register_tool(
                    name=tool_def["name"],
                    description=tool_def["description"],
                    parameters=tool_def["parameters"],
                    function=tool_def["function"]
                )
            
            logger.info("智能体已初始化", tools_count=len(RSS_TOOLS_DEFINITIONS))
        
        return self._agent
    
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
            
            for chunk in agent.chat_stream(messages):
                chunk_type = chunk.get("type")
                chunk_content = chunk.get("content", "")
                
                if chunk_type == "text":
                    # 文本内容
                    full_response += chunk_content
                    yield {"type": "delta", "content": chunk_content}
                
                elif chunk_type == "tool_call":
                    # 工具调用信息
                    tool_name = chunk.get("tool_name", "unknown")
                    tool_args = chunk.get("tool_arguments", {})
                    tool_calls_info.append({
                        "name": tool_name,
                        "arguments": tool_args
                    })
                    
                    # 发送工具调用通知给前端
                    yield {
                        "type": "tool_call",
                        "content": f"正在调用工具: {tool_name}",
                        "tool_name": tool_name,
                        "tool_arguments": tool_args
                    }
                
                elif chunk_type == "tool_result":
                    # 工具结果
                    tool_name = chunk.get("tool_name", "unknown")
                    yield {
                        "type": "tool_result",
                        "content": f"工具 {tool_name} 执行完成",
                        "tool_name": tool_name
                    }
                
                elif chunk_type == "done":
                    # 完成信号
                    break
                
                elif chunk_type == "error":
                    # 错误信息
                    yield {"type": "error", "content": chunk_content}
                    return
            
            # 保存助手回复
            self.message_repo.create(
                conversation_id=conversation_id,
                role="assistant",
                content=full_response,
                thinking_mode=False
            )
            
            # 更新会话时间戳
            self.conversation_repo.update_timestamp(conversation_id)
            
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
    
    async def generate_title(self, conversation_id: int, first_message: str, user_id: str = None) -> str:
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
            # 简单的标题生成策略：取前20个字符
            title = first_message[:20]
            if len(first_message) > 20:
                title += "..."
            
            # 更新会话标题
            self.conversation_repo.update_title(conversation_id, title, user_id=user_id)
            
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
            fallback_title = "智能体对话"
            self.conversation_repo.update_title(conversation_id, fallback_title, user_id=user_id)
            return fallback_title
