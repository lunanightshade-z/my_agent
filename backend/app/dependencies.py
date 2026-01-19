"""
依赖注入配置
定义 FastAPI 依赖项
"""
from fastapi import Depends, Request, Response
from sqlalchemy.orm import Session
import uuid
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.services.chat_service import ChatService
from app.config import get_settings, Settings

# Cookie名称常量
USER_ID_COOKIE_NAME = "visitor_id"
USER_ID_COOKIE_MAX_AGE = 365 * 24 * 60 * 60  # 1年


# ==================== 配置依赖 ====================

def get_app_settings() -> Settings:
    """获取应用配置"""
    return get_settings()


# ==================== 用户ID管理 ====================

def get_or_create_user_id(request: Request, response: Response) -> str:
    """
    获取或创建游客唯一ID
    从cookie中读取，如果没有则生成新的UUID并设置到cookie中
    
    Args:
        request: FastAPI请求对象
        response: FastAPI响应对象（用于设置cookie）
        
    Returns:
        用户唯一ID（UUID字符串）
    """
    # 尝试从cookie中获取用户ID
    user_id = request.cookies.get(USER_ID_COOKIE_NAME)
    
    # 如果cookie中不存在，生成新的UUID
    if not user_id:
        user_id = str(uuid.uuid4())
        # 设置cookie，有效期1年
        # 注意：生产环境应设置secure=True（需要HTTPS）
        response.set_cookie(
            key=USER_ID_COOKIE_NAME,
            value=user_id,
            max_age=USER_ID_COOKIE_MAX_AGE,
            httponly=False,  # 允许前端JavaScript访问（如果需要）
            samesite="lax",  # 防止CSRF攻击
            secure=False  # 开发环境使用False，生产环境应设为True（需要HTTPS）
        )
    
    return user_id


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
