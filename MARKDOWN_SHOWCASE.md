# Markdown 样式展示示例

这个文件展示了Markdown样式系统能够渲染的各种格式。

## 标题演示

### 一级标题
这是一级标题，通常用于文档的主标题。字体大小 1.8rem，底部有边框。

#### 二级标题
二级标题，用于主要分章节。字体大小 1.5rem。

##### 三级标题
三级标题，用于子章节。字体大小 1.3rem，会呈现青蓝色。

###### 四级及以下标题
四级到六级标题，字体逐级递减。

## 文本格式演示

这是一段**普通段落**，包含了各种**文本格式**。

- **粗体文本** - 用于强调，颜色为青蓝色
- *斜体文本* - 用于强调某些概念
- ***粗斜体*** - 同时强调
- ~~删除线~~ - 表示已移除的内容
- <u>下划线</u> - 表示重要标记

### 代码示例

#### 行内代码
在文本中，我们可以使用 `const x = 10;` 这样的**行内代码**。

行内代码会显示青蓝色背景，自动提醒读者这是代码。

#### 代码块 - Python

```python
def hello_world():
    """这是一个简单的Python函数"""
    message = "Hello, World!"
    print(message)
    return message

# 调用函数
result = hello_world()
```

会展示：
- 语言标签："python"
- 代码高亮（语法着色）
- 复制按钮

#### 代码块 - JavaScript

```javascript
// 使用常用的JavaScript代码
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Data:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// 调用
fetchData('https://api.example.com/data');
```

#### 代码块 - SQL

```sql
SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;
```

## 列表演示

### 无序列表

- 第一个要点
- 第二个要点
  - 嵌套的子要点
  - 另一个子要点
- 第三个要点

### 有序列表

1. 首先，准备环境
2. 其次，安装依赖
   1. 安装Node.js
   2. 安装npm包
3. 最后，启动项目

## 表格演示

| 功能 | 支持 | 说明 |
|-----|------|------|
| 标题 | ✅ | 支持H1-H6 |
| 代码 | ✅ | 100+种语言高亮 |
| 表格 | ✅ | 带行条纹和hover |
| 列表 | ✅ | 有序和无序 |
| 引用 | ✅ | 带左边框 |
| 链接 | ✅ | 新窗口打开 |

### 表格特点

- 表头会用青蓝色背景突出
- 行项之间有轻微的背景条纹
- Hover时行会高亮
- 响应式：移动设备上可横向滚动

## 引用块演示

> 这是一个引用块。引用块用于强调重要信息或引用他人的观点。
>
> 引用块有左边框，背景颜色较浅，看起来很专业。

> **注意**: 这是一条重要提示！
> 
> 引用块内也可以包含其他格式的内容，比如**粗体**、*斜体*等。

> 作为一个好的实践，引用块应该用于：
> - 重要通知
> - 注意事项
> - 引用他人观点

## 链接演示

这里是一些[链接示例](https://example.com)。

- [GitHub](https://github.com)
- [Stack Overflow](https://stackoverflow.com)
- [MDN文档](https://developer.mozilla.org)

所有链接都会以青蓝色呈现，并带有下划线。点击时会在新窗口打开。

## 分割线

以下是分割线的效果：

---

分割线用于在内容之间创建视觉分隔。

---

## 复杂场景

### 场景1: API文档

```python
def create_user(name: str, email: str) -> dict:
    """
    创建新用户
    
    Args:
        name: 用户名
        email: 邮箱地址
    
    Returns:
        包含用户信息的字典
    """
    user = {
        'id': generate_id(),
        'name': name,
        'email': email,
        'created_at': datetime.now()
    }
    save_to_database(user)
    return user
```

> **使用说明**: 调用此函数前需确保email有效

1. 准备参数
2. 调用函数
3. 处理返回结果

### 场景2: 对比表格

| 特性 | Markdown | ReStructuredText | AsciiDoc |
|-----|----------|-----------------|----------|
| 易用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| 功能完整性 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 社区支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 学习曲线 | 平缓 | 陡峭 | 中等 |

### 场景3: 步骤指南

> **目标**: 配置开发环境

1. **克隆仓库**
   ```bash
   git clone https://github.com/example/repo.git
   cd repo
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **启动项目**
   ```bash
   npm run dev
   ```
   
   > 项目会运行在 `http://localhost:3000`

4. **验证安装**
   - 打开浏览器
   - 导航到上述地址
   - 看到欢迎页面即表示成功

## 样式特点总结

### 视觉设计
- ✨ 现代青蓝色主题
- ✨ 清晰的视觉层级
- ✨ 平衡的间距
- ✨ 流畅的交互

### 功能特性
- ✅ Prism语法高亮（100+语言）
- ✅ 代码块一键复制
- ✅ 响应式设计
- ✅ 深色模式兼容
- ✅ 可访问性支持

### 易用性
- 🎯 集中化样式配置
- 🎯 快速主题切换
- 🎯 详细的使用文档
- 🎯 完整的代码注释

## 样式配置参考

### 改变代码块背景

修改 `markdown-config.js`:
```javascript
colors: {
  codeBlockBackground: 'rgba(0, 0, 0, 0.6)',  // 更深
}
```

### 改变表格头颜色

```javascript
colors: {
  tableHeaderBackground: 'rgba(0, 255, 255, 0.25)',  // 更亮
}
```

### 改变字体大小

```javascript
fontSize: {
  paragraph: '1.05rem',  // 放大段落
  heading1: '2rem',      // 放大标题
}
```

## 下一步

现在你已经看到了Markdown样式系统的完整展示！

尝试以下操作：
1. 在Agent页面中输入包含Markdown的问题
2. 观察AI回答如何被渲染
3. 根据需要调整样式配置
4. 在不同设备上测试响应式效果

---

**提示**: 所有这些格式都可以在Agent对话中使用！
