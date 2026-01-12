"""
依赖注入配置
定义 FastAPI 依赖项
"""
from fastapi import Depends
from sqlalchemy.orm import Session
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.services.chat_service import ChatService
from app.config import get_settings, Settings


# ==================== 配置依赖 ====================

def get_app_settings() -> Settings:
    """获取应用配置"""
    return get_settings()


# ==================== Repository 依赖 ====================

def get_conversation_repository(db: Session = Depends(get_db)) -> ConversationRepository:
    """获取会话仓库"""
    return ConversationRepository(db)


def get_message_repository(db: Session = Depends(get_db)) -> MessageRepository:
    """获取消息仓库"""
    return MessageRepository(db)


# ==================== Service 依赖 ====================

def get_chat_service(db: Session = Depends(get_db)) -> ChatService:
    """获取聊天服务"""
    return ChatService(db)
