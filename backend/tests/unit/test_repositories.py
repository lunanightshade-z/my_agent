"""
测试 Repository 层
"""
import pytest
from app.infrastructure.database.repositories import (
    ConversationRepository,
    MessageRepository
)


class TestConversationRepository:
    """测试会话仓库"""
    
    def test_create_conversation(self, test_db):
        """测试创建会话"""
        repo = ConversationRepository(test_db)
        conversation = repo.create(title="测试会话")
        
        assert conversation.id is not None
        assert conversation.title == "测试会话"
        assert conversation.created_at is not None
    
    def test_get_by_id(self, test_db, sample_conversation):
        """测试根据 ID 获取会话"""
        repo = ConversationRepository(test_db)
        conversation = repo.get_by_id(sample_conversation.id)
        
        assert conversation is not None
        assert conversation.id == sample_conversation.id
        assert conversation.title == sample_conversation.title
    
    def test_get_by_id_not_found(self, test_db):
        """测试获取不存在的会话"""
        repo = ConversationRepository(test_db)
        conversation = repo.get_by_id(999)
        
        assert conversation is None
    
    def test_get_all(self, test_db):
        """测试获取所有会话"""
        repo = ConversationRepository(test_db)
        
        # 创建多个会话
        repo.create(title="会话1")
        repo.create(title="会话2")
        repo.create(title="会话3")
        
        conversations = repo.get_all()
        assert len(conversations) == 3
    
    def test_update_title(self, test_db, sample_conversation):
        """测试更新会话标题"""
        repo = ConversationRepository(test_db)
        updated = repo.update_title(sample_conversation.id, "新标题")
        
        assert updated is not None
        assert updated.title == "新标题"
    
    def test_delete(self, test_db, sample_conversation):
        """测试删除会话"""
        repo = ConversationRepository(test_db)
        success = repo.delete(sample_conversation.id)
        
        assert success is True
        
        # 验证已删除
        conversation = repo.get_by_id(sample_conversation.id)
        assert conversation is None


class TestMessageRepository:
    """测试消息仓库"""
    
    def test_create_message(self, test_db, sample_conversation):
        """测试创建消息"""
        repo = MessageRepository(test_db)
        message = repo.create(
            conversation_id=sample_conversation.id,
            role="user",
            content="测试消息",
            thinking_mode=False
        )
        
        assert message.id is not None
        assert message.conversation_id == sample_conversation.id
        assert message.role == "user"
        assert message.content == "测试消息"
        assert message.thinking_mode is False
    
    def test_get_by_conversation(self, test_db, sample_conversation):
        """测试获取会话的所有消息"""
        repo = MessageRepository(test_db)
        
        # 创建多条消息
        repo.create(sample_conversation.id, "user", "消息1")
        repo.create(sample_conversation.id, "assistant", "消息2")
        repo.create(sample_conversation.id, "user", "消息3")
        
        messages = repo.get_by_conversation(sample_conversation.id)
        assert len(messages) == 3
        
        # 验证顺序（按时间升序）
        assert messages[0].content == "消息1"
        assert messages[1].content == "消息2"
        assert messages[2].content == "消息3"
    
    def test_get_recent_messages(self, test_db, sample_conversation):
        """测试获取最近的消息"""
        repo = MessageRepository(test_db)
        
        # 创建多条消息
        for i in range(5):
            repo.create(sample_conversation.id, "user", f"消息{i+1}")
        
        # 获取最近 3 条
        messages = repo.get_recent_messages(sample_conversation.id, limit=3)
        assert len(messages) == 3
        
        # 验证是最新的 3 条（按时间顺序）
        assert messages[0].content == "消息3"
        assert messages[1].content == "消息4"
        assert messages[2].content == "消息5"
