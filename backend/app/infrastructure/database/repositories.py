"""
Repository 模式实现
封装数据访问逻辑，提供清晰的数据操作接口
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.infrastructure.database.models import Conversation, Message
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)


class ConversationRepository:
    """会话数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, title: str = "新对话", user_id: str = None) -> Conversation:
        """
        创建新会话
        
        Args:
            title: 会话标题
            user_id: 用户ID（必需）
            
        Returns:
            创建的会话对象
        """
        if not user_id:
            raise ValueError("user_id is required")
        
        conversation = Conversation(title=title, user_id=user_id)
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        
        logger.info("conversation_created", conversation_id=conversation.id, user_id=user_id, title=title)
        return conversation
    
    def get_by_id(self, conversation_id: int, user_id: str = None) -> Optional[Conversation]:
        """
        根据 ID 获取会话
        
        Args:
            conversation_id: 会话 ID
            user_id: 用户ID（可选，如果提供则验证所有权）
            
        Returns:
            会话对象，如果不存在或不属于该用户返回 None
        """
        query = self.db.query(Conversation).filter(Conversation.id == conversation_id)
        
        # 如果提供了user_id，添加过滤条件
        if user_id:
            query = query.filter(Conversation.user_id == user_id)
        
        conversation = query.first()
        if conversation:
            logger.debug("conversation_retrieved", conversation_id=conversation_id, user_id=user_id)
        else:
            logger.warning("conversation_not_found", conversation_id=conversation_id, user_id=user_id)
        return conversation
    
    def get_all(self, skip: int = 0, limit: int = 100, user_id: str = None) -> List[Conversation]:
        """
        获取会话列表（按更新时间倒序）
        
        Args:
            skip: 跳过的记录数
            limit: 返回的最大记录数
            user_id: 用户ID（必需，只返回该用户的会话）
            
        Returns:
            会话列表
        """
        if not user_id:
            raise ValueError("user_id is required")
        
        conversations = self.db.query(Conversation)\
            .filter(Conversation.user_id == user_id)\
            .order_by(Conversation.updated_at.desc())\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        logger.debug("conversations_listed", count=len(conversations), user_id=user_id)
        return conversations
    
    def update_title(self, conversation_id: int, title: str, user_id: str = None) -> Optional[Conversation]:
        """
        更新会话标题
        
        Args:
            conversation_id: 会话 ID
            title: 新标题
            user_id: 用户ID（可选，如果提供则验证所有权）
            
        Returns:
            更新后的会话对象，如果不存在或不属于该用户返回 None
        """
        conversation = self.get_by_id(conversation_id, user_id=user_id)
        if not conversation:
            return None
        
        conversation.title = title
        conversation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(conversation)
        
        logger.info("conversation_title_updated", conversation_id=conversation_id, user_id=user_id, title=title)
        return conversation
    
    def delete(self, conversation_id: int, user_id: str = None) -> bool:
        """
        删除会话及其所有消息
        
        Args:
            conversation_id: 会话 ID
            user_id: 用户ID（可选，如果提供则验证所有权）
            
        Returns:
            是否删除成功
        """
        conversation = self.get_by_id(conversation_id, user_id=user_id)
        if not conversation:
            return False
        
        self.db.delete(conversation)
        self.db.commit()
        
        logger.info("conversation_deleted", conversation_id=conversation_id, user_id=user_id)
        return True
    
    def update_timestamp(self, conversation_id: int) -> None:
        """
        更新会话的最后更新时间
        
        Args:
            conversation_id: 会话 ID
        """
        conversation = self.get_by_id(conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self.db.commit()


class MessageRepository:
    """消息数据仓库"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(
        self,
        conversation_id: int,
        role: str,
        content: str,
        thinking_mode: bool = False
    ) -> Message:
        """
        创建新消息
        
        Args:
            conversation_id: 会话 ID
            role: 消息角色（user 或 assistant）
            content: 消息内容
            thinking_mode: 是否启用思考模式
            
        Returns:
            创建的消息对象
        """
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            thinking_mode=thinking_mode
        )
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        logger.info(
            "message_created",
            message_id=message.id,
            conversation_id=conversation_id,
            role=role,
            content_length=len(content)
        )
        return message
    
    def get_by_conversation(
        self,
        conversation_id: int,
        limit: Optional[int] = None
    ) -> List[Message]:
        """
        获取会话的所有消息
        
        Args:
            conversation_id: 会话 ID
            limit: 限制返回的消息数量（从最新开始）
            
        Returns:
            消息列表（按时间顺序）
        """
        query = self.db.query(Message)\
            .filter(Message.conversation_id == conversation_id)
        
        if limit:
            # 获取最新的 N 条消息，然后反转顺序
            messages = query.order_by(Message.timestamp.desc())\
                .limit(limit)\
                .all()
            messages.reverse()
        else:
            # 获取所有消息，按时间顺序
            messages = query.order_by(Message.timestamp.asc()).all()
        
        logger.debug(
            "messages_retrieved",
            conversation_id=conversation_id,
            count=len(messages)
        )
        return messages
    
    def get_recent_messages(
        self,
        conversation_id: int,
        limit: int = 20
    ) -> List[Message]:
        """
        获取最近的消息（用于构建对话历史）
        
        Args:
            conversation_id: 会话 ID
            limit: 返回的最大消息数
            
        Returns:
            消息列表（按时间顺序，从旧到新）
        """
        return self.get_by_conversation(conversation_id, limit=limit)


def get_conversation_repository(db: Session) -> ConversationRepository:
    """依赖注入：获取会话仓库"""
    return ConversationRepository(db)


def get_message_repository(db: Session) -> MessageRepository:
    """依赖注入：获取消息仓库"""
    return MessageRepository(db)
