# 智能体系统使用指南

## 快速开始

### 1. 环境准备

确保已安装依赖：
```bash
cd backend
source .venv/bin/activate
pip install openai python-dotenv
```

确保`.env`文件中配置了API密钥：
```env
QWEN_API_KEY=your_api_key
QWEN_API_BASE_URL=http://your_api_url
```

### 2. 运行测试

```bash
# 快速测试（推荐）
cd backend && source .venv/bin/activate && python3 tests/test_agent_simple.py

# 完整测试
cd backend && source .venv/bin/activate && python3 tests/test_agent.py
```

### 3. 基本使用

```python
from agents import Agent, AgentConfig
from agents.rss_tools import RSS_TOOLS_DEFINITIONS
import os

# 创建智能体
config = AgentConfig(
    model="qwen3-235b-instruct",
    api_key=os.getenv("QWEN_API_KEY"),
    base_url=os.getenv("QWEN_API_BASE_URL"),
    system_prompt="你是一个智能新闻助手..."
)
agent = Agent(config)

# 注册工具
for tool_def in RSS_TOOLS_DEFINITIONS:
    agent.register_tool(**tool_def)

# 流式对话
messages = [{"role": "user", "content": "帮我找一些AI相关的新闻"}]
for chunk in agent.chat_stream(messages):
    if chunk["type"] == "text":
        print(chunk["content"], end="", flush=True)
```

## 可用工具

### 1. fetch_rss_news - 获取最新新闻
```python
# 示例问题
"帮我获取最新的新闻，最多20条"
"给我看看今天的资讯"
```

### 2. filter_rss_news - 筛选特定主题
```python
# 示例问题
"找一些关于AI的新闻"
"给我看看科技相关的资讯"
"有没有关于人工智能的最新报道"
```

### 3. search_rss_by_keywords - 关键词搜索
```python
# 示例问题
"搜索包含'AI'、'人工智能'的新闻"
"查找关键词为'芯片'的资讯"
```

## 测试结果示例

### 普通对话
```
用户: 你好，你能做什么？
助手: 你好！我是一个智能新闻助手，可以帮助你获取和分析最新的资讯...
```

### 单轮工具调用
```
用户: 帮我获取10条最新新闻
助手: 
🔧 调用工具: fetch_rss_news
✅ 工具执行成功
好的，我已经为您获取了10条最新新闻...
```

### 智能筛选
```
用户: 找一些关于AI的新闻
助手:
🔧 调用工具: filter_rss_news
✅ 工具执行成功
以下是关于AI和人工智能的相关新闻：
1. 2025年以来宁夏累计培育人工智能相关企业150家
...
```

## 常见问题

### Q: 如何添加新的工具？
A: 参考`backend/agents/rss_tools.py`，定义工具函数和OpenAI格式的工具描述，然后注册到智能体。

### Q: 如何切换不同的模型？
A: 修改`AgentConfig`中的`model`、`api_key`和`base_url`参数。

### Q: 工具调用失败了怎么办？
A: 智能体会自动捕获错误并通知LLM，LLM可以选择重试或采取其他策略。

### Q: 如何控制最大工具调用次数？
A: 在`AgentConfig`中设置`max_tool_iterations`参数（默认5次）。

## 下一步

- 查看完整设计文档：`docs/backend/agent_system_design.md`
- 添加自定义工具
- 集成到Web API中
