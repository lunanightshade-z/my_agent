
import os
from zai import ZhipuAiClient
from dotenv import load_dotenv

load_dotenv()
zhipu_key = os.getenv("ZHIPU_API_KEY")

# 初始化客户端
zhipu_client = ZhipuAiClient(api_key=zhipu_key)

def get_zhipu_response(zhipu_client, question, thinking="disabled"):
    # 创建流式消息请求
    response = zhipu_client.chat.completions.create(
        model="glm-4.7",
        messages=[
            {"role": "user", "content": question}
        ],
        stream=True,
        extra_body={"thinking": {
            "type": thinking
        }
    },
    )

    # 处理流式响应
    full_content = ""
    for chunk in response:
        if not chunk.choices:
            continue
        
        delta = chunk.choices[0].delta
        
        # 处理增量内容
        if hasattr(delta, 'content') and delta.content:
            full_content += delta.content
            print(delta.content, end="", flush=True)
    return full_content

def get_zhipu_response_converse(zhipu_client, conversations, thinking="disabled"):
    # 处理流式响应
    full_content = ""

    # 创建流式深度思考请求
    response = zhipu_client.chat.completions.create(
        model="glm-4.7",
        messages=conversations,
        extra_body={
            "thinking": {
                "type": thinking
            }
        },
        stream=True,  # 启用流式输出
        temperature=1.0
    )

    # 处理流式响应
    reasoning_content = ""
    thinking_phase = True

    for chunk in response:
        if not chunk.choices:
            continue
        
        delta = chunk.choices[0].delta
        
        # 处理思考过程（如果有）
        if hasattr(delta, 'reasoning_content') and delta.reasoning_content:
            reasoning_content += delta.reasoning_content
            if thinking_phase:
                print("🧠 思考中...", end="", flush=True)
                thinking_phase = False
            print(delta.reasoning_content, end="", flush=True)
        
        # 处理回答内容
        if hasattr(delta, 'content') and delta.content:
            if thinking_phase:
                print("\n\n💡 回答:")
                thinking_phase = False
            print(delta.content, end="", flush=True)


    return full_content


conversations = []
conversations.append({"role": "user", "content": "你是谁"})

answer = get_zhipu_response_converse(zhipu_client, conversations)










