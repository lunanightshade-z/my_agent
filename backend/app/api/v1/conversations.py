"""
会话管理 API 端点
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from typing import List
from app.api.schemas import (
    ConversationCreate,
    ConversationResponse,
    ConversationList,
    TitleUpdateRequest,
    TitleGenerationRequest,
    SuccessResponse
)
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories import ConversationRepository
from app.services.chat_service import ChatService
from app.dependencies import get_conversation_repository, get_chat_service, get_or_create_user_id
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation: ConversationCreate,
    request: Request,
    response: Response,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """创建新的对话会话（每个游客都有独立的会话空间）"""
    try:
        user_id = get_or_create_user_id(request, response)
        db_conversation = repo.create(
            title=conversation.title, 
            user_id=user_id,
            conversation_type=conversation.conversation_type or "chat"
        )
        return db_conversation
    except Exception as e:
        logger.error("conversation_creation_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="创建会话失败"
        )


@router.get("", response_model=ConversationList)
def get_conversations(
    request: Request,
    response: Response,
    skip: int = 0,
    limit: int = 100,
    conversation_type: str = None,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """获取当前游客的所有对话会话列表（按更新时间倒序）"""
    try:
        user_id = get_or_create_user_id(request, response)
        conversations = repo.get_all(
            skip=skip, 
            limit=limit, 
            user_id=user_id,
            conversation_type=conversation_type
        )
        return {"conversations": conversations}
    except Exception as e:
        logger.error("conversations_list_failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取会话列表失败"
        )


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    request: Request,
    response: Response,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """获取指定会话（只能获取属于当前游客的会话）"""
    user_id = get_or_create_user_id(request, response)
    conversation = repo.get_by_id(conversation_id, user_id=user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在或无权访问")
    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    request: Request,
    response: Response,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """删除指定的对话会话及其所有消息（只能删除属于当前游客的会话）"""
    user_id = get_or_create_user_id(request, response)
    success = repo.delete(conversation_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="会话不存在或无权访问")
    return None


@router.put("/{conversation_id}/title", response_model=SuccessResponse)
def update_conversation_title(
    conversation_id: int,
    request: TitleUpdateRequest,
    http_request: Request,
    response: Response,
    repo: ConversationRepository = Depends(get_conversation_repository)
):
    """更新会话标题（只能更新属于当前游客的会话）"""
    user_id = get_or_create_user_id(http_request, response)
    conversation = repo.update_title(conversation_id, request.title, user_id=user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在或无权访问")
    
    return SuccessResponse(
        success=True,
        data={"title": request.title}
    )


@router.post("/{conversation_id}/generate-title", response_model=SuccessResponse)
async def generate_title(
    conversation_id: int,
    request: TitleGenerationRequest,
    http_request: Request,
    response: Response,
    chat_service: ChatService = Depends(get_chat_service)
):
    """基于第一条消息自动生成会话标题（只能为属于当前游客的会话生成标题）"""
    user_id = get_or_create_user_id(http_request, response)
    try:
        title = await chat_service.generate_title(conversation_id, request.first_message, user_id=user_id)
        return SuccessResponse(
            success=True,
            data={"title": title}
        )
    except Exception as e:
        logger.error("title_generation_endpoint_failed", error=str(e))
        # 即使失败也返回成功，使用 fallback 标题
        fallback_title = request.first_message[:15]
        return SuccessResponse(
            success=True,
            data={"title": fallback_title, "fallback": True}
        )
