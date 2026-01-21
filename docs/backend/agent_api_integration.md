# 智能体API集成文档

## 概述

已成功将智能体（Agent）功能集成到后端API，并连接到前端Agent对话界面。

## 完成的工作

### 1. 后端集成 ✅

#### 1.1 新增文件

1. **`backend/app/services/agent_service.py`** - 智能体服务层
   - 封装Agent功能
   - 提供流式对话接口
   - 支持工具调用
   - 数据库集成

2. **`backend/app/api/v1/agent.py`** - 智能体API端点
   - `/api/agent/stream` - 流式对话接口
   - SSE格式返回
   - 工具调用透传

3. **`backend/tests/test_agent_api_integration.py`** - API集成测试
   - 创建会话测试
   - 流式对话测试
   - 消息历史测试

#### 1.2 修改文件

1. **`backend/app/dependencies.py`**
   - 添加 `get_agent_service()` 依赖注入

2. **`backend/app/main.py`**
   - 注册 `/agent` 路由

### 2. 前端集成 ✅

#### 2.1 修改文件

1. **`frontend/src/services/api.js`**
   - 新增 `sendAgentMessageStream()` 函数
   - 支持工具调用回调
   - 支持工具结果回调

2. **`frontend/src/pages/Agent.jsx`**
   - 切换到智能体API
   - 显示工具调用过程
   - 移除thinking模式（智能体不需要）

## API接口文档

### 智能体流式对话

**端点**: `POST /api/agent/stream`

**请求体**:
```json
{
  "conversation_id": 1,
  "message": "帮我获取最新新闻",
  "thinking_enabled": false
}
```

**响应**: SSE流式数据

**响应类型**:

1. **文本内容**
```json
{
  "type": "delta",
  "content": "好的，我来帮你获取最新新闻..."
}
```

2. **工具调用**
```json
{
  "type": "tool_call",
  "content": "正在调用工具: fetch_rss_news",
  "tool_name": "fetch_rss_news",
  "tool_arguments": {
    "max_articles": 10
  }
}
```

3. **工具结果**
```json
{
  "type": "tool_result",
  "content": "工具 fetch_rss_news 执行完成",
  "tool_name": "fetch_rss_news"
}
```

4. **完成信号**
```json
{
  "type": "done"
}
```

5. **错误信息**
```json
{
  "type": "error",
  "content": "错误描述"
}
```

## 前端使用示例

```javascript
import { sendAgentMessageStream } from '../services/api';

sendAgentMessageStream(
  conversationId,
  message,
  // 工具调用回调
  (toolCallData) => {
    console.log('工具调用:', toolCallData.tool_name);
    // 显示工具调用UI
  },
  // 工具结果回调
  (toolResultData) => {
    console.log('工具结果:', toolResultData.tool_name);
    // 显示工具结果UI
  },
  // 内容回调
  (content) => {
    // 追加文本内容
  },
  // 完成回调
  () => {
    // 对话完成处理
  },
  // 错误回调
  (error) => {
    // 错误处理
  }
);
```

## 测试步骤

### 1. 启动后端

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 测试API

```bash
cd backend
source .venv/bin/activate
python3 tests/test_agent_api_integration.py
```

### 3. 启动前端

```bash
cd frontend
npm run dev
```

### 4. 访问Agent页面

打开浏览器访问: `http://localhost:5173/agent`

### 5. 测试对话

尝试以下问题：
- "帮我获取10条最新新闻"
- "找一些关于AI的新闻"
- "搜索包含'科技'关键词的新闻"

## 工作流程

```
用户输入
   ↓
前端Agent.jsx
   ↓
sendAgentMessageStream() (api.js)
   ↓
POST /api/agent/stream
   ↓
AgentService.chat_stream() (agent_service.py)
   ↓
Agent.chat_stream() (智能体核心)
   ↓
[判断] 是否需要工具?
   ├─ No → 直接回答 → 流式返回
   └─ Yes → 调用工具 → 返回结果 → 继续对话 → 流式返回
```

## 与Chat接口的区别

| 特性 | Chat接口 | Agent接口 |
|------|---------|-----------|
| API路径 | `/api/chat/stream` | `/api/agent/stream` |
| 服务 | ChatService | AgentService |
| LLM | 直接调用智谱API | Agent封装 |
| 工具调用 | ❌ 不支持 | ✅ 支持 |
| Thinking模式 | ✅ 支持 | ❌ 不需要 |
| 流式输出 | ✅ 支持 | ✅ 支持 |
| 数据库存储 | ✅ | ✅ |

## 可用工具

当前智能体已集成以下工具：

### 1. fetch_rss_news
获取最新RSS新闻

**参数**:
- `max_articles` (可选): 最大文章数
- `sources_limit` (可选): 限制RSS源数量

**示例问题**:
- "帮我获取最新的新闻"
- "给我看看今天的资讯"

### 2. filter_rss_news
根据查询筛选RSS新闻

**参数**:
- `query` (必需): 查询关键词或问题
- `max_articles` (可选): 最大获取文章数，默认50
- `top_k` (可选): 返回前k篇，默认10

**示例问题**:
- "找一些关于AI的新闻"
- "给我看看科技相关的资讯"

### 3. search_rss_by_keywords
根据关键词列表搜索RSS新闻

**参数**:
- `keywords` (必需): 关键词列表
- `max_articles` (可选): 最大获取文章数，默认50

**示例问题**:
- "搜索包含'AI'、'人工智能'的新闻"

## 前端UI特性

### 工具调用显示

当智能体调用工具时，前端会显示：

```
🔧 正在调用工具: fetch_rss_news
   参数: {"max_articles": 10}

✅ 工具 fetch_rss_news 执行完成
```

### 流式输出

文本内容实时流式显示，用户体验流畅。

### 魔法界面

保持Agent页面的魔法风格UI，包括：
- 粒子背景
- 玻璃态效果
- 视差动画
- 渐变装饰

## 性能考虑

### 后端优化
- Agent实例单例化（避免重复初始化）
- 工具注册缓存
- 数据库连接池
- 异步流式处理

### 前端优化
- SSE流式接收
- 增量渲染
- 防抖输入
- 滚动优化

## 错误处理

### 后端错误
- 工具执行失败 → 返回error类型
- Agent初始化失败 → 抛出异常
- 数据库错误 → 事务回滚

### 前端错误
- 网络错误 → Toast提示
- 流中断 → 优雅降级
- 解析错误 → 跳过继续处理

## 监控和日志

### 后端日志
```python
logger.info("agent_chat_started", conversation_id=1, message_length=20)
logger.info("agent_chat_completed", response_length=500, tool_calls_count=1)
logger.error("agent_chat_failed", error=str(e))
```

### 日志级别
- INFO: 正常流程
- WARNING: 工具失败等
- ERROR: 严重错误

## 扩展指南

### 添加新工具

1. 在 `backend/agents/rss_tools.py` 中定义工具函数和定义
2. 添加到 `RSS_TOOLS_DEFINITIONS` 列表
3. Agent会自动注册和使用

### 自定义工具

```python
# 1. 定义工具函数
def my_custom_tool(param1: str, param2: int) -> dict:
    # 工具逻辑
    return {"result": "..."}

# 2. 定义OpenAI格式
MY_TOOL_DEF = {
    "name": "my_tool",
    "description": "工具描述",
    "parameters": {
        "type": "object",
        "properties": {
            "param1": {"type": "string", "description": "参数1"},
            "param2": {"type": "integer", "description": "参数2"}
        },
        "required": ["param1"]
    },
    "function": my_custom_tool
}

# 3. 注册到Agent
agent.register_tool(**MY_TOOL_DEF)
```

## 部署注意事项

### 环境变量
确保配置以下环境变量：
```bash
QWEN_API_KEY=your_key
QWEN_API_BASE_URL=http://your_url
```

### Docker部署
需要在Dockerfile中确保agent模块可访问：
```dockerfile
COPY backend/agents /app/backend/agents
```

### 依赖安装
```bash
pip install openai python-dotenv
```

## 常见问题

### Q: Agent页面和Chat页面有什么区别？
A: 
- **Chat页面**: 使用智谱API直接对话，支持thinking模式
- **Agent页面**: 使用智能体，支持工具调用（RSS新闻获取等）

### Q: 工具调用失败怎么办？
A: Agent会自动处理失败情况，将错误信息返回给LLM，由LLM决定如何响应。

### Q: 如何添加新的工具？
A: 参考"扩展指南"章节，在 `rss_tools.py` 中添加工具定义。

### Q: 前端如何显示工具调用过程？
A: 前端收到 `tool_call` 和 `tool_result` 类型的消息后，可以自定义UI显示。

## 下一步优化

### 短期
- [ ] 添加工具调用动画效果
- [ ] 优化工具结果展示UI
- [ ] 添加工具调用历史记录

### 中期
- [ ] 支持更多工具（搜索、计算等）
- [ ] 工具调用统计和分析
- [ ] 优化流式性能

### 长期
- [ ] 多Agent协作
- [ ] Agent记忆系统
- [ ] 自定义工具市场

## 总结

✅ 智能体已成功集成到后端API
✅ 前端Agent页面已连接智能体API  
✅ 支持流式输出和工具调用
✅ 完整的错误处理和日志记录
✅ 测试验证通过

系统已准备就绪，可以投入使用！

---

**集成日期**: 2026-01-20  
**版本**: v1.0.0  
**状态**: ✅ 完成并测试通过
