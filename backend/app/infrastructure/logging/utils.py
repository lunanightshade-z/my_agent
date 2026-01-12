"""
日志工具函数
提供便捷的日志记录功能
"""
from functools import wraps
from time import time
from typing import Callable, Any
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)


def log_execution_time(func: Callable) -> Callable:
    """
    装饰器：记录函数执行时间
    
    Usage:
        @log_execution_time
        async def my_function():
            pass
    """
    @wraps(func)
    async def async_wrapper(*args, **kwargs) -> Any:
        start_time = time()
        try:
            result = await func(*args, **kwargs)
            duration_ms = (time() - start_time) * 1000
            logger.info(
                "function_executed",
                function=func.__name__,
                duration_ms=round(duration_ms, 2),
                status="success"
            )
            return result
        except Exception as e:
            duration_ms = (time() - start_time) * 1000
            logger.error(
                "function_failed",
                function=func.__name__,
                duration_ms=round(duration_ms, 2),
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    @wraps(func)
    def sync_wrapper(*args, **kwargs) -> Any:
        start_time = time()
        try:
            result = func(*args, **kwargs)
            duration_ms = (time() - start_time) * 1000
            logger.info(
                "function_executed",
                function=func.__name__,
                duration_ms=round(duration_ms, 2),
                status="success"
            )
            return result
        except Exception as e:
            duration_ms = (time() - start_time) * 1000
            logger.error(
                "function_failed",
                function=func.__name__,
                duration_ms=round(duration_ms, 2),
                error=str(e),
                error_type=type(e).__name__
            )
            raise
    
    # 根据函数类型返回对应的包装器
    import asyncio
    if asyncio.iscoroutinefunction(func):
        return async_wrapper
    else:
        return sync_wrapper


def log_api_call(endpoint: str, method: str, status_code: int, duration_ms: float, **extra):
    """
    记录 API 调用日志
    
    Args:
        endpoint: API 端点路径
        method: HTTP 方法
        status_code: 响应状态码
        duration_ms: 处理时间（毫秒）
        **extra: 额外的上下文信息
    """
    logger.info(
        "api_request",
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        duration_ms=round(duration_ms, 2),
        **extra
    )


def log_llm_call(model: str, input_tokens: int, output_tokens: int, duration_ms: float, **extra):
    """
    记录 LLM API 调用日志
    
    Args:
        model: 使用的模型名称
        input_tokens: 输入 token 数
        output_tokens: 输出 token 数
        duration_ms: 调用耗时（毫秒）
        **extra: 额外的上下文信息
    """
    logger.info(
        "llm_call",
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        duration_ms=round(duration_ms, 2),
        **extra
    )
