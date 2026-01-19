# 数据库迁移指南 - 添加用户ID字段

## 概述

本次更新为 `Conversation` 表添加了 `user_id` 字段，用于实现用户数据隔离。每个访问网站的游客都会获得一个唯一的ID，所有会话数据都会关联到这个ID。

## 迁移步骤

### 方案一：重新创建数据库（推荐用于开发环境）

如果您的数据库中没有重要数据，或者这是开发环境，最简单的方法是删除旧数据库并重新创建：

```bash
# 停止后端服务
# 删除数据库文件
rm backend/chat_history.db

# 重新启动后端服务，数据库会自动创建
cd backend
uvicorn main:app --reload
```

### 方案二：手动迁移（保留现有数据）

如果您需要保留现有的会话数据，需要手动执行SQL迁移：

```bash
# 1. 备份数据库
cp backend/chat_history.db backend/chat_history.db.backup

# 2. 使用SQLite命令行工具迁移
sqlite3 backend/chat_history.db <<EOF
-- 添加 user_id 字段（先允许NULL）
ALTER TABLE conversations ADD COLUMN user_id VARCHAR(36);

-- 为现有记录生成临时用户ID（使用会话ID作为基础）
UPDATE conversations SET user_id = 'legacy_' || id || '_' || substr(hex(randomblob(16)), 1, 16);

-- 创建索引
CREATE INDEX IF NOT EXISTS ix_conversations_user_id ON conversations(user_id);

-- 注意：SQLite不支持直接添加NOT NULL约束，需要重建表
-- 如果需要强制NOT NULL，请使用方案三
EOF
```

### 方案三：完整迁移脚本（推荐用于生产环境）

创建一个Python迁移脚本：

```python
# backend/migrate_add_user_id.py
import sqlite3
import uuid
from pathlib import Path

DB_PATH = Path(__file__).parent / "chat_history.db"
BACKUP_PATH = Path(__file__).parent / "chat_history.db.backup"

def migrate():
    # 备份数据库
    if DB_PATH.exists():
        import shutil
        shutil.copy(DB_PATH, BACKUP_PATH)
        print(f"数据库已备份到: {BACKUP_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 检查是否已经迁移
        cursor.execute("PRAGMA table_info(conversations)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'user_id' in columns:
            print("数据库已经包含 user_id 字段，无需迁移")
            return
        
        # 创建新表结构
        cursor.execute("""
            CREATE TABLE conversations_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id VARCHAR(36) NOT NULL,
                title VARCHAR(255) NOT NULL DEFAULT '新对话',
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            )
        """)
        
        # 迁移数据：为每个现有会话分配一个唯一的用户ID
        cursor.execute("SELECT id, title, created_at, updated_at FROM conversations")
        conversations = cursor.fetchall()
        
        # 为所有旧会话分配一个默认用户ID（表示历史数据）
        default_user_id = str(uuid.uuid4())
        print(f"为 {len(conversations)} 个现有会话分配默认用户ID: {default_user_id}")
        
        for conv in conversations:
            cursor.execute("""
                INSERT INTO conversations_new (id, user_id, title, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            """, (conv[0], default_user_id, conv[1], conv[2], conv[3]))
        
        # 删除旧表，重命名新表
        cursor.execute("DROP TABLE conversations")
        cursor.execute("ALTER TABLE conversations_new RENAME TO conversations")
        
        # 创建索引
        cursor.execute("CREATE INDEX IF NOT EXISTS ix_conversations_user_id ON conversations(user_id)")
        
        # 提交更改
        conn.commit()
        print("数据库迁移完成！")
        
    except Exception as e:
        conn.rollback()
        print(f"迁移失败: {e}")
        print(f"请从备份恢复: {BACKUP_PATH}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
```

运行迁移脚本：

```bash
cd backend
python migrate_add_user_id.py
```

## 验证迁移

迁移完成后，验证数据库结构：

```bash
sqlite3 backend/chat_history.db ".schema conversations"
```

应该看到 `user_id VARCHAR(36) NOT NULL` 字段。

## 注意事项

1. **数据隔离**：迁移后，所有旧会话会被分配同一个默认用户ID。这意味着：
   - 如果多个用户之前共享数据库，他们的旧会话会混在一起
   - 新用户访问时会获得新的独立ID，数据完全隔离

2. **生产环境**：在生产环境执行迁移前，请务必：
   - 备份数据库
   - 在测试环境先验证迁移脚本
   - 选择合适的时间窗口（低峰期）

3. **前端兼容性**：前端代码无需修改，系统会自动处理用户ID的创建和管理。

## 回滚

如果需要回滚迁移：

```bash
# 恢复备份
cp backend/chat_history.db.backup backend/chat_history.db

# 或者删除数据库重新开始
rm backend/chat_history.db
```

## 后续

迁移完成后，系统会自动：
- 为新用户生成唯一的UUID
- 通过Cookie保存用户ID（有效期1年）
- 所有新会话都会关联到对应的用户ID
- 用户只能访问自己的会话数据
