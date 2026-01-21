#!/bin/bash

# 智能体API集成验证脚本

echo "=================================="
echo "  智能体API集成验证"
echo "=================================="
echo ""

# 检查后端文件
echo "1. 检查后端文件..."
echo ""

files=(
    "backend/app/services/agent_service.py"
    "backend/app/api/v1/agent.py"
    "backend/app/dependencies.py"
    "backend/app/main.py"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        all_files_exist=false
    fi
done

echo ""

# 检查前端文件
echo "2. 检查前端文件..."
echo ""

frontend_files=(
    "frontend/src/services/api.js"
    "frontend/src/pages/Agent.jsx"
)

for file in "${frontend_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        all_files_exist=false
    fi
done

echo ""

# 检查Python语法
echo "3. 检查Python语法..."
echo ""

cd backend
python3 -m py_compile app/services/agent_service.py app/api/v1/agent.py 2>&1
if [ $? -eq 0 ]; then
    echo "  ✅ Python语法检查通过"
else
    echo "  ❌ Python语法检查失败"
    all_files_exist=false
fi

cd ..
echo ""

# 检查导入
echo "4. 检查关键导入..."
echo ""

if grep -q "get_agent_service" backend/app/dependencies.py; then
    echo "  ✅ dependencies.py 包含 get_agent_service"
else
    echo "  ❌ dependencies.py 缺少 get_agent_service"
    all_files_exist=false
fi

if grep -q "agent.router" backend/app/main.py; then
    echo "  ✅ main.py 注册了 agent router"
else
    echo "  ❌ main.py 未注册 agent router"
    all_files_exist=false
fi

if grep -q "sendAgentMessageStream" frontend/src/services/api.js; then
    echo "  ✅ api.js 包含 sendAgentMessageStream"
else
    echo "  ❌ api.js 缺少 sendAgentMessageStream"
    all_files_exist=false
fi

echo ""

# 总结
echo "=================================="
if [ "$all_files_exist" = true ]; then
    echo "  ✅ 集成验证通过"
    echo "=================================="
    echo ""
    echo "下一步："
    echo "1. 启动后端: cd backend && uvicorn app.main:app --reload"
    echo "2. 测试API: cd backend && python3 tests/test_agent_api_integration.py"
    echo "3. 启动前端: cd frontend && npm run dev"
    echo "4. 访问: http://localhost:5173/agent"
else
    echo "  ❌ 集成验证失败"
    echo "=================================="
    echo ""
    echo "请检查上述失败项"
fi

echo ""
