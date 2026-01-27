# 🎨 黑色系主题升级 - 快速参考卡

## 颜色查询表

### 主要颜色
```
背景色 (Background)
#0f0f0f - 纯黑 (primary)
#1a1a1a - 深灰黑 (secondary)  
#262626 - 中灰黑 (tertiary)

强调色 (Accent)
#d4af37 - 黄金 (gold) ⭐
#e8d9c3 - 香槟金 (champagne)
#b87333 - 铜色 (copper)
#d4a5a5 - 玫瑰金 (rose)

文本色 (Text)
#f0ede5 - 主文本
#b8b8b8 - 次文本
#808080 - 三级文本
```

## Tailwind 类名对照

### 新增可用类
```
Text: text-elite-gold, text-elite-champagne
Background: bg-elite-gold, bg-elite-champagne
Border: border-elite-gold, border-elite-copper
Shadow: shadow-glow-gold, shadow-glow-champagne

Dark Mode:
bg-dark-bg, bg-dark-surface, bg-dark-card
```

### 弃用的类名
```
❌ text-cyan-400
❌ bg-cyan-500/20
❌ border-cyan-500/50
❌ text-purple-400
❌ shadow-cyan-500/30

✅ 替换为上面的新类名
```

## 常见组件颜色更新

### ChatBubble (聊天气泡)
```javascript
// 用户消息
background: 'rgba(212, 175, 55, 0.15)'
borderRight: 'rgba(212, 175, 55, 0.4)'

// AI 消息
background: 'rgba(184, 115, 51, 0.12)'
borderLeft: 'rgba(212, 175, 55, 0.35)'
```

### Input (输入框)
```
border: rgba(212, 175, 55, 0.25)
focus shadow: 0 0 10px rgba(212, 175, 55, 0.2)
button: linear-gradient(to right, #d4af37, #e8d9c3)
```

### Button (按钮)
```
primary: from-elite-gold to-elite-champagne
hover: shadow-glow-gold
```

## CSS 变量

```css
--color-bg-primary: #0f0f0f;
--color-primary: #d4af37;
--accent-gold: #d4af37;
--gradient-gold: linear-gradient(135deg, #d4af37 0%, #e8d9c3 100%);
--text-primary: #f0ede5;
```

## 使用示例

### React 组件中
```jsx
// ✅ 新做法
className="text-elite-gold bg-elite-gold/20"
className="hover:text-elite-champagne"

// ❌ 旧做法
className="text-cyan-400 bg-cyan-500/20"
className="hover:text-cyan-300"
```

### 内联样式中
```jsx
// ✅ 新做法
style={{ color: '#d4af37' }}
style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}

// ❌ 旧做法
style={{ color: '#00ffff' }}
style={{ borderColor: 'rgba(0, 255, 255, 0.2)' }}
```

## 快速替换命令

```bash
# 在编辑器中查找替换
Find: text-cyan-400
Replace: text-elite-gold

Find: bg-cyan-500/20
Replace: bg-elite-gold/20

Find: border-cyan-500/50
Replace: border-elite-gold/50
```

## 常见问题

**Q: 如何添加新的金色变种?**
```javascript
// 在 tailwind.config.js 中
elite: {
  // ...existing
  700: '#8a7530',  // 新的深金色
}
```

**Q: 想恢复旧的青色主题?**
需要全局替换 elite 配色回到 cyber 配色，建议创建新分支而非直接修改。

**Q: 代码块颜色怎么改?**
在 ChatBubble.jsx 中的 markdown components 部分修改：
```jsx
code: { className: "bg-elite-gold/20 text-elite-champagne" }
```

---

**最后更新**: 2026-01-13  
**版本**: 1.0
