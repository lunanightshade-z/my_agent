"""
智谱 AI 客户端实现
封装智谱 API 调用，提供缓存、重试、超时等功能
"""
import asyncio
import hashlib
import json
from typing import AsyncGenerator, List, Dict, Optional
from zhipuai import ZhipuAI
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
from app.config import settings
from app.infrastructure.cache.memory_cache import get_cache
from app.infrastructure.logging.setup import get_logger
from time import time

logger = get_logger(__name__)


class ZhipuClient:
    """智谱 AI 客户端（支持缓存、重试、超时）"""
    
    def __init__(self):
        self.client = ZhipuAI(api_key=settings.ZHIPU_API_KEY)
        self.cache = get_cache() if settings.CACHE_ENABLED else None
        
    def _generate_cache_key(
        self,
        messages: List[Dict[str, str]],
        model: str,
        temperature: float,
        thinking: str
    ) -> str:
        """
        生成缓存键
        
        Args:
            messages: 会话历史
            model: 模型名称
            temperature: 温度参数
            thinking: thinking 模式
            
        Returns:
            缓存键字符串
        """
        # 将参数序列化为 JSON 字符串
        cache_data = {
            "messages": messages,
            "model": model,
            "temperature": temperature,
            "thinking": thinking
        }
        cache_str = json.dumps(cache_data, sort_keys=True, ensure_ascii=False)
        
        # 生成 MD5 哈希作为缓存键
        cache_key = f"zhipu:{hashlib.md5(cache_str.encode()).hexdigest()}"
        return cache_key
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((asyncio.TimeoutError, ConnectionError)),
    )
    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        thinking: str = "disabled",
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> AsyncGenerator[Dict[str, str], None]:
        """
        流式聊天（异步生成器）
        
        Args:
            messages: 会话历史
            thinking: thinking 模式（"enabled" 或 "disabled"）
            model: 模型名称，默认使用配置
            temperature: 温度参数，默认使用配置
            
        Yields:
            字典，包含类型和内容：
            - {"type": "thinking", "content": "..."}
            - {"type": "content", "content": "..."}
            - {"type": "error", "content": "..."}
        """
        model = model or (settings.LLM_THINKING_MODEL if thinking == "enabled" else settings.LLM_MODEL)
        temperature = temperature or settings.LLM_TEMPERATURE
        
        start_time = time()
        
        try:
            # 创建流式请求
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                temperature=temperature,
                max_tokens=settings.LLM_MAX_TOKENS,
                extra_body={
                    "thinking": {
                        "type": thinking
                    }
                },
            )
            
            thinking_phase = True
            input_length = sum(len(msg.get("content", "")) for msg in messages)
            output_length = 0
            
            # 逐块处理流式响应
            for chunk in response:
                if not chunk.choices:
                    continue
                
                delta = chunk.choices[0].delta
                
                # 处理思考过程
                if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                    if thinking_phase:
                        thinking_phase = False
                    output_length += len(delta.reasoning_content)
                    yield {"type": "thinking", "content": delta.reasoning_content}
                
                # 处理回答内容
                if hasattr(delta, 'content') and delta.content:
                    if thinking_phase:
                        thinking_phase = False
                    output_length += len(delta.content)
                    yield {"type": "content", "content": delta.content}
            
            # 记录成功调用
            duration_ms = (time() - start_time) * 1000
            logger.info(
                "llm_call_success",
                model=model,
                thinking=thinking,
                input_length=input_length,
                output_length=output_length,
                duration_ms=round(duration_ms, 2)
            )
            
        except asyncio.TimeoutError:
            duration_ms = (time() - start_time) * 1000
            logger.error(
                "llm_call_timeout",
                model=model,
                timeout=settings.LLM_REQUEST_TIMEOUT,
                duration_ms=round(duration_ms, 2)
            )
            yield {"type": "error", "content": "请求超时，请稍后重试"}
            raise
            
        except Exception as e:
            duration_ms = (time() - start_time) * 1000
            logger.error(
                "llm_call_failed",
                model=model,
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=round(duration_ms, 2)
            )
            yield {"type": "error", "content": f"调用失败: {str(e)}"}
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((asyncio.TimeoutError, ConnectionError)),
    )
    async def chat_complete(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """
        完整聊天（非流式，支持缓存）
        用于生成标题等场景
        
        Args:
            messages: 会话历史
            model: 模型名称
            temperature: 温度参数
            
        Returns:
            完整的回复内容
        """
        model = model or settings.LLM_MODEL
        temperature = temperature or 0.7
        
        # 尝试从缓存获取
        cache_key = self._generate_cache_key(messages, model, temperature, "disabled")
        if self.cache:
            cached_response = await self.cache.get(cache_key)
            if cached_response:
                logger.info("llm_cache_hit", cache_key=cache_key)
                return cached_response
        
        start_time = time()
        
        try:
            # 实际调用 API
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    self.client.chat.completions.create,
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=100,
                ),
                timeout=settings.LLM_REQUEST_TIMEOUT
            )
            
            content = response.choices[0].message.content.strip()
            
            # 缓存结果
            if self.cache:
                await self.cache.set(cache_key, content, ttl=settings.CACHE_TTL)
            
            duration_ms = (time() - start_time) * 1000
            logger.info(
                "llm_complete_success",
                model=model,
                input_length=sum(len(msg.get("content", "")) for msg in messages),
                output_length=len(content),
                duration_ms=round(duration_ms, 2),
                cached=False
            )
            
            return content
            
        except asyncio.TimeoutError:
            duration_ms = (time() - start_time) * 1000
            logger.error(
                "llm_complete_timeout",
                model=model,
                timeout=settings.LLM_REQUEST_TIMEOUT,
                duration_ms=round(duration_ms, 2)
            )
            raise
            
        except Exception as e:
            duration_ms = (time() - start_time) * 1000
            logger.error(
                "llm_complete_failed",
                model=model,
                error=str(e),
                error_type=type(e).__name__,
                duration_ms=round(duration_ms, 2)
            )
            raise
    
    async def generate_title(self, first_message: str) -> str:
        """
        基于第一条消息生成会话标题
        
        Args:
            first_message: 第一条用户消息
            
        Returns:
            生成的标题（3-10个字）
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": "你是一个标题生成助手。请为用户的对话生成一个简短、准确的标题，3-10个字。只返回标题文本，不要有其他内容。"
                },
                {
                    "role": "user",
                    "content": f"请为以下对话生成标题：\n\n{first_message}"
                }
            ]
            
            title = await self.chat_complete(messages, temperature=0.7)
            
            # 清理标题（去除引号等）
            title = title.strip('"\'""''')
            
            # 限制长度
            if len(title) > 15:
                title = title[:15]
            
            return title if title else first_message[:15]
            
        except Exception as e:
            logger.warning("title_generation_failed", error=str(e))
            return first_message[:15]


# 全局客户端实例（单例）
_client_instance: Optional[ZhipuClient] = None


def get_zhipu_client() -> ZhipuClient:
    """获取智谱客户端实例（单例）"""
    global _client_instance
    if _client_instance is None:
        _client_instance = ZhipuClient()
    return _client_instance
