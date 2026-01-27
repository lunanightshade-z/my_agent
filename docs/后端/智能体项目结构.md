# 智能体系统 - 项目文件结构

## 核心模块

### backend/agents/
智能体核心模块

```
agents/
├── __init__.py                      # 模块导出
├── agent.py                         # 智能体核心实现 ⭐
├── tools.py                         # 工具注册和管理
├── rss_tools.py                     # RSS工具集成
├── api_integration_example.py       # API集成示例
└── README.md                        # 模块文档
```

#### agent.py
**核心类**:
- `AgentConfig`: 智能体配置
- `Agent`: 智能体主类

**主要方法**:
- `__init__()`: 初始化智能体
- `register_tool()`: 注册工具
- `chat_stream()`: 流式对话（核心方法）⭐
- `chat()`: 非流式对话

**流式输出chunk类型**:
- `text`: 文本内容
- `tool_call`: 工具调用信息
- `tool_result`: 工具执行结果
- `done`: 对话结束
- `error`: 错误信息

#### tools.py
**核心类**:
- `ToolDefinition`: 工具定义数据类
- `ToolRegistry`: 工具注册器

**主要方法**:
- `register()`: 注册新工具
- `get_tool()`: 获取工具定义
- `execute_tool()`: 执行工具
- `get_all_tools_for_openai()`: 获取OpenAI格式的工具列表

#### rss_tools.py
**工具函数**:
- `tool_fetch_rss_news()`: 获取RSS新闻
- `tool_filter_rss_news()`: 筛选RSS新闻
- `tool_search_rss_by_keywords()`: 关键词搜索

**工具定义**:
- `RSS_TOOLS_DEFINITIONS`: OpenAI格式的工具定义列表

## 测试文件

### backend/tests/

```
tests/
├── test_agent.py                    # 完整测试套件 ⭐
├── test_agent_simple.py             # 快速测试
└── demo_agent_interactive.py        # 交互式演示
```

#### test_agent.py
**测试场景**:
1. 普通对话（不需要工具）
2. 单轮工具调用 - 获取新闻
3. 单轮工具调用 - 筛选新闻
4. 多轮对话（注释掉，可选）
5. 关键词搜索（注释掉，可选）
6. 复杂查询（注释掉，可选）

**运行方式**:
```bash
cd backend && source .venv/bin/activate && python3 tests/test_agent.py
```

#### test_agent_simple.py
**简化测试**:
- 只包含3个核心测试
- 日志级别设为WARNING
- 更快的验证速度

**运行方式**:
```bash
cd backend && source .venv/bin/activate && python3 tests/test_agent_simple.py
```

#### demo_agent_interactive.py
**交互式演示**:
- 支持多轮对话
- 保持对话历史
- 实时流式输出

**运行方式**:
```bash
cd backend && source .venv/bin/activate && python3 tests/demo_agent_interactive.py
```

## 文档

### docs/backend/

```
docs/backend/
├── agent_system_design.md           # 完整设计文档 ⭐
├── agent_usage_guide.md             # 使用指南
└── agent_development_summary.md     # 开发总结
```

#### agent_system_design.md (⭐ 推荐阅读)
**内容**:
- 系统概述
- 架构设计
- 核心组件详解
- 工具调用流程
- 使用示例
- 关键设计决策
- 测试验证
- 性能考虑
- 扩展性设计
- 注意事项
- 后续优化方向

#### agent_usage_guide.md
**内容**:
- 快速开始
- 可用工具
- 测试结果示例
- 常见问题
- 下一步

#### agent_development_summary.md
**内容**:
- 任务完成情况
- 实现的功能
- 技术亮点
- 代码结构
- 测试结果
- 架构优势
- 性能优化
- 安全考虑
- 后续优化建议
- 集成建议
- 开发心得

## 依赖文件

### 主要依赖
```
openai>=1.0.0           # OpenAI Python SDK
python-dotenv>=0.19.0   # 环境变量管理
```

### 已有依赖（RSS工具）
```
feedparser              # RSS解析
requests                # HTTP请求
```

## 配置文件

### .env
```env
# Qwen API配置
QWEN_API_KEY=your_api_key
QWEN_API_BASE_URL=http://your_api_url

# 其他配置...
```

## 运行流程

### 1. 开发环境设置
```bash
cd backend
source .venv/bin/activate
pip install openai python-dotenv
```

### 2. 配置环境变量
编辑 `.env` 文件，添加API密钥

### 3. 运行测试
```bash
# 快速测试
python3 tests/test_agent_simple.py

# 完整测试
python3 tests/test_agent.py

# 交互式演示
python3 tests/demo_agent_interactive.py
```

### 4. 集成到项目
参考 `api_integration_example.py` 将智能体集成到FastAPI

## 目录树

```
my_agent/
├── backend/
│   ├── agents/                      # 新增 ⭐
│   │   ├── __init__.py
│   │   ├── agent.py
│   │   ├── tools.py
│   │   ├── rss_tools.py
│   │   ├── api_integration_example.py
│   │   └── README.md
│   ├── tests/
│   │   ├── test_agent.py            # 新增 ⭐
│   │   ├── test_agent_simple.py     # 新增
│   │   └── demo_agent_interactive.py # 新增
│   └── tools/
│       └── rss_fetcher/             # 已有
├── docs/
│   └── backend/
│       ├── agent_system_design.md   # 新增 ⭐
│       ├── agent_usage_guide.md     # 新增
│       └── agent_development_summary.md # 新增
└── .env                             # 配置文件
```

## 关键文件说明

### ⭐ 核心必读
1. `backend/agents/agent.py` - 智能体核心实现
2. `backend/tests/test_agent.py` - 完整测试
3. `docs/backend/agent_system_design.md` - 设计文档

### 📚 推荐阅读
4. `backend/agents/tools.py` - 工具管理
5. `backend/agents/rss_tools.py` - 工具集成
6. `docs/backend/agent_usage_guide.md` - 使用指南

### 🔧 参考示例
7. `backend/agents/api_integration_example.py` - API集成
8. `backend/tests/demo_agent_interactive.py` - 交互式演示

## 代码统计

| 文件 | 行数 | 说明 |
|------|------|------|
| agent.py | 330 | 智能体核心 |
| tools.py | 130 | 工具管理 |
| rss_tools.py | 250 | RSS工具 |
| test_agent.py | 250 | 完整测试 |
| test_agent_simple.py | 100 | 快速测试 |
| demo_agent_interactive.py | 120 | 交互演示 |
| api_integration_example.py | 200 | API集成 |
| **总计** | **1380** | **代码总量** |
| 设计文档 | 600 | 详细设计 |
| 使用指南 | 100 | 快速上手 |
| 开发总结 | 350 | 总结回顾 |
| **文档总计** | **1050** | **文档总量** |

## 快速导航

### 我想...

#### ...了解整体设计
👉 阅读 `docs/backend/agent_system_design.md`

#### ...快速开始使用
👉 阅读 `docs/backend/agent_usage_guide.md`
👉 运行 `tests/test_agent_simple.py`

#### ...查看代码实现
👉 查看 `agents/agent.py`
👉 查看 `agents/tools.py`

#### ...运行测试
👉 运行 `tests/test_agent.py`（完整测试）
👉 运行 `tests/test_agent_simple.py`（快速测试）

#### ...交互式体验
👉 运行 `tests/demo_agent_interactive.py`

#### ...集成到API
👉 参考 `agents/api_integration_example.py`

#### ...添加新工具
👉 参考 `agents/rss_tools.py`
👉 阅读 `docs/backend/agent_system_design.md` 第八节

#### ...了解开发过程
👉 阅读 `docs/backend/agent_development_summary.md`

## 更新日志

### 2026-01-20 - v1.0.0
- ✅ 初始版本发布
- ✅ 实现智能体核心功能
- ✅ 集成RSS工具
- ✅ 完成测试验证
- ✅ 编写完整文档

## 下一步

1. **测试验证**: 运行测试确保功能正常
2. **阅读文档**: 了解设计原理和使用方法
3. **集成应用**: 将智能体集成到现有项目
4. **扩展功能**: 添加更多工具和能力

## 技术支持

如有问题，请参考：
1. 设计文档的"常见问题"部分
2. 使用指南的"常见问题"部分
3. 代码注释和docstring
4. 测试文件中的示例代码
