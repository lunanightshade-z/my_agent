"""
智能体 API 端点
"""
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import StreamingResponse
import json
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
