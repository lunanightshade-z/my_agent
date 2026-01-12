"""
聊天服务层
封装聊天相关的业务逻辑
"""
from typing import AsyncGenerator, Dict
from sqlalchemy.orm import Session
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.infrastructure.llm.zhipu_client import get_zhipu_client
from app.config import settings
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)


class ChatService:
    """聊天服务"""
    
    def __init__(self, db: Session):
        self.db = db
        self.conversation_repo = ConversationRepository(db)
        self.message_repo = MessageRepository(db)
        self.llm_client = get_zhipu_client()
    
    async def chat_stream(
        self,
        conversation_id: int,
        user_message: str,
        thinking_enabled: bool = False
    ) -> AsyncGenerator[Dict[str, str], None]:
        """
        流式聊天
        
        Args:
            conversation_id: 会话 ID
            user_message: 用户消息
            thinking_enabled: 是否启用思考模式
            
        Yields:
            流式响应数据
        """
        # 验证会话是否存在
        conversation = self.conversation_repo.get_by_id(conversation_id)
        if not conversation:
            yield {"type": "error", "content": "会话不存在"}
            return
        
        # 保存用户消息
        self.message_repo.create(
            conversation_id=conversation_id,
            role="user",
            content=user_message,
            thinking_mode=thinking_enabled
        )
        
        logger.info(
            "chat_started",
            conversation_id=conversation_id,
            thinking_enabled=thinking_enabled,
            message_length=len(user_message)
        )
        
        # 获取对话历史
        recent_messages = self.message_repo.get_recent_messages(
            conversation_id=conversation_id,
            limit=settings.MAX_CONVERSATION_HISTORY
        )
        
        # 构建对话历史
        conversations = [
            {"role": msg.role, "content": msg.content}
            for msg in recent_messages
        ]
        
        # 调用 LLM 流式响应
        thinking_mode = "enabled" if thinking_enabled else "disabled"
        full_thinking = ""
        full_response = ""
        
        try:
            async for chunk_data in self.llm_client.chat_stream(conversations, thinking_mode):
                chunk_type = chunk_data.get("type")
                chunk_content = chunk_data.get("content", "")
                
                if chunk_type == "thinking":
                    full_thinking += chunk_content
                    yield {"type": "thinking", "content": chunk_content}
                elif chunk_type == "content":
                    full_response += chunk_content
                    yield {"type": "delta", "content": chunk_content}
                elif chunk_type == "error":
                    # 收到错误信息，直接返回，不继续处理
                    yield {"type": "error", "content": chunk_content}
                    return
            
            # 保存助手回复
            final_content = full_response
            if full_thinking and thinking_enabled:
                final_content = f"[THINKING]{full_thinking}[/THINKING]{full_response}"
            
            self.message_repo.create(
                conversation_id=conversation_id,
                role="assistant",
                content=final_content,
                thinking_mode=thinking_enabled
            )
            
            # 更新会话时间戳
            self.conversation_repo.update_timestamp(conversation_id)
            
            # 发送完成信号
            yield {"type": "done"}
            
            logger.info(
                "chat_completed",
                conversation_id=conversation_id,
                response_length=len(full_response),
                thinking_length=len(full_thinking)
            )
            
        except Exception as e:
            logger.error(
                "chat_failed",
                conversation_id=conversation_id,
                error=str(e),
                error_type=type(e).__name__
            )
            yield {"type": "error", "content": f"处理失败: {str(e)}"}
    
    async def generate_title(self, conversation_id: int, first_message: str) -> str:
        """
        生成会话标题
        
        Args:
            conversation_id: 会话 ID
            first_message: 第一条用户消息
            
        Returns:
            生成的标题
        """
        try:
            title = await self.llm_client.generate_title(first_message)
            
            # 更新会话标题
            self.conversation_repo.update_title(conversation_id, title)
            
            logger.info(
                "title_generated",
                conversation_id=conversation_id,
                title=title
            )
            
            return title
            
        except Exception as e:
            logger.warning(
                "title_generation_fallback",
                conversation_id=conversation_id,
                error=str(e)
            )
            # 失败时使用消息前缀
            fallback_title = first_message[:15]
            self.conversation_repo.update_title(conversation_id, fallback_title)
            return fallback_title
