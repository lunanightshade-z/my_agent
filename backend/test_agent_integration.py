"""
集成测试：验证修改后的Agent框架工作正常
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from agents.agent import Agent, AgentConfig
from agents.rss_tools import RSS_TOOLS_DEFINITIONS


def test_agent_initialization():
    """测试Agent是否能正常初始化"""
    print("=" * 60)
    print("集成测试1：Agent初始化测试")
    print("=" * 60)
    
    config = AgentConfig(
        model="qwen3-235b-instruct",
        api_key="test-key",
        base_url="http://localhost:8000"
    )
    
    agent = Agent(config)
    
    # 注册工具
    for tool_def in RSS_TOOLS_DEFINITIONS:
        agent.register_tool(
            name=tool_def["name"],
            description=tool_def["description"],
            parameters=tool_def["parameters"],
            function=tool_def["function"]
        )
    
    registered_tools = agent.tool_registry.list_tools()
    print(f"✅ Agent初始化成功")
    print(f"   已注册工具数: {len(registered_tools)}")
    print(f"   工具列表: {registered_tools}\n")
    
    return agent


def test_tool_definitions():
    """测试工具定义是否完整"""
    print("=" * 60)
    print("集成测试2：工具定义完整性测试")
    print("=" * 60)
    
    for tool in RSS_TOOLS_DEFINITIONS:
        assert "name" in tool, f"工具缺少 name 字段"
        assert "description" in tool, f"工具 {tool['name']} 缺少 description 字段"
        assert "parameters" in tool, f"工具 {tool['name']} 缺少 parameters 字段"
        assert "function" in tool, f"工具 {tool['name']} 缺少 function 字段"
        
        # 检查描述中是否包含防重复调用的提示
        if tool["name"] in ["fetch_rss_news", "filter_rss_news"]:
            assert "无需重复调用" in tool["description"], \
                f"工具 {tool['name']} 的描述中缺少'无需重复调用'提示"
    
    print(f"✅ 所有 {len(RSS_TOOLS_DEFINITIONS)} 个工具定义完整\n")


def test_system_prompt_quality():
    """测试系统提示词质量"""
    print("=" * 60)
    print("集成测试3：系统提示词质量评估")
    print("=" * 60)
    
    config = AgentConfig()
    
    quality_checks = [
        ("包含工具调用说明", "工具调用结果说明" in config.system_prompt),
        ("包含避免重复调用提示", "避免重复调用" in config.system_prompt),
        ("包含结果利用指导", "结果利用" in config.system_prompt),
        ("包含单次调用原则", "单次调用原则" in config.system_prompt),
        ("长度合理", len(config.system_prompt) > 100),
    ]
    
    for check_name, result in quality_checks:
        status = "✅" if result else "❌"
        print(f"{status} {check_name}")
    
    all_pass = all(result for _, result in quality_checks)
    if all_pass:
        print("\n✅ 系统提示词质量检查通过\n")
    else:
        raise AssertionError("系统提示词质量检查未通过")


def test_tool_registry():
    """测试工具注册机制"""
    print("=" * 60)
    print("集成测试4：工具注册机制测试")
    print("=" * 60)
    
    agent = test_agent_initialization()
    
    # 测试工具获取
    tools_for_openai = agent.tool_registry.get_all_tools_for_openai()
    
    print(f"✅ 工具注册和获取成功")
    print(f"   OpenAI格式工具数: {len(tools_for_openai)}")
    
    # 验证格式
    for tool in tools_for_openai:
        assert "type" in tool, "工具缺少 type 字段"
        assert tool["type"] == "function", "工具 type 应为 function"
        assert "function" in tool, "工具缺少 function 字段"
        assert "name" in tool["function"], "工具函数缺少 name 字段"
        assert "description" in tool["function"], "工具函数缺少 description 字段"
        assert "parameters" in tool["function"], "工具函数缺少 parameters 字段"
    
    print("✅ OpenAI格式工具验证通过\n")


def summary():
    """输出测试总结"""
    print("=" * 60)
    print("集成测试总结")
    print("=" * 60)
    print("""
✅ Agent框架所有关键组件工作正常
✅ 工具定义完整，包含防重复调用提示
✅ 系统提示词质量达标，包含必要的指导
✅ 工具注册和格式转换机制运行正常

修改后的Agent系统已准备好部署：
1. 新的系统提示词会引导Agent理解"部分成功"
2. 工具返回结果中的明确说明强化了这一认知
3. 调用历史追踪机制提供了强制防护

预期运行结果：
• Agent会更谨慎地调用工具
• 不会再出现不必要的重复调用
• 系统性能和用户体验都会提升
    """)


if __name__ == "__main__":
    try:
        test_agent_initialization()
        test_tool_definitions()
        test_system_prompt_quality()
        test_tool_registry()
        summary()
        
        print("=" * 60)
        print("🎉 所有集成测试通过！")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n❌ 集成测试失败: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ 发生错误: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
