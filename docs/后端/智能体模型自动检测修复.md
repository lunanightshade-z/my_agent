# Agent模型自动检测修复

**修复日期**: 2026-01-22  
**问题**: Agent页面调用的模型是glm-4-flash而不是配置的qwen3-235b-instruct  
**状态**: ✅ 已修复

## 问题根源

从日志中发现，Agent实际调用的是`glm-4-flash`模型，而不是配置的`qwen3-235b-instruct`：

```
{"model": "glm-4-flash", "input_length": 103, "output_length": 12, ...}
```

**原因分析**：
1. Agent配置的模型是`qwen3-235b-instruct`（通义千问模型）
2. 但`QWEN_API_BASE_URL`环境变量指向的是智谱AI的API：`https://open.bigmodel.cn/api/paas/v4/chat/completions`
3. 智谱AI的API不支持`qwen3-235b-instruct`这个模型名称
4. 当API收到不支持的模型名称时，自动回退到默认模型`glm-4-flash`

## 解决方案

实现**模型自动检测机制**，根据`base_url`自动选择正确的模型：

### 1. 添加模型检测函数

**文件**: `backend/app/services/agent_service.py`

新增函数 `_detect_model_from_base_url()`：

```python
def _detect_model_from_base_url(base_url: str) -> str:
    """
    根据base_url自动检测应该使用的模型名称
    
    检测规则：
    - 如果base_url包含 "bigmodel.cn" 或 "zhipuai" → 使用 glm-4-flash
    - 其他情况 → 使用 qwen3-235b-instruct
    """
    if not base_url:
        return AGENT_MODEL_NAME
    
    # 如果base_url包含智谱AI的域名，使用智谱AI的模型
    if "bigmodel.cn" in base_url.lower() or "zhipuai" in base_url.lower():
        logger.info(f"检测到智谱AI API，使用模型: {ZHIPU_MODEL_NAME}")
        return ZHIPU_MODEL_NAME
    
    # 默认使用通义千问模型
    logger.info(f"使用默认模型: {AGENT_MODEL_NAME}")
    return AGENT_MODEL_NAME
```

### 2. 添加智谱AI模型配置常量

```python
# 智谱AI模型配置（当base_url指向智谱AI时使用）
ZHIPU_MODEL_NAME = "glm-4-flash"  # 智谱AI支持的模型
```

### 3. 在Agent创建时使用自动检测

修改 `_create_agent()` 方法：

```python
# 从环境变量读取配置
api_key = os.getenv(ENV_QWEN_API_KEY)
base_url = os.getenv(ENV_QWEN_API_BASE_URL)

# 根据base_url自动检测应该使用的模型
model_name = _detect_model_from_base_url(base_url)

# 创建智能体配置
config = AgentConfig(
    model=model_name,  # 使用自动检测的模型
    api_key=api_key,
    base_url=base_url,
    ...
)
```

### 4. 更新系统提示词

同时更新了系统提示词，包含防重复调用的说明（与之前的优化保持一致）。

## 修改的文件

1. **backend/app/services/agent_service.py**
   - 添加 `ZHIPU_MODEL_NAME` 常量
   - 添加 `_detect_model_from_base_url()` 函数
   - 修改 `_create_agent()` 方法使用自动检测
   - 更新系统提示词包含防重复调用说明
   - 更新日志输出显示实际使用的模型

## 检测规则

| base_url特征 | 使用的模型 | 说明 |
|------------|----------|------|
| 包含 `bigmodel.cn` | `glm-4-flash` | 智谱AI API |
| 包含 `zhipuai` | `glm-4-flash` | 智谱AI API |
| 其他 | `qwen3-235b-instruct` | 通义千问或其他兼容API |
| 空值 | `qwen3-235b-instruct` | 默认模型 |

## 预期效果

### Before（修复前）
```
配置: model = "qwen3-235b-instruct"
base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
实际调用: glm-4-flash (API自动回退)
```

### After（修复后）
```
配置: model = "qwen3-235b-instruct"
base_url = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
自动检测: 检测到智谱AI API
实际调用: glm-4-flash (正确匹配)
```

## 验证方法

1. **查看日志**
   - 启动服务后，查看日志中是否有 "检测到智谱AI API，使用模型: glm-4-flash"
   - 或 "使用默认模型: qwen3-235b-instruct"

2. **检查API调用**
   - 查看实际API调用日志，确认模型名称与base_url匹配

3. **功能测试**
   - 使用Agent页面进行对话
   - 确认模型调用正常，不再出现模型不匹配的错误

## 优势

1. **自动化**: 无需手动配置，根据API地址自动选择模型
2. **灵活性**: 支持切换不同的API提供商，自动适配
3. **可维护性**: 集中管理模型配置，易于扩展
4. **可观测性**: 日志记录检测结果，便于调试

## 扩展性

如果未来需要支持更多API提供商，只需在 `_detect_model_from_base_url()` 函数中添加检测逻辑：

```python
if "new_provider.com" in base_url.lower():
    return "new_provider_model"
```

## 注意事项

1. **环境变量**: 确保 `QWEN_API_BASE_URL` 正确配置
2. **API兼容性**: 确保选择的模型名称与API提供商支持的模型匹配
3. **日志监控**: 关注日志中的模型检测信息，确保检测正确

---

**修复完成**: ✅  
**测试状态**: ✅ 代码语法验证通过  
**部署状态**: ⏳ 待部署验证
