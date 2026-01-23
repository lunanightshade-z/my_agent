"""
智能体 API 端点
"""
from fastapi import APIRouter, Depends, Request, Response, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import json
import subprocess
import sys
from pathlib import Path
from app.api.schemas import ChatRequest
from app.services.agent_service import AgentService
from app.dependencies import get_agent_service, get_or_create_user_id
from app.infrastructure.logging.setup import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/stream")
async def agent_chat_stream(
    chat_request: ChatRequest,
    request: Request,
    response: Response,
    agent_service: AgentService = Depends(get_agent_service)
):
    """
    智能体流式聊天端点（SSE）
    支持工具调用的智能对话
    """
    user_id = get_or_create_user_id(request, response)
    
    async def event_generator():
        """SSE 事件生成器"""
        try:
            async for chunk_data in agent_service.chat_stream(
                conversation_id=chat_request.conversation_id,
                user_message=chat_request.message,
                user_id=user_id
            ):
                # 将数据编码为 JSON 并发送
                data = json.dumps(chunk_data, ensure_ascii=False)
                yield f"data: {data}\n\n"
                
        except Exception as e:
            # 发送错误信息
            error_data = json.dumps({
                "type": "error",
                "content": str(e)
            }, ensure_ascii=False)
            yield f"data: {error_data}\n\n"
    
    # 返回 SSE 响应
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # 禁用 Nginx 缓冲
        }
    )


@router.post("/rss-cache/generate")
async def generate_rss_cache():
    """
    手动触发RSS缓存生成
    用于前端按钮点击立即生成缓存
    """
    try:
        # 确定缓存脚本路径
        # Docker环境下脚本在 /app/tools/rss_cache_job.py
        # 本地开发在 backend/tools/rss_cache_job.py
        import os
        if os.path.exists("/app/tools/rss_cache_job.py"):
            script_path = "/app/tools/rss_cache_job.py"
            python_cmd = "python3"
        else:
            # 本地开发环境
            backend_path = Path(__file__).parent.parent.parent.parent
            script_path = str(backend_path / "tools" / "rss_cache_job.py")
            python_cmd = sys.executable
        
        logger.info(f"开始生成RSS缓存，脚本路径: {script_path}")
        
        # 执行缓存生成脚本
        result = subprocess.run(
            [python_cmd, script_path],
            capture_output=True,
            text=True,
            timeout=300,  # 5分钟超时
            cwd="/app" if os.path.exists("/app") else str(Path(script_path).parent.parent)
        )
        
        if result.returncode == 0:
            logger.info("RSS缓存生成成功")
            return JSONResponse({
                "success": True,
                "message": "RSS缓存生成成功",
                "output": result.stdout
            })
        else:
            logger.error(f"RSS缓存生成失败: {result.stderr}")
            raise HTTPException(
                status_code=500,
                detail=f"缓存生成失败: {result.stderr}"
            )
            
    except subprocess.TimeoutExpired:
        logger.error("RSS缓存生成超时")
        raise HTTPException(
            status_code=504,
            detail="缓存生成超时，请稍后重试"
        )
    except Exception as e:
        logger.error(f"RSS缓存生成异常: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"缓存生成失败: {str(e)}"
        )
