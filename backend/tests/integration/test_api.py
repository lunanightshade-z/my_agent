"""
测试 API 端点
"""
import pytest
from fastapi import status


class TestConversationsAPI:
    """测试会话 API"""
    
    def test_create_conversation(self, client):
        """测试创建会话"""
        response = client.post(
            "/api/conversations",
            json={"title": "新会话"}
        )
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["title"] == "新会话"
        assert "id" in data
        assert "created_at" in data
    
    def test_get_conversations(self, client, sample_conversation):
        """测试获取会话列表"""
        response = client.get("/api/conversations")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "conversations" in data
        assert len(data["conversations"]) >= 1
    
    def test_get_conversation(self, client, sample_conversation):
        """测试获取单个会话"""
        response = client.get(f"/api/conversations/{sample_conversation.id}")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == sample_conversation.id
        assert data["title"] == sample_conversation.title
    
    def test_get_conversation_not_found(self, client):
        """测试获取不存在的会话"""
        response = client.get("/api/conversations/999")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_delete_conversation(self, client, sample_conversation):
        """测试删除会话"""
        response = client.delete(f"/api/conversations/{sample_conversation.id}")
        
        assert response.status_code == status.HTTP_204_NO_CONTENT
        
        # 验证已删除
        response = client.get(f"/api/conversations/{sample_conversation.id}")
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_update_conversation_title(self, client, sample_conversation):
        """测试更新会话标题"""
        response = client.put(
            f"/api/conversations/{sample_conversation.id}/title",
            json={"title": "更新后的标题"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["success"] is True
        assert data["data"]["title"] == "更新后的标题"


class TestMessagesAPI:
    """测试消息 API"""
    
    def test_get_conversation_messages(self, client, sample_conversation, sample_message):
        """测试获取会话消息"""
        response = client.get(f"/api/conversations/{sample_conversation.id}/messages")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "messages" in data
        assert len(data["messages"]) >= 1
    
    def test_get_messages_conversation_not_found(self, client):
        """测试获取不存在会话的消息"""
        response = client.get("/api/conversations/999/messages")
        
        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestHealthAPI:
    """测试健康检查 API"""
    
    def test_root(self, client):
        """测试根路径"""
        response = client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health(self, client):
        """测试健康检查"""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
