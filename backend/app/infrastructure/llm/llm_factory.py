"""
LLM 客户端工厂
统一管理不同的 LLM 客户端（智谱、OpenRouter/Kimi 等）
"""
from typing import Union
from app.infrastructure.llm.zhipu_client import ZhipuClient, get_zhipu_client
from app.infrastructure.llm.openrouter_client import OpenRouterClient, get_openrouter_client
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)

# 定义 LLM 客户端类型
LLMClient = Union[ZhipuClient, OpenRouterClient]


class LLMFactory:
    """LLM 客户端工厂"""
    
    # 支持的模型提供商
    PROVIDERS = {
        "zhipu": "zhipu",
        "kimi": "openrouter",
        "openrouter": "openrouter",
    }
    
    @classmethod
    def get_client(cls, provider: str = "kimi") -> LLMClient:
        """
        根据提供商名称获取对应的 LLM 客户端
        
        Args:
            provider: 提供商名称（"zhipu" 或 "kimi"/"openrouter"）
            
        Returns:
            LLM 客户端实例
            
        Raises:
            ValueError: 当提供商不支持时
        """
        provider = provider.lower()
        
        if provider not in cls.PROVIDERS:
            logger.error(
                "unsupported_provider",
                provider=provider,
                supported=list(cls.PROVIDERS.keys())
            )
            raise ValueError(
                f"不支持的模型提供商: {provider}. "
                f"支持的提供商: {', '.join(cls.PROVIDERS.keys())}"
            )
        
        provider_type = cls.PROVIDERS[provider]
        
        if provider_type == "zhipu":
            logger.debug("get_llm_client", provider="zhipu")
            return get_zhipu_client()
        elif provider_type == "openrouter":
            logger.debug("get_llm_client", provider="openrouter")
            return get_openrouter_client()
        
        # 理论上不会到达这里
        raise ValueError(f"未知的提供商类型: {provider_type}")
    
    @classmethod
    def get_supported_providers(cls) -> list:
        """获取支持的提供商列表"""
        return list(cls.PROVIDERS.keys())
