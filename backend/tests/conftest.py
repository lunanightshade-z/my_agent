"""
Pytest 配置文件
定义测试 fixtures 和配置
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.infrastructure.database.connection import Base, get_db
from app.config import Settings, get_settings


# ==================== 测试配置 ====================

def get_test_settings():
    """测试环境配置"""
    return Settings(
        ENVIRONMENT="testing",
        DEBUG=True,
        LOG_LEVEL="DEBUG",
        DATABASE_URL="sqlite:///./test.db",
        ZHIPU_API_KEY="test-api-key",
        CACHE_ENABLED=False,
    )


# ==================== 数据库 Fixtures ====================

@pytest.fixture(scope="function")
def test_db():
    """创建测试数据库"""
    # 使用内存数据库
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # 创建表
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """创建测试客户端"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    def override_get_settings():
        return get_test_settings()
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = override_get_settings
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


# ==================== 数据 Fixtures ====================

@pytest.fixture
def sample_conversation(test_db):
    """创建示例会话"""
    from app.infrastructure.database.repositories import ConversationRepository
    repo = ConversationRepository(test_db)
    return repo.create(title="测试会话")


@pytest.fixture
def sample_message(test_db, sample_conversation):
    """创建示例消息"""
    from app.infrastructure.database.repositories import MessageRepository
    repo = MessageRepository(test_db)
    return repo.create(
        conversation_id=sample_conversation.id,
        role="user",
        content="测试消息",
        thinking_mode=False
    )
