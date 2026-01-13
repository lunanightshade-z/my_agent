#!/usr/bin/env python3
"""
测试前端完整流程
模拟前端的行为：加载对话列表、选择对话、加载消息、发送消息
"""
import requests
import json

API_BASE = "http://localhost:28888/api"  # 通过Nginx代理

def test_full_flow():
    """测试完整的前端流程"""
    print("=" * 60)
    print("测试前端完整流程")
    print("=" * 60)
    
    # 1. 获取对话列表
    print("\n1. 获取对话列表...")
    response = requests.get(f"{API_BASE}/conversations")
    assert response.status_code == 200, f"获取对话列表失败: {response.status_code}"
    data = response.json()
    conversations = data.get("conversations", [])
    print(f"   找到 {len(conversations)} 个对话")
    
    if not conversations:
        print("   创建新对话...")
        response = requests.post(f"{API_BASE}/conversations", json={"title": "测试对话"})
        assert response.status_code == 201, f"创建对话失败: {response.status_code}"
        new_conv = response.json()
        conversations = [new_conv]
        print(f"   创建成功，ID: {new_conv['id']}")
    
    # 2. 选择第一个对话并加载消息
    conversation_id = conversations[0]["id"]
    print(f"\n2. 选择对话 {conversation_id} 并加载消息...")
    response = requests.get(f"{API_BASE}/conversations/{conversation_id}/messages")
    assert response.status_code == 200, f"获取消息失败: {response.status_code}"
    messages_data = response.json()
    messages = messages_data.get("messages", [])
    print(f"   找到 {len(messages)} 条消息")
    
    # 显示消息摘要
    for i, msg in enumerate(messages[:3], 1):
        print(f"   消息 {i}: {msg['role']} - {msg['content'][:50]}...")
    
    # 3. 发送新消息
    print(f"\n3. 发送新消息到对话 {conversation_id}...")
    test_message = "这是一条测试消息，请简短回复"
    print(f"   消息内容: {test_message}")
    
    response = requests.post(
        f"{API_BASE}/chat/stream",
        json={
            "conversation_id": conversation_id,
            "message": test_message,
            "thinking_enabled": False
        },
        stream=True,
        timeout=30
    )
    
    assert response.status_code == 200, f"发送消息失败: {response.status_code}"
    print("   开始接收流式响应...")
    
    full_response = ""
    has_done = False
    
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                json_str = line_str[6:].strip()
                if json_str:
                    try:
                        data = json.loads(json_str)
                        data_type = data.get("type")
                        content = data.get("content", "")
                        
                        if data_type == "delta":
                            full_response += content
                            print(f"   [内容] {content}", end="", flush=True)
                        elif data_type == "done":
                            print("\n   [完成]")
                            has_done = True
                        elif data_type == "error":
                            print(f"\n   [错误] {content}")
                            return False
                    except json.JSONDecodeError:
                        pass
    
    print(f"\n   完整回复长度: {len(full_response)} 字符")
    
    if not has_done:
        print("   ⚠️  警告: 未收到完成信号")
    
    # 4. 再次获取消息，验证消息已保存
    print(f"\n4. 验证消息已保存...")
    import time
    time.sleep(1)  # 等待消息保存
    
    response = requests.get(f"{API_BASE}/conversations/{conversation_id}/messages")
    assert response.status_code == 200
    messages_data = response.json()
    new_messages = messages_data.get("messages", [])
    print(f"   现在有 {len(new_messages)} 条消息（之前 {len(messages)} 条）")
    
    # 检查最后两条消息
    if len(new_messages) >= len(messages) + 2:
        last_user_msg = new_messages[-2]
        last_assistant_msg = new_messages[-1]
        print(f"   最后用户消息: {last_user_msg['content'][:50]}...")
        print(f"   最后助手回复: {last_assistant_msg['content'][:50]}...")
        
        if last_user_msg['content'] == test_message:
            print("   ✓ 用户消息已正确保存")
        else:
            print(f"   ✗ 用户消息不匹配: 期望 '{test_message}', 实际 '{last_user_msg['content']}'")
        
        if len(last_assistant_msg['content']) > 0:
            print("   ✓ 助手回复已正确保存")
        else:
            print("   ✗ 助手回复为空")
    else:
        print(f"   ✗ 消息数量异常: 期望至少 {len(messages) + 2} 条，实际 {len(new_messages)} 条")
    
    print("\n" + "=" * 60)
    print("测试完成")
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    try:
        success = test_full_flow()
        if success:
            print("\n🎉 所有测试通过！")
        else:
            print("\n⚠️  部分测试失败")
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        import traceback
        traceback.print_exc()
