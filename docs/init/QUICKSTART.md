# 快速开始指南

## Windows 用户

### 方法一：使用启动脚本（推荐）

1. **启动后端**
   - 双击运行 `start_backend.bat`
   - 等待依赖安装完成
   - 看到 "Application startup complete" 表示启动成功

2. **启动前端**
   - 双击运行 `start_frontend.bat`
   - 等待依赖安装和编译完成
   - 浏览器会自动打开 `http://localhost:5173`

### 方法二：手动启动

1. **后端**
```cmd
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

2. **前端**
```cmd
cd frontend
npm install
npm run dev
```

## macOS / Linux 用户

### 方法一：使用启动脚本（推荐）

1. **赋予执行权限**
```bash
chmod +x start_backend.sh
chmod +x start_frontend.sh
```

2. **启动后端**
```bash
./start_backend.sh
```

3. **启动前端**（新终端窗口）
```bash
./start_frontend.sh
```

### 方法二：手动启动

1. **后端**
```bash
cd backend
pip3 install -r requirements.txt
uvicorn main:app --reload
```

2. **前端**
```bash
cd frontend
npm install
npm run dev
```

## 环境检查

运行配置检查脚本：

```bash
python check_system.py
```

这将检查：
- Python 版本
- 环境变量配置
- Python 依赖
- 文件结构

## 常见问题

### 1. 端口被占用

**后端端口 8000 被占用：**
```bash
# 修改后端端口
uvicorn main:app --reload --port 8001
```

**前端端口 5173 被占用：**
修改 `frontend/vite.config.js` 中的 `server.port` 配置

### 2. 无法连接后端

- 确认后端已启动且运行在 `http://localhost:8000`
- 检查浏览器控制台是否有 CORS 错误
- 确认防火墙未阻止连接

### 3. 智谱API调用失败

- 检查 `.env` 文件中的 `ZHIPU_API_KEY` 是否正确
- 确认 API 密钥有足够的配额
- 检查网络连接

### 4. 前端依赖安装失败

尝试清理缓存后重新安装：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### 5. 后端依赖安装失败

建议使用虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

## 访问地址

- **前端应用**: http://localhost:5173
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **健康检查**: http://localhost:8000/health

## 首次使用

1. 打开应用后，点击左上角"新建对话"
2. 在底部输入框输入问题
3. 按 Enter 发送（Shift+Enter 换行）
4. 可点击"深度思考"开关启用 thinking 模式
5. 左侧会显示所有历史对话，点击可切换

## 技术支持

如遇到问题，请查看：
- `README.md` - 详细文档
- `TODO.md` - 功能规划
- 后端日志 - 终端输出
- 前端控制台 - 浏览器开发者工具

