# 智能体系统设计文档

## 项目信息

- **日期**: 2026-01-20
- **模块**: backend/agents
- **功能**: 基于OpenAI工具调用标准的智能体实现

## 一、系统概述

本智能体系统基于最新的OpenAI工具调用（Function Calling）标准实现，支持：
- 流式输出（Streaming）
- 单轮工具调用
- 多轮工具调用
- 自动判断是否需要调用工具
- 工具注册和管理

## 二、架构设计

### 2.1 核心模块

```
backend/agents/
├── __init__.py          # 模块导出
├── agent.py            # 智能体核心实现
├── tools.py            # 工具注册和管理
└── rss_tools.py        # RSS工具集成
```

### 2.2 架构图

```
┌─────────────────────────────────────────────────┐
│              用户请求                            │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│          Agent (智能体核心)                      │
│  - 流式对话管理                                  │
│  - 工具调用判断                                  │
│  - 多轮迭代控制                                  │
└───────┬─────────────────────────┬───────────────┘
        │                         │
        ▼                         ▼
┌─────────────────┐      ┌──────────────────────┐
│  ToolRegistry   │      │  OpenAI API         │
│  工具注册管理   │      │  (Qwen3-235B)       │
└────────┬────────┘      └──────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              RSS Tools                          │
│  - fetch_rss_news      获取最新新闻             │
│  - filter_rss_news     智能筛选新闻             │
│  - search_by_keywords  关键词搜索               │
└─────────────────────────────────────────────────┘
```

## 三、核心组件设计

### 3.1 Agent（智能体）

**文件**: `backend/agents/agent.py`

#### 类: `AgentConfig`
智能体配置类，使用dataclass定义：

```python
@dataclass
class AgentConfig:
    model: str = "qwen3-235b-instruct"  # 模型名称
    api_key: str = ""                   # API密钥
    base_url: str = ""                  # API基础URL
    system_prompt: str = "..."          # 系统提示词
    max_tool_iterations: int = 5        # 最大工具调用迭代次数
    temperature: float = 0.7            # 温度参数
```

#### 类: `Agent`
智能体核心类，主要方法：

**1. `__init__(config: AgentConfig)`**
- 初始化OpenAI客户端
- 创建工具注册器
- 记录日志

**2. `register_tool(name, description, parameters, function)`**
- 注册工具到智能体
- 参数遵循OpenAI工具定义格式

**3. `chat_stream(messages, use_tools=True)`**
- 流式聊天接口（核心方法）
- 支持工具调用
- 返回Generator

#### 流式输出格式

```python
{
    "type": "text" | "tool_call" | "tool_result" | "done" | "error",
    "content": str,
    "tool_name": str,           # 仅tool_call时
    "tool_arguments": dict,     # 仅tool_call时
    "metadata": dict            # 可选的额外信息
}
```

### 3.2 工具调用流程

```
1. 用户发送消息
   │
   ▼
2. Agent构建完整对话历史（包含system prompt）
   │
   ▼
3. 调用LLM API（带工具定义）
   │
   ▼
4. 流式接收响应
   │
   ├─► 有文本内容 ──► 立即yield给用户（type: "text"）
   │
   └─► 有工具调用 ──┐
                    │
                    ▼
5. 收集完整的工具调用信息
   │
   ▼
6. 解析工具名称和参数
   │
   ▼
7. 通知用户工具调用开始（type: "tool_call"）
   │
   ▼
8. 执行工具函数
   │
   ▼
9. 通知用户工具执行结果（type: "tool_result"）
   │
   ▼
10. 将工具结果添加到对话历史
    │
    ▼
11. 返回步骤3（开始新一轮对话）
    │
    └─► 直到：
        - 没有工具调用（正常结束）
        - 达到最大迭代次数
        - 发生错误
```

### 3.3 ToolRegistry（工具注册器）

**文件**: `backend/agents/tools.py`

#### 类: `ToolDefinition`
工具定义数据类：

```python
@dataclass
class ToolDefinition:
    name: str                    # 工具名称
    description: str             # 工具描述
    parameters: Dict[str, Any]   # 参数定义（JSON Schema）
    function: Callable           # 工具执行函数
```

#### 类: `ToolRegistry`
工具注册和管理类：

- `register()`: 注册新工具
- `get_tool()`: 获取工具定义
- `execute_tool()`: 执行工具
- `get_all_tools_for_openai()`: 获取OpenAI格式的工具列表
- `list_tools()`: 列出所有工具名称

### 3.4 RSS Tools（RSS工具集成）

**文件**: `backend/agents/rss_tools.py`

#### 工具1: `fetch_rss_news`
获取最新RSS新闻

**参数**:
- `max_articles` (可选): 最大文章数
- `sources_limit` (可选): 限制RSS源数量

**返回**:
```json
{
  "success": true,
  "summary": {
    "total_sources": 11,
    "successful_sources": 6,
    "failed_sources": 5,
    "total_articles": 205,
    "fetch_time": "2026-01-20T18:19:12.875"
  },
  "articles": [...]
}
```

#### 工具2: `filter_rss_news`
根据查询筛选RSS新闻

**参数**:
- `query` (必需): 查询关键词或问题
- `max_articles` (可选): 最大获取文章数，默认50
- `top_k` (可选): 返回前k篇，默认10

**返回**:
```json
{
  "success": true,
  "query": "AI 人工智能",
  "total_articles": 205,
  "filtered_count": 10,
  "filtered_articles": [...]
}
```

#### 工具3: `search_rss_by_keywords`
根据关键词列表搜索RSS新闻

**参数**:
- `keywords` (必需): 关键词列表
- `max_articles` (可选): 最大获取文章数，默认50

**返回**:
```json
{
  "success": true,
  "keywords": ["AI", "人工智能"],
  "total_articles": 205,
  "matched_count": 15,
  "matched_articles": [...]
}
```

## 四、使用示例

### 4.1 创建智能体

```python
from agents import Agent, AgentConfig
from agents.rss_tools import RSS_TOOLS_DEFINITIONS

# 创建配置
config = AgentConfig(
    model="qwen3-235b-instruct",
    api_key="your_api_key",
    base_url="http://your_api_url",
    system_prompt="你是一个智能新闻助手...",
    max_tool_iterations=5
)

# 创建智能体
agent = Agent(config)

# 注册RSS工具
for tool_def in RSS_TOOLS_DEFINITIONS:
    agent.register_tool(
        name=tool_def["name"],
        description=tool_def["description"],
        parameters=tool_def["parameters"],
        function=tool_def["function"]
    )
```

### 4.2 流式对话

```python
messages = [
    {"role": "user", "content": "帮我找一些关于AI的新闻"}
]

for chunk in agent.chat_stream(messages):
    if chunk["type"] == "text":
        print(chunk["content"], end="", flush=True)
    elif chunk["type"] == "tool_call":
        print(f"\n🔧 调用工具: {chunk['tool_name']}")
    elif chunk["type"] == "tool_result":
        print(f"✅ 工具执行完成")
```

### 4.3 非流式对话

```python
response = agent.chat(messages)
print(response)
```

## 五、关键设计决策

### 5.1 为什么使用流式输出？

1. **用户体验**: 用户可以立即看到响应，不需要等待完整生成
2. **透明度**: 实时显示工具调用过程，让用户了解智能体在做什么
3. **性能**: 对于长文本输出，流式传输可以显著降低首字节时间（TTFB）

### 5.2 为什么需要多轮迭代？

某些任务需要多次工具调用：
- **串行调用**: 先获取新闻，再筛选特定主题
- **补充信息**: 第一次调用信息不足，需要再次调用获取更多数据
- **错误处理**: 工具调用失败后重试或切换策略

### 5.3 工具定义遵循OpenAI标准

采用OpenAI的工具定义格式：
```json
{
  "type": "function",
  "function": {
    "name": "tool_name",
    "description": "工具描述",
    "parameters": {
      "type": "object",
      "properties": { ... },
      "required": [ ... ]
    }
  }
}
```

优点：
- 标准化、易于理解
- 与主流LLM API兼容
- 便于未来扩展

## 六、测试验证

### 6.1 测试文件

- `backend/tests/test_agent.py`: 完整测试套件
- `backend/tests/test_agent_simple.py`: 快速验证测试

### 6.2 测试场景

#### 场景1: 普通对话（不需要工具）
```
用户: 你好，你能做什么？
助手: 你好！我是一个智能新闻助手，可以帮助你获取和分析最新的资讯...
```
✅ 验证通过 - 直接流式输出，无工具调用

#### 场景2: 单轮工具调用
```
用户: 帮我获取最新的新闻，最多20条
助手: 
  🔧 调用工具: fetch_rss_news
  参数: {"max_articles": 20}
  ✅ 工具执行成功
  好的，我已经为您获取了20条最新新闻...
```
✅ 验证通过 - 调用工具后继续流式输出

#### 场景3: 筛选特定主题
```
用户: 帮我找一些关于AI和人工智能的最新新闻
助手:
  🔧 调用工具: filter_rss_news
  参数: {"query": "AI 人工智能", "max_articles": 50, "top_k": 10}
  ✅ 工具执行成功
  以下是关于AI和人工智能的最新相关新闻：
  1. 2025年以来宁夏累计培育人工智能相关企业150家
  ...
```
✅ 验证通过 - 智能筛选并总结

### 6.3 运行测试

```bash
# 完整测试
cd backend && source .venv/bin/activate && python3 tests/test_agent.py

# 快速测试
cd backend && source .venv/bin/activate && python3 tests/test_agent_simple.py
```

## 七、性能考虑

### 7.1 工具调用优化

- **并发获取**: RSS fetcher使用多线程并发获取新闻（10个线程）
- **超时控制**: 每个RSS源10秒超时，避免长时间等待
- **失败重试**: 最多重试2次，提高成功率

### 7.2 流式输出优化

- 使用Generator避免内存占用
- 立即yield文本内容，不等待完整响应
- 工具结果过长时截断预览（200字符）

### 7.3 迭代控制

- 默认最大迭代5次，防止无限循环
- 每次迭代都记录日志，便于调试
- 达到限制时友好提示用户

## 八、扩展性设计

### 8.1 添加新工具

1. 定义工具函数
2. 定义OpenAI格式的工具描述
3. 注册到智能体

```python
def my_tool(param1: str, param2: int) -> dict:
    """工具实现"""
    return {"result": "..."}

TOOL_DEF = {
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
    "function": my_tool
}

agent.register_tool(**TOOL_DEF)
```

### 8.2 切换不同的LLM

只需修改`AgentConfig`:
```python
config = AgentConfig(
    model="gpt-4",
    api_key="sk-...",
    base_url="https://api.openai.com/v1",
    ...
)
```

### 8.3 自定义工具注册器

可以继承`ToolRegistry`实现自定义逻辑：
- 工具权限控制
- 工具使用统计
- 工具结果缓存

## 九、注意事项

### 9.1 API密钥安全

- 始终使用环境变量存储API密钥
- 不要在代码中硬编码密钥
- 不要将`.env`文件提交到版本控制

### 9.2 工具执行安全

- 所有工具执行都包装在try-except中
- 工具失败不会导致智能体崩溃
- 错误信息会传递给LLM，让其做出相应调整

### 9.3 成本控制

- 流式输出可以提前终止，减少不必要的token消耗
- 限制最大迭代次数，避免无限循环
- 工具结果过长时截断，减少上下文长度

## 十、后续优化方向

### 10.1 短期优化

- [ ] 添加工具调用日志和统计
- [ ] 实现工具结果缓存
- [ ] 支持并行工具调用（多个工具同时执行）
- [ ] 改进错误处理和重试机制

### 10.2 中期优化

- [ ] 添加更多工具（搜索、计算、数据库查询等）
- [ ] 实现工具链（Tool Chain）
- [ ] 支持用户自定义工具
- [ ] 添加工具使用分析和优化建议

### 10.3 长期优化

- [ ] 实现Agent记忆系统
- [ ] 支持多Agent协作
- [ ] 添加Agent规划能力（Plan-and-Execute）
- [ ] 集成Langchain/LlamaIndex等框架

## 十一、总结

本智能体系统实现了基于OpenAI工具调用标准的完整功能，包括：

✅ 流式输出，用户体验良好
✅ 单轮和多轮工具调用
✅ 模块化设计，易于扩展
✅ 完整的测试验证
✅ 良好的错误处理
✅ 详细的日志记录

系统已经可以投入使用，并且具备良好的扩展性，可以根据需求添加更多工具和功能。
