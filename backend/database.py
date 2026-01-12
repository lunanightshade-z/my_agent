"""
数据库配置模块
使用 SQLAlchemy 配置 SQLite 数据库连接
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 数据库文件路径
SQLALCHEMY_DATABASE_URL = "sqlite:///./chat_history.db"

# 创建数据库引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}  # SQLite 需要此配置
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

# 依赖注入：获取数据库会话
def get_db():
    """
    提供数据库会话的依赖注入函数
    使用 yield 确保会话在请求结束后关闭
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

