"""
数据库迁移脚本：为Conversation表添加user_id字段
适用于容器数据库迁移

使用方法：
    python -m app.migrate_add_user_id
"""
import sqlite3
import uuid
from pathlib import Path
import shutil
from datetime import datetime
import os

# 从环境变量获取数据库路径，默认为容器内的路径
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/chat_history.db")
# 提取SQLite文件路径
if DATABASE_URL.startswith("sqlite:///"):
    db_path_str = DATABASE_URL.replace("sqlite:///", "")
    # 处理相对路径
    if db_path_str.startswith("./"):
        db_path_str = db_path_str[2:]
    DB_PATH = Path(db_path_str)
else:
    DB_PATH = Path("data/chat_history.db")

BACKUP_PATH = DB_PATH.parent / f"chat_history.db.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"

def migrate():
    """执行数据库迁移"""
    if not DB_PATH.exists():
        print(f"数据库文件不存在: {DB_PATH}")
        print("首次启动时会自动创建，无需迁移。")
        return True
    
    # 备份数据库
    shutil.copy(DB_PATH, BACKUP_PATH)
    print(f"✓ 数据库已备份到: {BACKUP_PATH}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 检查是否已经迁移
        cursor.execute("PRAGMA table_info(conversations)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'user_id' in columns:
            print("✓ 数据库已经包含 user_id 字段，无需迁移")
            return True
        
        print("开始迁移数据库...")
        
        # 获取现有会话数量
        cursor.execute("SELECT COUNT(*) FROM conversations")
        count = cursor.fetchone()[0]
        print(f"  发现 {count} 个现有会话")
        
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
        # 注意：这里为所有旧会话分配同一个默认用户ID（legacy用户）
        # 如果需要为每个会话分配不同的用户ID，可以修改这里
        default_user_id = str(uuid.uuid4())
        print(f"  为现有会话分配默认用户ID: {default_user_id}")
        
        cursor.execute("SELECT id, title, created_at, updated_at FROM conversations")
        conversations = cursor.fetchall()
        
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
        print(f"✓ 数据库迁移完成！已迁移 {len(conversations)} 个会话")
        print(f"✓ 索引已创建")
        print(f"\n注意：所有旧会话已分配给默认用户ID: {default_user_id}")
        print("   新用户访问时会自动生成新的独立用户ID")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"✗ 迁移失败: {e}")
        print(f"  请从备份恢复: {BACKUP_PATH}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("=" * 60)
    print("数据库迁移：添加 user_id 字段")
    print("=" * 60)
    print(f"数据库路径: {DB_PATH.absolute()}")
    print("=" * 60)
    
    try:
        success = migrate()
        if success:
            print("=" * 60)
            print("✓ 迁移成功完成！")
            print("=" * 60)
    except Exception as e:
        print("=" * 60)
        print(f"✗ 迁移失败: {e}")
        print("=" * 60)
        exit(1)
