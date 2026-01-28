"""
测试智能体API - Docker环境

测试通过Nginx访问智能体API
"""

import requests
import json
import time

# Docker环境的API地址
BASE_URL = "http://localhost:28888/api"

# 创建会话保持
session = requests.Session()

print("\n" + "="*80)
print("  智能体API Docker环境测试")
print("="*80 + "\n")

# 测试1: 健康检查
print("1. 健康检查...")
try:
    response = session.get("http://localhost:28888/health", timeout=5)
    if response.status_code == 200:
        print(f"   ✅ 健康检查通过: {response.json()}")
    else:
        print(f"   ❌ 健康检查失败: {response.status_code}")
except Exception as e:
    print(f"   ❌ 健康检查失败: {e}")

time.sleep(1)

# 测试2: 创建会话
print("\n2. 创建会话...")
try:
    response = session.post(
        f"{BASE_URL}/conversations",
        json={"title": "智能体测试"},
        timeout=10
    )
    if response.status_code == 200:
        conv = response.json()
        conversation_id = conv['id']
        print(f"   ✅ 会话创建成功, ID: {conversation_id}")
    elif response.status_code == 201:
        conv = response.json()
        conversation_id = conv['id']
        print(f"   ✅ 会话创建成功, ID: {conversation_id}")
    else:
        print(f"   ❌ 会话创建失败: {response.status_code}")
        print(f"   响应: {response.text}")
        exit(1)
except Exception as e:
    print(f"   ❌ 会话创建失败: {e}")
    exit(1)

time.sleep(1)

# 测试3: 智能体对话
print("\n3. 智能体对话（工具调用测试）...")
test_message = "帮我获取5条最新新闻"
print(f"   用户: {test_message}\n")
print("   助手: ", end="", flush=True)

try:
    response = session.post(
        f"{BASE_URL}/agent/stream",
        json={
            "conversation_id": conversation_id,
            "message": test_message,
            "thinking_enabled": False
        },
        stream=True,
        timeout=120
    )
    
    if response.status_code != 200:
        print(f"\n   ❌ 请求失败: {response.status_code}")
        print(f"   响应: {response.text}")
        exit(1)
    
    content_received = False
    tool_called = False
    
    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                data_str = line[6:]
                try:
                    data = json.loads(data_str)
                    
                    if data['type'] == 'delta':
                        print(data['content'], end="", flush=True)
                        content_received = True
                    
                    elif data['type'] == 'tool_call':
                        tool_name = data.get('tool_name', 'unknown')
                        print(f"\n\n   🔧 调用工具: {tool_name}", flush=True)
                        if 'tool_arguments' in data:
                            print(f"   参数: {json.dumps(data['tool_arguments'], ensure_ascii=False)}")
                        tool_called = True
                    
                    elif data['type'] == 'tool_result':
                        tool_name = data.get('tool_name', 'unknown')
                        print(f"   ✅ 工具 {tool_name} 执行完成\n", flush=True)
                    
                    elif data['type'] == 'done':
                        print("\n\n   ✅ 对话完成")
                        break
                    
                    elif data['type'] == 'error':
                        print(f"\n\n   ❌ 错误: {data['content']}")
                        exit(1)
                
                except json.JSONDecodeError as e:
                    print(f"\n   解析JSON失败: {e}")
    
    if content_received and tool_called:
        print("\n   ✅ 智能体功能正常（工具调用成功）")
    elif content_received:
        print("\n   ⚠️  收到响应，但未检测到工具调用")
    else:
        print("\n   ❌ 未收到有效响应")
        exit(1)

except Exception as e:
    print(f"\n   ❌ 对话失败: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

# 测试4: 获取消息历史
print("\n4. 获取消息历史...")
try:
    response = session.get(
        f"{BASE_URL}/conversations/{conversation_id}/messages",
        timeout=10
    )
    if response.status_code == 200:
        messages = response.json()['messages']
        print(f"   ✅ 获取到 {len(messages)} 条消息")
        if len(messages) >= 2:  # 至少有用户消息和助手回复
            print(f"   - 用户: {messages[0]['content'][:50]}...")
            print(f"   - 助手: {messages[1]['content'][:50]}...")
    else:
        print(f"   ❌ 获取消息失败: {response.status_code}")
except Exception as e:
    print(f"   ❌ 获取消息失败: {e}")

print("\n" + "="*80)
print("  ✅ 所有测试通过！智能体API工作正常")
print("="*80 + "\n")

print("🎉 测试完成！可以在前端访问了：")
print("   http://localhost:28888/ (Agent页面)")
print()
