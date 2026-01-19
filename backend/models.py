"""
数据库模型定义
定义 Conversation 和 Message 表结构
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import Base

class Conversation(Base):
    """
    会话表模型
    存储用户的聊天会话信息
    """
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(36), nullable=False, index=True)  # 游客唯一ID（UUID格式）
    title = Column(String(255), nullable=False, default="新对话")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # 关联关系：一个会话包含多条消息
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Conversation(id={self.id}, user_id='{self.user_id}', title='{self.title}')>"


class Message(Base):
    """
    消息表模型
    存储会话中的每条消息
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" 或 "assistant"
    content = Column(Text, nullable=False)
    thinking_mode = Column(Boolean, default=False)  # 是否启用 thinking 模式
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    
    # 关联关系：消息属于某个会话
    conversation = relationship("Conversation", back_populates="messages")
    
    def __repr__(self):
        return f"<Message(id={self.id}, role='{self.role}', conversation_id={self.conversation_id})>"

