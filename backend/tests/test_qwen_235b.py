


"""
测试Qwen3-235b模型
使用OpenAI API调用Qwen3-235b模型

cd backend && source .venv/bin/activate && python3 tests/test_qwen_235b.py
"""

from openai import OpenAI
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# 加载 .env 文件
# 从 backend 目录加载 .env 文件
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

SYSTEM_PROMPT = "You are a helpful assistant."

base_url = os.getenv("QWEN_API_BASE_URL")
api_key = os.getenv("QWEN_API_KEY") 

if not base_url or not api_key:
    raise ValueError("QWEN_API_BASE_URL or QWEN_API_KEY is not set")

client = OpenAI(
    api_key=api_key, 
    base_url=base_url,
)

def qwen3_235b_yield(question):
    completion = client.chat.completions.create(
        model="qwen3-235b-instruct",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question}  
        ],
        stream=True
    )
    for chunk in completion:
        yield chunk.choices[0].delta.content

def qwen3_235b_yield_conversation(conversations):
    completion = client.chat.completions.create(
        model="qwen3-235b-instruct",
        messages=conversations,
        stream=True
    )
    for chunk in completion:
        yield chunk.choices[0].delta.content # type: ignore

if __name__ == "__main__":
    question = "你能做啥？"
    for chunk in qwen3_235b_yield(question):
        print(chunk, end="", flush=True)
    print()
    print("=" * 70)
    
    conversations = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question}
    ]
    for chunk in qwen3_235b_yield_conversation(conversations):
        print(chunk, end="", flush=True)
    print()

