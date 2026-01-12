"""
FastAPI 主应用
提供聊天系统的所有 API 端点
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json

from database import engine, get_db, Base
from models import Conversation, Message
from schemas import (
    ConversationCreate, ConversationResponse, ConversationList,
    MessageResponse, MessageList, ChatRequest
)
from zhipu_service import get_zhipu_stream_response, generate_conversation_title_sync

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 初始化 FastAPI 应用
app = FastAPI(
    title="智谱AI聊天系统",
    description="基于智谱AI的聊天应用后端API",
    version="1.0.0"
)

# 配置 CORS（允许前端跨域请求）
app.add_middleware(
    CORSMiddleware,
    # 彻底解决：允许任意 localhost / 127.0.0.1 端口（Vite 端口变化时也不需要改这里）
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== 会话管理端点 ====================

@app.post("/api/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation: ConversationCreate,
    db: Session = Depends(get_db)
):
    """
    创建新的对话会话
    """
    db_conversation = Conversation(title=conversation.title)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


@app.get("/api/conversations", response_model=ConversationList)
def get_conversations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    获取所有对话会话列表（按更新时间倒序）
    """
    conversations = db.query(Conversation)\
        .order_by(Conversation.updated_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    return {"conversations": conversations}


@app.delete("/api/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db)
):
    """
    删除指定的对话会话及其所有消息
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    db.delete(conversation)
    db.commit()
    return None


@app.put("/api/conversations/{conversation_id}/title")
def update_conversation_title(
    conversation_id: int,
    title: str,
    db: Session = Depends(get_db)
):
    """
    更新会话标题
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    conversation.title = title
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    
    return {"success": True, "title": title}


@app.post("/api/conversations/{conversation_id}/generate-title")
def generate_title(
    conversation_id: int,
    first_message: str,
    db: Session = Depends(get_db)
):
    """
    基于第一条消息自动生成会话标题
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 调用智谱AI生成标题
    try:
        title = generate_conversation_title_sync(first_message)
        conversation.title = title
        conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(conversation)
        
        return {"success": True, "title": title}
    except Exception as e:
        # 生成失败时使用前15个字
        title = first_message[:15]
        conversation.title = title
        db.commit()
        
        return {"success": True, "title": title, "fallback": True}


# ==================== 消息管理端点 ====================

@app.get("/api/conversations/{conversation_id}/messages", response_model=MessageList)
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db)
):
    """
    获取指定对话的所有消息历史
    """
    # 检查会话是否存在
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 获取消息列表（按时间顺序）
    messages = db.query(Message)\
        .filter(Message.conversation_id == conversation_id)\
        .order_by(Message.timestamp.asc())\
        .all()
    
    return {"messages": messages}


# ==================== 聊天端点 ====================

@app.post("/api/chat/stream")
async def chat_stream(
    chat_request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    流式聊天端点（SSE）
    接收用户消息，调用智谱AI，返回流式响应
    """
    # 验证会话是否存在
    conversation = db.query(Conversation).filter(Conversation.id == chat_request.conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="会话不存在")
    
    # 保存用户消息到数据库
    user_message = Message(
        conversation_id=chat_request.conversation_id,
        role="user",
        content=chat_request.message,
        thinking_mode=chat_request.thinking_enabled
    )
    db.add(user_message)
    db.commit()
    
    # 获取会话历史（最近20条消息）
    messages = db.query(Message)\
        .filter(Message.conversation_id == chat_request.conversation_id)\
        .order_by(Message.timestamp.desc())\
        .limit(20)\
        .all()
    
    # 构建对话历史（反转顺序，从旧到新）
    conversations = [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(messages)
    ]
    
    # 设置 thinking 模式
    thinking_mode = "enabled" if chat_request.thinking_enabled else "disabled"
    
    # 定义流式生成器
    async def event_generator():
        """SSE 事件生成器"""
        full_thinking = ""
        full_response = ""
        
        try:
            # 获取智谱AI的流式响应
            async for chunk_data in get_zhipu_stream_response(conversations, thinking_mode):
                chunk_type = chunk_data.get("type")
                chunk_content = chunk_data.get("content", "")
                
                if chunk_type == "thinking":
                    # 思考过程
                    full_thinking += chunk_content
                    data = json.dumps({
                        "type": "thinking",
                        "content": chunk_content
                    }, ensure_ascii=False)
                    yield f"data: {data}\n\n"
                    
                elif chunk_type == "content":
                    # 回答内容
                    full_response += chunk_content
                    data = json.dumps({
                        "type": "delta",
                        "content": chunk_content
                    }, ensure_ascii=False)
                    yield f"data: {data}\n\n"
                    
                elif chunk_type == "error":
                    # 错误信息
                    error_data = json.dumps({
                        "type": "error",
                        "error": chunk_content
                    }, ensure_ascii=False)
                    yield f"data: {error_data}\n\n"
                    return
            
            # 流式响应结束后，保存完整的AI回复到数据库
            # 如果有思考过程，将其包含在内容中（用特殊标记分隔）
            final_content = full_response
            if full_thinking and chat_request.thinking_enabled:
                # 保存时包含思考过程（可选：也可以分开存储）
                final_content = f"[THINKING]{full_thinking}[/THINKING]{full_response}"
            
            assistant_message = Message(
                conversation_id=chat_request.conversation_id,
                role="assistant",
                content=final_content,
                thinking_mode=chat_request.thinking_enabled
            )
            db.add(assistant_message)
            
            # 更新会话的最后更新时间
            conversation.updated_at = datetime.utcnow()
            db.commit()
            
            # 发送完成信号
            done_data = json.dumps({"type": "done"}, ensure_ascii=False)
            yield f"data: {done_data}\n\n"
            
        except Exception as e:
            # 发送错误信息
            error_data = json.dumps({
                "type": "error",
                "error": str(e)
            }, ensure_ascii=False)
            yield f"data: {error_data}\n\n"
    
    # 返回 SSE 响应
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
        }
    )


# ==================== 健康检查端点 ====================

@app.get("/health")
def health_check():
    """健康检查端点"""
    return {"status": "healthy", "service": "智谱AI聊天系统"}


# ==================== 根路径 ====================

@app.get("/")
def root():
    """根路径，返回API信息"""
    return {
        "message": "智谱AI聊天系统 API",
        "version": "1.0.0",
        "docs": "/docs"
    }

