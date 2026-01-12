"""
Pydantic 数据模型（Schemas）
定义 API 请求和响应的数据结构
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ==================== 会话相关模型 ====================

class ConversationCreate(BaseModel):
    """创建会话的请求模型"""
    title: Optional[str] = Field(default="新对话", description="会话标题")


class ConversationResponse(BaseModel):
    """会话响应模型"""
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ConversationList(BaseModel):
    """会话列表响应模型"""
    conversations: List[ConversationResponse]


# ==================== 消息相关模型 ====================

class MessageResponse(BaseModel):
    """消息响应模型"""
    id: int
    conversation_id: int
    role: str
    content: str
    thinking_mode: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True


class MessageList(BaseModel):
    """消息列表响应模型"""
    messages: List[MessageResponse]


# ==================== 聊天相关模型 ====================

class ChatRequest(BaseModel):
    """聊天请求模型"""
    conversation_id: int = Field(..., description="会话ID")
    message: str = Field(..., description="用户消息内容")
    thinking_enabled: bool = Field(default=False, description="是否启用 thinking 模式")


class TitleGenerationRequest(BaseModel):
    """标题生成请求模型"""
    first_message: str = Field(..., description="第一条用户消息")


class TitleUpdateRequest(BaseModel):
    """标题更新请求模型"""
    title: str = Field(..., description="新标题")


# ==================== 通用响应模型 ====================

class SuccessResponse(BaseModel):
    """通用成功响应"""
    success: bool = True
    message: Optional[str] = None
    data: Optional[dict] = None
