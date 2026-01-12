"""
结构化日志配置模块
使用 structlog 实现 JSON 格式的结构化日志
"""
import structlog
import logging
import sys
from typing import Any
from app.config import settings


def setup_logging():
    """
    配置结构化日志系统
    根据环境配置不同的日志格式和输出
    """
    
    # 配置标准库 logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL.upper()),
    )
    
    # 根据环境选择不同的处理器
    if settings.ENVIRONMENT == "production":
        # 生产环境：纯 JSON 格式
        processors = [
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer(),
        ]
    else:
        # 开发环境：带颜色的可读格式
        processors = [
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.dev.ConsoleRenderer(colors=True),
        ]
    
    # 配置 structlog
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


def get_logger(name: str = None) -> structlog.BoundLogger:
    """
    获取结构化日志记录器
    
    Args:
        name: 日志记录器名称，通常使用 __name__
    
    Returns:
        structlog.BoundLogger: 结构化日志记录器
    """
    return structlog.get_logger(name)


# 自动初始化
setup_logging()
