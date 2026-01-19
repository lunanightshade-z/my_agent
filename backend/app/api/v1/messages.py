"""
消息管理 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.api.schemas import MessageList
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)
from app.dependencies import get_conversation_repository, get_message_repository, get_or_create_user_id
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/conversations", tags=["messages"])


@router.get("/{conversation_id}/messages", response_model=MessageList)
def get_conversation_messages(
    conversation_id: int,
    request: Request,
    response: Response,
    conversation_repo: ConversationRepository = Depends(get_conversation_repository),
    message_repo: MessageRepository = Depends(get_message_repository)
):
    """获取指定对话的所有消息历史（只能获取属于当前游客的会话消息）"""
    user_id = get_or_create_user_id(request, response)
    # 检查会话是否存在且属于当前用户
    conversation = conversation_repo.get_by_id(conversation_id, user_id=user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在或无权访问")
    
    # 获取消息列表
    messages = message_repo.get_by_conversation(conversation_id)
    
    return {"messages": messages}
