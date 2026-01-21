"""
智能体 API 集成示例

展示如何将智能体集成到FastAPI中

注意: 这是一个示例文件，展示集成思路，不是完整的API实现
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import os
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# 导入智能体
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from agents import Agent, AgentConfig
from agents.rss_tools import RSS_TOOLS_DEFINITIONS


# 全局智能体实例（实际应用中应该使用依赖注入）
_agent = None


def get_agent() -> Agent:
    """获取或创建智能体实例"""
    global _agent
    if _agent is None:
        config = AgentConfig(
            model="qwen3-235b-instruct",
            api_key=os.getenv("QWEN_API_KEY"),
            base_url=os.getenv("QWEN_API_BASE_URL"),
            system_prompt="""你是一个智能新闻助手，可以帮助用户获取和分析最新的RSS新闻。

你有以下能力：
1. 获取最新的RSS新闻（来自FT中文网、BBC中文、极客公园、少数派等）
2. 根据用户的问题智能筛选相关新闻
3. 根据关键词搜索新闻

当用户询问新闻或资讯时，请合理使用这些工具。""",
            max_tool_iterations=5,
            temperature=0.7
        )
        
        _agent = Agent(config)
        
        # 注册工具
        for tool_def in RSS_TOOLS_DEFINITIONS:
            _agent.register_tool(
                name=tool_def["name"],
                description=tool_def["description"],
                parameters=tool_def["parameters"],
                function=tool_def["function"]
            )
    
    return _agent


# FastAPI应用
app = FastAPI(title="智能体API")


# 请求模型
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    stream: bool = True


# 响应模型
class ChatResponse(BaseModel):
    message: str
    tool_calls: List[Dict[str, Any]] = []


@app.post("/api/v1/agent/chat")
async def agent_chat(request: ChatRequest):
    """
    智能体聊天接口
    
    支持流式和非流式两种模式
    """
    try:
        agent = get_agent()
        
        # 转换消息格式
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        if request.stream:
            # 流式响应
            async def stream_generator():
                for chunk in agent.chat_stream(messages):
                    # 以Server-Sent Events (SSE)格式返回
                    yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
                
                # 发送结束标记
                yield "data: [DONE]\n\n"
            
            return StreamingResponse(
                stream_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                }
            )
        else:
            # 非流式响应
            response_text = agent.chat(messages)
            return ChatResponse(message=response_text)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/agent/tools")
async def list_tools():
    """列出所有可用的工具"""
    agent = get_agent()
    tools = agent.tool_registry.list_tools()
    
    return {
        "tools": tools,
        "count": len(tools)
    }


@app.get("/api/v1/agent/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "agent": "ready"}


# 前端集成示例
"""
JavaScript客户端示例：

// 流式请求
const eventSource = new EventSource('/api/v1/agent/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        messages: [
            {role: 'user', content: '帮我找一些AI的新闻'}
        ],
        stream: true
    })
});

eventSource.onmessage = (event) => {
    if (event.data === '[DONE]') {
        eventSource.close();
        return;
    }
    
    const chunk = JSON.parse(event.data);
    
    if (chunk.type === 'text') {
        // 显示文本内容
        appendMessage(chunk.content);
    } else if (chunk.type === 'tool_call') {
        // 显示工具调用
        showToolCall(chunk.tool_name, chunk.tool_arguments);
    } else if (chunk.type === 'tool_result') {
        // 显示工具结果
        showToolResult(chunk.tool_name);
    }
};

eventSource.onerror = (error) => {
    console.error('Stream error:', error);
    eventSource.close();
};
"""


if __name__ == "__main__":
    import uvicorn
    
    print("="*80)
    print("  智能体API服务")
    print("="*80)
    print("\n启动说明：")
    print("  1. 确保已配置环境变量（QWEN_API_KEY, QWEN_API_BASE_URL）")
    print("  2. 访问 http://localhost:8000/docs 查看API文档")
    print("  3. 使用POST请求 /api/v1/agent/chat 进行对话")
    print("\n示例请求：")
    print("""
    curl -X POST "http://localhost:8000/api/v1/agent/chat" \\
         -H "Content-Type: application/json" \\
         -d '{
           "messages": [
             {"role": "user", "content": "帮我找一些AI的新闻"}
           ],
           "stream": false
         }'
    """)
    print("="*80 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
