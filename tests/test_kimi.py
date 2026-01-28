

from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key=os.getenv("OPENROUTER_API_KEY"),
)
# First API call with reasoning
response = client.chat.completions.create(
  model="deepseek/deepseek-v3.2",
  messages=[
          {
            "role": "user",
            "content": "什么是大模型"
          }
        ],
  extra_body={"reasoning": {"enabled": True}},
  stream=True,
)

# Extract the assistant message with reasoning_details
thinking_phase = True
for chunk in response:
    delta = chunk.choices[0].delta
    if hasattr(delta, "reasoning") and delta.reasoning:
        print(delta.reasoning, end="", flush=True)
    else:
        print(delta.content, end="", flush=True)
    

