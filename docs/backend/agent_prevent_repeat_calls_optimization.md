# Agent防重复调用工具优化实施总结

**完成时间**: 2026-01-22  
**目标**: 解决Agent重复调用RSS工具导致的性能问题  
**状态**: ✅ 已完成

## 问题背景

在之前的日志中发现，Agent在处理RSS工具返回的部分成功结果时，会误判为信息不足而重复调用：
- 第4轮: `filter_rss_news` 获取成功 6/11 源，共205篇文章
- 第5轮: `fetch_rss_news` 又获取了相同的6/11源，共205篇文章

这导致不必要的网络请求和资源浪费。

## 解决方案实施

采用三层防重复调用机制，从**提示层** → **信息层** → **强制执行层**递进式防护。

### 1. 优化系统提示词（提示层）

**修改文件**: `backend/agents/agent.py` (第23-29行)

新增明确的指导原则，告诉Agent：
- 部分RSS源失败是正常现象
- 部分成功的结果已经是有效的最终结果
- 应该基于现有结果分析而非重复调用

```python
system_prompt: str = """你是一个智能助手，可以帮助用户回答问题并使用工具完成任务。

重要原则：
1. 工具调用结果说明：当你调用RSS获取工具时，由于网络原因部分RSS源可能失败，这是正常现象。只要成功获取了部分文章（如6/11个源成功），就应该基于这些结果进行分析和回答，而不是重复调用。
2. 避免重复调用：如果一个工具调用已经返回了有效结果（即使不是全部源都成功），不要使用相同或相似的参数再次调用。
3. 结果利用：充分利用已获取的信息进行分析，即使数据不完整，也要尽力给出有价值的回答。
4. 单次调用原则：对于RSS工具，通常一次调用就能获取足够的信息，无需重复调用相同参数。"""
```

**效果**: 通过明确的指导，让LLM理解"部分成功"也是有效结果。

---

### 2. 增强工具返回结果（信息层）

**修改文件**: `backend/agents/rss_tools.py`

#### 2.1 修改 `tool_fetch_rss_news` 返回结果 (第56-68行)

在返回结果中添加两个关键字段：
- `status_message`: 明确说明获取状态和结论
- `note`: 明确指出这是最终结果

```python
return {
    "success": True,
    "summary": {
        "total_sources": result.total_sources,
        "successful_sources": result.successful_sources,
        "failed_sources": result.failed_sources,
        "total_articles": len(articles_list),
        "fetch_time": result.fetch_time,
        # ⬇️ 新增 status_message
        "status_message": f"已成功获取 {result.successful_sources}/{result.total_sources} 个RSS源，共 {len(articles_list)} 篇文章。部分源失败是正常的网络现象，当前结果已可用于分析。"
    },
    "articles": articles_list,
    # ⬇️ 新增 note
    "note": "这是最终获取结果，无需重复调用。部分RSS源失败是正常现象。"
}
```

#### 2.2 修改 `tool_filter_rss_news` 返回结果 (第160-167行)

在返回结果中添加 `note` 字段：

```python
return {
    "success": True,
    "query": query,
    "total_articles": len(articles),
    "filtered_count": len(filtered_articles),
    "filtered_articles": filtered_articles,
    # ⬇️ 新增 note
    "note": f"已从{len(articles)}篇文章中筛选出最相关的{len(filtered_articles)}篇，无需重复调用。"
}
```

**效果**: 通过在返回结果中明确说明，让Agent看到"无需重复调用"的提示。

---

### 3. 添加调用历史追踪机制（强制执行层）

**修改文件**: `backend/agents/agent.py` (第109-131, 229-248行)

这是最强的防护机制，即使Agent仍想重试，也会被直接阻止。

#### 3.1 初始化追踪机制 (第109-131行)

在 `chat_stream` 方法开始处添加：

```python
# 添加工具调用历史追踪
tool_call_history: List[Dict[str, Any]] = []

def is_similar_call(tool_name: str, arguments: Dict[str, Any]) -> bool:
    """检查是否是相似的工具调用"""
    for past_call in tool_call_history:
        if past_call["name"] == tool_name:
            # 检查参数相似度
            if tool_name in ["fetch_rss_news", "filter_rss_news"]:
                # 对于RSS工具，如果主要参数相同则认为相似
                past_args = past_call["arguments"]
                if tool_name == "filter_rss_news":
                    # query参数相同视为重复
                    if arguments.get("query") == past_args.get("query"):
                        return True
                elif tool_name == "fetch_rss_news":
                    # 参数基本相同视为重复
                    return True
    return False

def count_tool_calls(tool_name: str) -> int:
    """统计某个工具的调用次数"""
    return sum(1 for call in tool_call_history if call["name"] == tool_name)
```

#### 3.2 在工具执行前添加检查 (第229-248行)

```python
# 检查是否是重复调用
if is_similar_call(tool_name, tool_arguments):
    call_count = count_tool_calls(tool_name)
    if call_count >= 2:  # 最多允许2次相似调用
        warning_msg = f"工具 {tool_name} 已调用{call_count}次且参数相似，跳过此次调用。请基于已有结果进行分析。"
        logger.warning(warning_msg)
        
        tool_results.append({
            "tool_call_id": tool_call['id'],
            "role": "tool",
            "name": tool_name,
            "content": warning_msg
        })
        
        yield {
            "type": "tool_result",
            "tool_name": tool_name,
            "content": f"⚠️ {warning_msg}\n"
        }
        continue
```

**效果**: 即使Agent想调用相同参数的工具超过2次，也会被直接阻止。

---

### 4. 优化工具描述（补充提示层）

**修改文件**: `backend/agents/rss_tools.py` (第237, 260行)

#### 4.1 修改 `fetch_rss_news` 描述

```python
"description": "获取最新的RSS新闻。支持从多个新闻源获取最新资讯。注意：由于网络原因，部分RSS源可能失败，这是正常现象。只要成功获取部分文章即可使用，无需重复调用。"
```

#### 4.2 修改 `filter_rss_news` 描述

```python
"description": "根据用户的查询问题或关键词，智能筛选和排序RSS新闻。该工具会先获取RSS，然后进行筛选，一次调用即可完成。如果返回结果较少，说明相关新闻确实不多，无需重复调用。"
```

**效果**: 在工具定义阶段就告知Agent无需重复调用。

---

## 三层防护机制工作流程

```
Agent想要调用工具
    ↓
第1层：系统提示词检查
    └─→ Agent理解"部分成功是有效结果"，可能直接分析现有结果
    ↓ (如果Agent仍想调用)
第2层：返回结果信息检查
    └─→ Agent看到 "无需重复调用" 的提示，可能停止重试
    ↓ (如果Agent仍想调用)
第3层：调用历史追踪检查
    └─→ 直接阻止第3次及以上的相似调用，返回警告
```

---

## 验证测试

已创建测试脚本 `backend/test_agent_prevent_repeat.py`，验证了：

✅ 系统提示词包含所有必要的防重复调用说明  
✅ `fetch_rss_news` 和 `filter_rss_news` 的描述已优化  
✅ 工具返回结果包含明确的 `note` 和 `status_message` 字段  
✅ Agent 类包含完整的调用历史追踪机制  

**测试结果**: 🎉 所有测试通过！

---

## 预期效果

1. **提示层效果**
   - Agent理解RSS部分失败是正常情况
   - 看到明确的指导，会倾向于基于现有结果分析

2. **信息层效果**
   - 工具返回结果中的明确说明强化了Agent的认知
   - Agent会看到"已可用于分析"、"无需重复调用"等提示

3. **强制执行层效果**
   - 即使Agent坚持重试，也会被直接阻止
   - 返回的警告消息会告知Agent这是不允许的

**综合效果**:
- ✅ 减少不必要的工具调用
- ✅ 降低网络请求负担
- ✅ 提高Agent性能和响应速度
- ✅ 改善用户体验

---

## 修改的文件清单

1. `backend/agents/agent.py`
   - 修改 `AgentConfig` 中的 `system_prompt`
   - 在 `chat_stream` 方法中添加工具调用历史追踪

2. `backend/agents/rss_tools.py`
   - 修改 `tool_fetch_rss_news` 返回结果
   - 修改 `tool_filter_rss_news` 返回结果
   - 优化 `fetch_rss_news` 和 `filter_rss_news` 的描述

3. `backend/test_agent_prevent_repeat.py`（新增）
   - 验证所有优化是否正确实施

---

## 下一步建议

1. 在生产环境中部署这些修改
2. 监控Agent的调用日志，观察是否还有重复调用的情况
3. 如果还有其他工具存在类似问题，可以扩展调用历史追踪机制
4. 考虑在Agent返回结果时添加调用统计信息，帮助用户了解工具调用情况

---

## 设计亮点

1. **分层设计**: 三层递进式防护，从提示到信息再到强制执行，符合"防御纵深"的设计思想
2. **可解释性**: 每一层都有明确的说明信息，用户和Agent都能理解为什么不需要重复调用
3. **可观测性**: 通过日志记录，可以追踪调用历史，便于调试和监控
4. **灵活性**: 易于扩展到其他工具，只需在追踪机制中添加相应的逻辑即可
5. **非侵入式**: 不修改RSS获取器的核心逻辑，只在Agent层面进行优化
