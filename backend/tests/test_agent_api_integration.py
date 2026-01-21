"""
测试智能体API集成

运行方式:
cd backend && source .venv/bin/activate && python3 tests/test_agent_api_integration.py
"""

import requests
import json
import time

# API配置
BASE_URL = "http://localhost:8000/api"

def test_create_conversation():
    """测试创建会话"""
    print("="*80)
    print("测试1: 创建会话")
    print("="*80)
    
    response = requests.post(f"{BASE_URL}/conversations", json={
        "title": "智能体测试会话"
    })
    
    if response.status_code == 200:
        conv = response.json()
        print(f"✅ 会话创建成功, ID: {conv['id']}")
        return conv['id']
    else:
        print(f"❌ 会话创建失败: {response.text}")
        return None


def test_agent_chat_stream(conversation_id):
    """测试智能体流式对话"""
    print("\n" + "="*80)
    print("测试2: 智能体流式对话（工具调用）")
    print("="*80)
    
    # 测试问题
    test_message = "帮我获取5条最新新闻"
    
    print(f"\n用户: {test_message}\n")
    print("助手: ", end="", flush=True)
    
    response = requests.post(
        f"{BASE_URL}/agent/stream",
        json={
            "conversation_id": conversation_id,
            "message": test_message,
            "thinking_enabled": False
        },
        stream=True,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code != 200:
        print(f"\n❌ 请求失败: {response.status_code}")
        print(response.text)
        return
    
    # 处理SSE流
    for line in response.iter_lines():
        if line:
            line = line.decode('utf-8')
            if line.startswith('data: '):
                data_str = line[6:]
                try:
                    data = json.loads(data_str)
                    
                    if data['type'] == 'delta':
                        # 文本内容
                        print(data['content'], end="", flush=True)
                    
                    elif data['type'] == 'tool_call':
                        # 工具调用
                        tool_name = data.get('tool_name', 'unknown')
                        print(f"\n\n🔧 调用工具: {tool_name}", flush=True)
                        if 'tool_arguments' in data:
                            print(f"   参数: {json.dumps(data['tool_arguments'], ensure_ascii=False)}")
                        print(flush=True)
                    
                    elif data['type'] == 'tool_result':
                        # 工具结果
                        tool_name = data.get('tool_name', 'unknown')
                        print(f"✅ 工具 {tool_name} 执行完成\n", flush=True)
                    
                    elif data['type'] == 'done':
                        # 完成
                        print("\n\n✅ 对话完成")
                        break
                    
                    elif data['type'] == 'error':
                        # 错误
                        print(f"\n\n❌ 错误: {data['content']}")
                        break
                
                except json.JSONDecodeError as e:
                    print(f"\n解析JSON失败: {e}")


def test_get_messages(conversation_id):
    """测试获取消息历史"""
    print("\n" + "="*80)
    print("测试3: 获取消息历史")
    print("="*80)
    
    response = requests.get(f"{BASE_URL}/conversations/{conversation_id}/messages")
    
    if response.status_code == 200:
        messages = response.json()['messages']
        print(f"✅ 获取到 {len(messages)} 条消息")
        for i, msg in enumerate(messages, 1):
            print(f"\n{i}. [{msg['role']}]: {msg['content'][:100]}...")
    else:
        print(f"❌ 获取消息失败: {response.text}")


def main():
    """主测试流程"""
    print("\n🚀 开始测试智能体API集成\n")
    
    # 1. 创建会话
    conversation_id = test_create_conversation()
    if not conversation_id:
        print("\n❌ 测试终止: 无法创建会话")
        return
    
    time.sleep(1)
    
    # 2. 测试智能体对话
    test_agent_chat_stream(conversation_id)
    
    time.sleep(1)
    
    # 3. 获取消息历史
    test_get_messages(conversation_id)
    
    print("\n" + "="*80)
    print("✅ 测试完成")
    print("="*80)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n测试被用户中断")
    except Exception as e:
        print(f"\n\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
