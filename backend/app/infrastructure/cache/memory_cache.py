"""
内存缓存实现
使用 LRU 缓存策略的简单内存缓存
"""
from typing import Optional, Any
from collections import OrderedDict
from datetime import datetime, timedelta
from app.config import settings
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)


class MemoryCache:
    """内存缓存实现（LRU策略）"""
    
    def __init__(self, max_size: int = None, ttl: int = None):
        """
        初始化内存缓存
        
        Args:
            max_size: 最大缓存条目数
            ttl: 缓存过期时间（秒）
        """
        self.max_size = max_size or settings.CACHE_MAX_SIZE
        self.ttl = ttl or settings.CACHE_TTL
        self._cache: OrderedDict = OrderedDict()
        self._timestamps: dict = {}
        
    async def get(self, key: str) -> Optional[Any]:
        """
        获取缓存值
        
        Args:
            key: 缓存键
            
        Returns:
            缓存值，如果不存在或已过期则返回 None
        """
        if key not in self._cache:
            logger.debug("cache_miss", key=key)
            return None
        
        # 检查是否过期
        timestamp = self._timestamps.get(key)
        if timestamp and datetime.now() > timestamp:
            # 已过期，删除
            del self._cache[key]
            del self._timestamps[key]
            logger.debug("cache_expired", key=key)
            return None
        
        # 移动到末尾（LRU）
        self._cache.move_to_end(key)
        logger.debug("cache_hit", key=key)
        return self._cache[key]
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        设置缓存值
        
        Args:
            key: 缓存键
            value: 缓存值
            ttl: 缓存过期时间（秒），如果为 None 则使用默认值
        """
        # 如果已存在，先删除
        if key in self._cache:
            del self._cache[key]
            del self._timestamps[key]
        
        # 如果超过最大容量，删除最旧的条目
        if len(self._cache) >= self.max_size:
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
            del self._timestamps[oldest_key]
            logger.debug("cache_evicted", key=oldest_key)
        
        # 添加新条目
        self._cache[key] = value
        expire_time = datetime.now() + timedelta(seconds=ttl or self.ttl)
        self._timestamps[key] = expire_time
        
        logger.debug("cache_set", key=key, ttl=ttl or self.ttl)
    
    async def delete(self, key: str) -> None:
        """
        删除缓存值
        
        Args:
            key: 缓存键
        """
        if key in self._cache:
            del self._cache[key]
            del self._timestamps[key]
            logger.debug("cache_deleted", key=key)
    
    async def clear(self) -> None:
        """清空所有缓存"""
        self._cache.clear()
        self._timestamps.clear()
        logger.info("cache_cleared")
    
    def size(self) -> int:
        """返回当前缓存条目数"""
        return len(self._cache)


# 全局缓存实例
_cache_instance: Optional[MemoryCache] = None


def get_cache() -> MemoryCache:
    """获取缓存实例（单例）"""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = MemoryCache()
    return _cache_instance
