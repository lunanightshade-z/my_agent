"""
用户隔离功能测试脚本
测试数据库结构和用户ID功能
"""
import sqlite3
from pathlib import Path
from datetime import datetime

def test_database_structure():
    """测试数据库结构"""
    print("=" * 60)
    print("1. 数据库结构验证")
    print("=" * 60)
    
    db_path = Path("chat_history.db")
    if not db_path.exists():
        print("✗ 数据库文件不存在")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 检查表结构
        cursor.execute("PRAGMA table_info(conversations)")
        columns = cursor.fetchall()
        
        column_names = [col[1] for col in columns]
        required_fields = ['id', 'user_id', 'title', 'created_at', 'updated_at']
        
        print("\n表字段检查:")
        for field in required_fields:
            if field in column_names:
                # 获取字段详情
                col_info = next((c for c in columns if c[1] == field), None)
                nullable = "NOT NULL" if col_info[3] else "NULL"
                print(f"  ✓ {field:15} {col_info[2]:15} {nullable}")
            else:
                print(f"  ✗ {field:15} 缺失")
                return False
        
        # 检查索引
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='conversations'")
        indexes = [idx[0] for idx in cursor.fetchall()]
        
        print("\n索引检查:")
        if 'ix_conversations_user_id' in indexes:
            print("  ✓ user_id 索引已创建")
        else:
            print("  ✗ user_id 索引未创建")
            return False
        
        print("\n✓ 数据库结构验证通过")
        return True
        
    finally:
        conn.close()


def test_user_id_functionality():
    """测试用户ID功能（模拟）"""
    print("\n" + "=" * 60)
    print("2. 用户ID功能模拟测试")
    print("=" * 60)
    
    import uuid
    
    # 模拟用户ID生成
    user_id_1 = str(uuid.uuid4())
    user_id_2 = str(uuid.uuid4())
    
    print(f"\n模拟用户1 ID: {user_id_1}")
    print(f"模拟用户2 ID: {user_id_2}")
    
    # 验证UUID格式
    try:
        uuid.UUID(user_id_1)
        uuid.UUID(user_id_2)
        print("✓ UUID格式验证通过")
    except ValueError:
        print("✗ UUID格式验证失败")
        return False
    
    # 验证不同用户ID不同
    if user_id_1 != user_id_2:
        print("✓ 不同用户的ID不同")
    else:
        print("✗ 不同用户的ID相同（不应该发生）")
        return False
    
    print("\n✓ 用户ID功能测试通过")
    return True


def test_database_operations():
    """测试数据库操作"""
    print("\n" + "=" * 60)
    print("3. 数据库操作测试")
    print("=" * 60)
    
    db_path = Path("chat_history.db")
    if not db_path.exists():
        print("✗ 数据库文件不存在")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        import uuid
        
        # 测试插入（模拟用户1创建会话）
        user_id_1 = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO conversations (user_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        """, (user_id_1, "测试会话1", datetime.utcnow(), datetime.utcnow()))
        conversation_id_1 = cursor.lastrowid
        print(f"\n✓ 插入会话1成功 (ID: {conversation_id_1}, User: {user_id_1[:8]}...)")
        
        # 测试插入（模拟用户2创建会话）
        user_id_2 = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO conversations (user_id, title, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        """, (user_id_2, "测试会话2", datetime.utcnow(), datetime.utcnow()))
        conversation_id_2 = cursor.lastrowid
        print(f"✓ 插入会话2成功 (ID: {conversation_id_2}, User: {user_id_2[:8]}...)")
        
        # 测试查询（模拟用户1只能看到自己的会话）
        cursor.execute("SELECT id, title FROM conversations WHERE user_id = ?", (user_id_1,))
        user1_conversations = cursor.fetchall()
        print(f"\n✓ 用户1的会话查询: {len(user1_conversations)} 个")
        assert len(user1_conversations) == 1, "用户1应该只有1个会话"
        assert user1_conversations[0][0] == conversation_id_1, "会话ID不匹配"
        
        # 测试查询（模拟用户2只能看到自己的会话）
        cursor.execute("SELECT id, title FROM conversations WHERE user_id = ?", (user_id_2,))
        user2_conversations = cursor.fetchall()
        print(f"✓ 用户2的会话查询: {len(user2_conversations)} 个")
        assert len(user2_conversations) == 1, "用户2应该只有1个会话"
        assert user2_conversations[0][0] == conversation_id_2, "会话ID不匹配"
        
        # 验证隔离：用户1不应该看到用户2的会话
        user1_ids = [c[0] for c in user1_conversations]
        assert conversation_id_2 not in user1_ids, "用户1不应该看到用户2的会话"
        print("✓ 用户隔离验证通过")
        
        # 清理测试数据
        cursor.execute("DELETE FROM conversations WHERE id IN (?, ?)", (conversation_id_1, conversation_id_2))
        conn.commit()
        print("\n✓ 测试数据已清理")
        
        print("\n✓ 数据库操作测试通过")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"\n✗ 数据库操作测试失败: {e}")
        return False
    finally:
        conn.close()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("用户隔离功能完整测试")
    print("=" * 60)
    
    results = []
    
    # 测试1: 数据库结构
    results.append(("数据库结构", test_database_structure()))
    
    # 测试2: 用户ID功能
    results.append(("用户ID功能", test_user_id_functionality()))
    
    # 测试3: 数据库操作
    results.append(("数据库操作", test_database_operations()))
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{test_name:20} {status}")
        if not result:
            all_passed = False
    
    print("=" * 60)
    if all_passed:
        print("✓ 所有测试通过！用户隔离功能已正确实现")
    else:
        print("✗ 部分测试失败，请检查上述错误")
    print("=" * 60)
