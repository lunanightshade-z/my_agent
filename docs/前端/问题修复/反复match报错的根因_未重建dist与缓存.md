# 反复出现 match 报错 & 页面黑屏 —— 根因与修复

## 现象

- 打开页面反复出现：
  - `TypeError: Cannot read properties of undefined (reading 'match')`
  - 堆栈指向 `dist/assets/index-CctjlSLR.js:227:4147`
- 页面仅显示背景色，React 内容未渲染（运行时异常导致挂载中断）。

## 根本原因

本次问题的“反复出现”不是因为源代码修复无效，而是因为**实际被访问的是生产构建产物 `frontend/dist` 中的旧 bundle**：

- `frontend/dist/assets/index-CctjlSLR.js` 仍然存在并被页面引用（或被浏览器缓存继续执行）。
- Nginx 配置对 `.js` 设置了 `Cache-Control: public, immutable` + `expires 1y`，浏览器会长期缓存旧的 hash 文件，导致即使你改了源码，只要 **没有重新构建并让 `index.html` 指向新 hash 文件**，就会一直复现同样的错误。

## 修复动作

在 `frontend/` 目录重新执行生产构建，生成新的 hash 文件并覆盖 `dist/`：

```bash
cd /home/superdev/my_agent/frontend
npm run build
```

构建后：

- `dist/assets/index-CctjlSLR.js` 被清理
- 新产物为 `dist/assets/index-dp2LNtWq.js`
- `dist/index.html` 更新为引用新的 JS/CSS

## 部署/运行侧验证要点

如果你使用 `backend/docker/docker-compose.yml` 的 nginx 服务：

- nginx 通过 volume 挂载 `../../frontend/dist` 到 `/usr/share/nginx/html`
- **只要 `dist/` 更新，容器无需重建即可生效**（刷新页面即可）

浏览器侧：

- 由于旧 JS 可能被强缓存，建议 **强制刷新**（Hard Reload）或打开无痕窗口验证。

## 结论

此次“反复报错”的根因是：**运行的是旧的生产构建产物 + immutable 缓存**，而不是修复逻辑没生效。

