"""
智谱AI API 服务模块
基于 test_zhipu_api.py 改造为异步流式生成器，支持 SSE
"""
import os
from typing import AsyncGenerator, List, Dict
from zhipuai import ZhipuAI
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()
zhipu_key = os.getenv("ZHIPU_API_KEY")

# 初始化智谱AI客户端（全局单例）
zhipu_client = ZhipuAI(api_key=zhipu_key)


async def get_zhipu_stream_response(
    conversations: List[Dict[str, str]], 
    thinking: str = "disabled"
) -> AsyncGenerator[Dict[str, str], None]:
    """
    获取智谱AI的流式响应（异步生成器）
    
    参数:
        conversations: 会话历史，格式为 [{"role": "user", "content": "..."}]
        thinking: thinking模式，"disabled" 或 "enabled"
    
    生成:
        返回字典，包含类型和内容：
        - {"type": "thinking", "content": "..."} 思考过程
        - {"type": "content", "content": "..."} 回答内容
    """
    try:
        # 创建流式消息请求
        response = zhipu_client.chat.completions.create(
            model="glm-4.7",
            messages=conversations,
            stream=True,
            temperature=1.0,
            extra_body={
                "thinking": {
                    "type": thinking
                }
            },
        )
        
        thinking_phase = True
        
        # 逐块处理流式响应
        for chunk in response:
            if not chunk.choices:
                continue
            
            delta = chunk.choices[0].delta
            
            # 处理思考过程（如果有）
            if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
                if thinking_phase:
                    thinking_phase = False
                yield {"type": "thinking", "content": delta.reasoning_content}
            
            # 处理回答内容
            if hasattr(delta, 'content') and delta.content:
                if thinking_phase:
                    # 如果还在思考阶段，说明思考过程已结束，开始回答
                    thinking_phase = False
                yield {"type": "content", "content": delta.content}
                
    except Exception as e:
        # 如果发生错误，生成错误信息
        yield {"type": "error", "content": str(e)}


def get_zhipu_response_sync(
    conversations: List[Dict[str, str]], 
    thinking: str = "disabled"
) -> str:
    """
    获取智谱AI的完整响应（同步版本，用于非流式场景）
    
    参数:
        conversations: 会话历史
        thinking: thinking模式
    
    返回:
        完整的AI回复内容
    """
    try:
        response = zhipu_client.chat.completions.create(
            model="glm-4-flash",
            messages=conversations,
            stream=True,
            extra_body={
                "thinking": {
                    "type": thinking
                }
            },
        )
        
        full_content = ""
        for chunk in response:
            if not chunk.choices:
                continue
            
            delta = chunk.choices[0].delta
            
            if hasattr(delta, 'content') and delta.content:
                full_content += delta.content
        
        return full_content
        
    except Exception as e:
        return f"[ERROR] {str(e)}"


def generate_conversation_title_sync(first_message: str) -> str:
    """
    生成对话标题（同步版本）
    
    参数:
        first_message: 对话的第一条用户消息
    
    返回:
        生成的标题（3-10个字）
    """
    try:
        # 调用智谱API生成标题
        response = zhipu_client.chat.completions.create(
            model="glm-4-flash",
            messages=[
                {
                    "role": "system",
                    "content": "你是一个标题生成助手。请为用户的对话生成一个简短、准确的标题，3-10个字。只返回标题文本，不要有其他内容。"
                },
                {
                    "role": "user",
                    "content": f"请为以下对话生成标题：\n\n{first_message}"
                }
            ],
            temperature=0.7,
            max_tokens=50,
        )
        
        title = response.choices[0].message.content.strip()
        
        # 去除引号
        title = title.strip('"\'""''')
        
        # 限制长度
        if len(title) > 15:
            title = title[:15]
        
        return title if title else first_message[:15]
        
    except Exception as e:
        print(f"生成标题失败: {str(e)}")
        # 失败时使用消息前15个字
        return first_message[:15]


