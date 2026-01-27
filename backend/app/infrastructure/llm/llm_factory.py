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
    
    # 智谱模型列表
    ZHIPU_MODELS = {"zhipu", "glm-4.7", "glm-4-flash", "glm-4"}
    
    @classmethod
    def parse_model_identifier(cls, model_identifier: str) -> tuple[str, str]:
        """
        解析模型标识符，返回 (provider_type, model_name)
        
        Args:
            model_identifier: 模型标识符，格式：
                - "zhipu" 或 "zhipu:glm-4.7" -> (zhipu, glm-4.7)
                - "moonshotai/kimi-k2.5" 或其他 openrouter 模型 -> (openrouter, moonshotai/kimi-k2.5)
        
        Returns:
            (provider_type, model_name) 元组
        """
        model_identifier = model_identifier.strip()
        
        # 检查是否是智谱模型
        if model_identifier == "zhipu" or model_identifier in cls.ZHIPU_MODELS:
            return ("zhipu", "glm-4.7")
        
        # 检查是否是 zhipu:model_name 格式
        if ":" in model_identifier and model_identifier.split(":")[0].lower() == "zhipu":
            _, model_name = model_identifier.split(":", 1)
            return ("zhipu", model_name.strip())
        
        # 默认使用 openrouter（支持所有 openrouter 模型）
        return ("openrouter", model_identifier)
    
    @classmethod
    def get_client(cls, model_identifier: str = "moonshotai/kimi-k2.5") -> LLMClient:
        """
        根据模型标识符获取对应的 LLM 客户端
        
        Args:
            model_identifier: 模型标识符（"zhipu" 或 openrouter 模型名称）
            
        Returns:
            LLM 客户端实例
        """
        provider_type, _ = cls.parse_model_identifier(model_identifier)
        
        if provider_type == "zhipu":
            logger.debug("get_llm_client", provider="zhipu", model_identifier=model_identifier)
            return get_zhipu_client()
        elif provider_type == "openrouter":
            logger.debug("get_llm_client", provider="openrouter", model_identifier=model_identifier)
            return get_openrouter_client()
        
        raise ValueError(f"未知的提供商类型: {provider_type}")
    
    @classmethod
    def get_model_name(cls, model_identifier: str) -> str:
        """
        从模型标识符中提取模型名称
        
        Args:
            model_identifier: 模型标识符
            
        Returns:
            模型名称
        """
        _, model_name = cls.parse_model_identifier(model_identifier)
        return model_name
    
    @classmethod
    def get_supported_providers(cls) -> list:
        """获取支持的提供商列表"""
        return list(cls.PROVIDERS.keys())
