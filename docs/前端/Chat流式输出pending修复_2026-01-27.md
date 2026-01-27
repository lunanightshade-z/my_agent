# Chat 流式输出 pending 修复（SSE 直通）与模型选择器位置调整

**日期**：2026-01-27  
**范围**：前端 Chat、Nginx 反向代理（生产部署）

## 问题现象

- **模型选择器不可见**：原先放在聊天区顶部，容易被布局/滚动遮挡，用户在界面上看不到。
- **聊天流式输出不出现**：用户发送消息后浏览器 Network 长时间 `pending`，页面不显示增量；刷新后才看到完整回复（说明后端保存了消息，但前端未收到实时分片）。

## 根因分析

### 1) Nginx 对 SSE 的配置导致分片被缓冲

SSE 需要代理层 **禁用缓冲** 并允许 **chunked 传输**，否则浏览器收不到增量数据，表现为请求长时间 `pending`、UI 不更新。

项目原 `docker/nginx.conf` 中对 `/api/` 统一配置了 SSE 相关项，并将 `chunked_transfer_encoding off;` 关闭，会导致流式分片无法及时下发。

### 2) 前端读取流结束条件不够“强”

即使后端发出 `{"type":"done"}`，如果连接未立刻关闭（代理/网络），前端仍会继续 `reader.read()`，浏览器会保持 `pending` 状态。

## 修复方案

### A. 模型选择器移动到输入框上方

文件：`frontend/src/components/ChatMain.jsx`

- 移除聊天区顶部的模型选择器栏
- 将模型选择器放到 **输入框上方**，并与输入框同宽（`max-w-4xl` 容器）

### B. Nginx 为 `/api/chat/stream` 单独开 SSE 直通配置

文件：`docker/nginx.conf`

- 为 `location = /api/chat/stream` 单独配置：
  - `proxy_buffering off;`
  - `proxy_cache off;`
  - `gzip off;`
  - `chunked_transfer_encoding on;`
  - `proxy_read_timeout 3600; proxy_send_timeout 3600;`
  - `add_header X-Accel-Buffering "no" always;`
- `/api/` 其他普通接口恢复为常规代理配置（避免被 SSE 配置影响）。

### C. 前端收到 done/error 后主动关闭 reader，避免持续 pending

文件：`frontend/src/services/api.js`

- 增加 `finished` 标记，避免 `done` 重复触发
- 收到 `type === "done"` 或 `type === "error"` 时：
  - 立即调用 `reader.cancel()` 主动结束读取
  - 同时调用 `onDone()` / `onError()` 更新 UI

## 后端流式验证（两模型、带/不带 thinking）

通过 Nginx 入口对 SSE 进行了实际验证（`curl -N`），结果如下：

- `kimi` + `thinking_enabled=false`：持续输出 `type: delta`
- `kimi` + `thinking_enabled=true`：持续输出 `type: thinking`（随后会继续输出 `delta`）
- `zhipu` + `thinking_enabled=false`：持续输出 `type: delta`
- `zhipu` + `thinking_enabled=true`：持续输出 `type: thinking`（随后会继续输出 `delta`）

说明：两模型在 Nginx 代理下均可正常流式下发分片。

## 部署说明

修改 `docker/nginx.conf` 与前端资源后，需要重建并重启 Nginx（以及重新打包前端静态资源）：

```bash
docker compose up -d --build nginx
```

## 结果

- **模型选择器可见**：稳定出现在聊天输入框上方。
- **流式输出恢复**：发送后可实时看到增量输出，不再长时间 `pending`；即使连接未立即关闭，也会在收到 `done` 时主动结束读取。

