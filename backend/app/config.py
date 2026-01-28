"""
配置管理模块
使用 pydantic-settings 实现环境隔离和配置管理
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """应用配置类"""
    
    # ==================== 应用基础配置 ====================
    APP_NAME: str = "AI Agent Platform"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    ENVIRONMENT: str = "development"  # development, staging, production
    
    # ==================== LLM 配置 ====================
    ZHIPU_API_KEY: str
    LLM_MODEL: str = "glm-4.7"
    LLM_THINKING_MODEL: str = "glm-4.7"
    LLM_REQUEST_TIMEOUT: int = 30  # 秒
    LLM_MAX_RETRIES: int = 3
    LLM_TEMPERATURE: float = 1.0
    LLM_MAX_TOKENS: int = 30000
    
    # OpenRouter 配置（支持 Kimi 等模型）
    OPENROUTER_API_KEY: str
    KIMI_MODEL: str = "moonshotai/kimi-k2.5"
    
    # ==================== 数据库配置 ====================
    DATABASE_URL: str = "sqlite:///./chat_history.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False  # 是否输出 SQL 语句
    
    # ==================== 缓存配置 ====================
    CACHE_ENABLED: bool = True
    CACHE_TYPE: str = "memory"  # memory, redis
    REDIS_URL: Optional[str] = None
    CACHE_TTL: int = 3600  # 缓存过期时间（秒）
    CACHE_MAX_SIZE: int = 1000  # 内存缓存最大条目数
    
    # ==================== API 配置 ====================
    API_V1_PREFIX: str = "/api"
    CORS_ORIGINS: list = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:28888",
        "http://127.0.0.1:28888",
        "http://8.130.129.37:28888",
        "http://10.0.2.28:28888",
        "http://8.130.129.37",
        "http://10.0.2.28"
    ]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # ==================== 会话配置 ====================
    MAX_CONVERSATION_HISTORY: int = 20  # 最多保留多少条历史消息
    DEFAULT_CONVERSATION_TITLE: str = "新对话"
    
    # ==================== 安全配置 ====================
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = "ignore"  # 忽略未定义的环境变量


@lru_cache
def get_settings() -> Settings:
    """
    获取配置单例
    使用 lru_cache 确保配置只加载一次
    """
    return Settings()


# 便捷访问
settings = get_settings()
