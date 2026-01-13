#!/usr/bin/env python3
"""
测试聊天API的脚本
模拟前端发送消息到后端
"""
import requests
import json
import time

API_BASE = "http://localhost:8000/api"

def test_conversations():
    """测试对话列表API"""
    print("=" * 60)
    print("测试1: 获取对话列表")
    print("=" * 60)
    
    response = requests.get(f"{API_BASE}/conversations")
    print(f"状态码: {response.status_code}")
    data = response.json()
    print(f"对话列表: {json.dumps(data, indent=2, ensure_ascii=False)}")
    
    if data.get("conversations"):
        conv_id = data["conversations"][0]["id"]
        print(f"\n使用对话ID: {conv_id}")
        return conv_id
    else:
        print("\n创建新对话...")
        response = requests.post(
            f"{API_BASE}/conversations",
            json={"title": "测试对话"}
        )
        data = response.json()
        print(f"创建对话: {json.dumps(data, indent=2, ensure_ascii=False)}")
        return data["id"]

def test_messages(conversation_id):
    """测试获取消息历史"""
    print("\n" + "=" * 60)
    print(f"测试2: 获取对话 {conversation_id} 的消息历史")
    print("=" * 60)
    
    response = requests.get(f"{API_BASE}/conversations/{conversation_id}/messages")
    print(f"状态码: {response.status_code}")
    data = response.json()
    print(f"消息列表: {json.dumps(data, indent=2, ensure_ascii=False)}")
    return len(data.get("messages", []))

def test_chat_stream(conversation_id, message, thinking_enabled=False):
    """测试流式聊天API"""
    print("\n" + "=" * 60)
    print(f"测试3: 发送聊天消息（流式）")
    print("=" * 60)
    print(f"对话ID: {conversation_id}")
    print(f"消息: {message}")
    print(f"思考模式: {thinking_enabled}")
    print("-" * 60)
    
    url = f"{API_BASE}/chat/stream"
    payload = {
        "conversation_id": conversation_id,
        "message": message,
        "thinking_enabled": thinking_enabled
    }
    
    print(f"请求URL: {url}")
    print(f"请求体: {json.dumps(payload, indent=2, ensure_ascii=False)}")
    print("-" * 60)
    
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            stream=True,
            timeout=60
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print("-" * 60)
        
        if response.status_code != 200:
            print(f"错误响应: {response.text}")
            return False
        
        print("开始接收流式响应:")
        print("-" * 60)
        
        full_response = ""
        thinking_content = ""
        has_error = False
        
        # 处理SSE流
        for line in response.iter_lines():
            if line:
                line_str = line.decode('utf-8')
                print(f"原始行: {line_str}")
                
                if line_str.startswith('data: '):
                    json_str = line_str[6:].strip()
                    if json_str:
                        try:
                            data = json.loads(json_str)
                            data_type = data.get("type")
                            content = data.get("content", "")
                            
                            print(f"  -> 类型: {data_type}, 内容: {content[:50]}...")
                            
                            if data_type == "thinking":
                                thinking_content += content
                                print(f"  [思考] {content}")
                            elif data_type == "delta":
                                full_response += content
                                print(f"  [内容] {content}", end="", flush=True)
                            elif data_type == "done":
                                print("\n  [完成] 流式响应完成")
                            elif data_type == "error":
                                print(f"\n  [错误] {content}")
                                has_error = True
                        except json.JSONDecodeError as e:
                            print(f"  [解析错误] {e}, 原始数据: {json_str}")
        
        print("\n" + "-" * 60)
        print(f"完整响应长度: {len(full_response)} 字符")
        print(f"思考内容长度: {len(thinking_content)} 字符")
        print(f"是否有错误: {has_error}")
        
        return not has_error and len(full_response) > 0
        
    except requests.exceptions.Timeout:
        print("请求超时")
        return False
    except Exception as e:
        print(f"请求失败: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主测试流程"""
    print("\n" + "=" * 60)
    print("开始测试聊天API")
    print("=" * 60)
    
    # 1. 获取或创建对话
    conversation_id = test_conversations()
    
    # 2. 获取消息历史（应该为空）
    message_count_before = test_messages(conversation_id)
    
    # 3. 发送第一条消息
    print("\n发送第一条消息...")
    success1 = test_chat_stream(
        conversation_id,
        "你好，请介绍一下你自己",
        thinking_enabled=False
    )
    
    if success1:
        print("\n✓ 第一条消息发送成功")
    else:
        print("\n✗ 第一条消息发送失败")
        return
    
    # 等待一下，确保消息保存完成
    time.sleep(1)
    
    # 4. 再次获取消息历史（应该有2条消息：用户+助手）
    message_count_after = test_messages(conversation_id)
    
    if message_count_after == message_count_before + 2:
        print(f"\n✓ 消息历史正确：之前 {message_count_before} 条，现在 {message_count_after} 条")
    else:
        print(f"\n✗ 消息历史异常：之前 {message_count_before} 条，现在 {message_count_after} 条（期望 {message_count_before + 2} 条）")
    
    # 5. 发送第二条消息（测试对话上下文）
    print("\n发送第二条消息（测试上下文）...")
    success2 = test_chat_stream(
        conversation_id,
        "请用一句话总结刚才的对话",
        thinking_enabled=False
    )
    
    if success2:
        print("\n✓ 第二条消息发送成功")
    else:
        print("\n✗ 第二条消息发送失败")
    
    # 6. 最终检查消息历史
    print("\n最终消息历史:")
    final_count = test_messages(conversation_id)
    
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    print(f"对话ID: {conversation_id}")
    print(f"第一条消息: {'✓ 成功' if success1 else '✗ 失败'}")
    print(f"第二条消息: {'✓ 成功' if success2 else '✗ 失败'}")
    print(f"最终消息数: {final_count} (期望: 4条 - 2条用户消息 + 2条助手回复)")
    
    if success1 and success2 and final_count == 4:
        print("\n🎉 所有测试通过！")
    else:
        print("\n⚠️  部分测试失败，请检查日志")

if __name__ == "__main__":
    main()
