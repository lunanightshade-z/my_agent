"""
FastAPI 主应用
企业级架构版本 - 包含请求追踪、中间件、错误处理
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time
import uuid
from app.config import settings
from app.infrastructure.logging.setup import get_logger
from app.infrastructure.database.connection import engine, Base
from app.api.v1 import conversations, messages, chat

logger = get_logger(__name__)


# ==================== 生命周期管理 ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    logger.info(
        "application_starting",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT
    )
    
    # 创建数据库表
    Base.metadata.create_all(bind=engine)
    logger.info("database_tables_created")
    
    yield
    
    # 关闭时执行
    logger.info("application_shutting_down")


# ==================== 创建 FastAPI 应用 ====================

app = FastAPI(
    title=settings.APP_NAME,
    description="基于智谱AI的企业级聊天应用后端API",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)


# ==================== 中间件配置 ====================

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)


# 请求 ID 追踪中间件
@app.middleware("http")
async def add_request_id_middleware(request: Request, call_next):
    """
    为每个请求添加唯一 ID 并记录请求日志
    """
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()
    
    # 处理请求
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # 记录请求日志
        logger.info(
            "http_request",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=round(process_time * 1000, 2),
            client_host=request.client.host if request.client else None
        )
        
        # 添加请求 ID 到响应头
        response.headers["X-Request-ID"] = request_id
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "http_request_failed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            error=str(e),
            error_type=type(e).__name__,
            duration_ms=round(process_time * 1000, 2)
        )
        raise


# ==================== 异常处理 ====================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """处理请求验证错误"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.warning(
        "validation_error",
        request_id=request_id,
        errors=exc.errors(),
        body=exc.body
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": exc.errors(),
            "request_id": request_id
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器"""
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(
        "unhandled_exception",
        request_id=request_id,
        error=str(exc),
        error_type=type(exc).__name__,
        path=request.url.path
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "服务器内部错误",
            "request_id": request_id
        }
    )


# ==================== 路由注册 ====================

# 注册 API v1 路由
app.include_router(conversations.router, prefix=settings.API_V1_PREFIX)
app.include_router(messages.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)


# ==================== 基础端点 ====================

@app.get("/")
def root():
    """根路径，返回 API 信息"""
    return {
        "message": f"{settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
