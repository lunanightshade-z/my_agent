"""
消息管理 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException
from app.api.schemas import MessageList
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.dependencies import get_conversation_repository, get_message_repository
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/conversations", tags=["messages"])


@router.get("/{conversation_id}/messages", response_model=MessageList)
def get_conversation_messages(
    conversation_id: int,
    conversation_repo: ConversationRepository = Depends(get_conversation_repository),
    message_repo: MessageRepository = Depends(get_message_repository)
):
    """获取指定对话的所有消息历史"""
    # 检查会话是否存在
    conversation = conversation_repo.get_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 获取消息列表
    messages = message_repo.get_by_conversation(conversation_id)
    
    return {"messages": messages}
