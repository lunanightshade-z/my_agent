# Chat 和 Agent 页面数据隔离修复

## 问题描述

Chat 页面的聊天记录会出现在 Agent 页面，两个页面的数据没有做好隔离。

## 问题分析

### 根本原因

1. **共享 Redux Store**：Chat 和 Agent 页面共享同一个 Redux store（`state.chat`），包括：
   - `conversations` - 会话列表
   - `currentConversationId` - 当前会话ID
   - `messages` - 消息列表

2. **页面切换时状态未清理**：
   - 用户在 Chat 页面选择了一个会话（ID=1，类型='chat'），`currentConversationId = 1`，`messages` 包含该会话的消息
   - 用户切换到 Agent 页面
   - Agent 页面加载会话列表时，虽然只显示 'agent' 类型的会话，但是：
     - `currentConversationId` 仍然是 1（Chat 页面的会话ID）
     - Agent 页面的 useEffect 检测到 `currentConversationId` 存在，就会调用 `getConversationMessages(1)`
     - 后端返回会话1的消息（即使它是 'chat' 类型），Agent 页面就会显示这些消息

3. **缺少会话类型验证**：
   - 前端在加载消息前没有验证会话类型是否匹配
   - 后端 API 只验证会话是否存在且属于当前用户，但没有验证会话类型

## 解决方案

### 1. Agent 页面修复

**文件**：`frontend/src/pages/Agent.jsx`

#### 修改点 1：页面挂载时清空不匹配的会话状态

```javascript
// 页面挂载时，清空不属于 agent 类型的会话状态
useEffect(() => {
  if (currentConversationId) {
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (!currentConv || currentConv.conversation_type !== 'agent') {
      console.log('Agent 页面：检测到不匹配的会话类型，清空状态');
      dispatch(setCurrentConversation(null));
      dispatch(setMessages([]));
    }
  }
}, [location.pathname]); // 当路由变化到 /agent 时触发
```

#### 修改点 2：加载会话列表时验证当前会话

```javascript
// 加载会话列表
useEffect(() => {
  const loadConversations = async () => {
    try {
      const convs = await getConversations('agent');
      dispatch(setConversations(convs));
      
      // 如果当前选中的会话不在新的会话列表中，清空状态
      if (currentConversationId) {
        const currentConv = convs.find(c => c.id === currentConversationId);
        if (!currentConv || currentConv.conversation_type !== 'agent') {
          console.log('当前会话不属于 agent 类型，清空状态');
          dispatch(setCurrentConversation(null));
          dispatch(setMessages([]));
        }
      }
    } catch (error) {
      console.error('加载会话列表失败:', error);
    }
  };
  loadConversations();
}, [dispatch, currentConversationId]);
```

#### 修改点 3：加载消息前验证会话类型

```javascript
// 加载选中会话的消息
useEffect(() => {
  if (currentConversationId) {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }
    const loadMessages = async () => {
      try {
        // 验证当前会话是否属于 agent 类型
        const currentConv = conversations.find(c => c.id === currentConversationId);
        if (!currentConv) {
          // 如果当前会话不在列表中，说明可能是其他类型的会话，清空状态
          console.warn('当前会话不属于 agent 类型，清空状态');
          dispatch(setCurrentConversation(null));
          dispatch(setMessages([]));
          return;
        }
        if (currentConv.conversation_type !== 'agent') {
          // 如果会话类型不匹配，清空状态
          console.warn('会话类型不匹配，清空状态。期望: agent, 实际:', currentConv.conversation_type);
          dispatch(setCurrentConversation(null));
          dispatch(setMessages([]));
          return;
        }
        
        const msgs = await getConversationMessages(currentConversationId);
        // ... 处理消息
      } catch (error) {
        console.error('加载消息失败:', error);
        // 如果加载失败，清空状态
        dispatch(setCurrentConversation(null));
        dispatch(setMessages([]));
      }
    };
    loadMessages();
  } else {
    dispatch(setMessages([]));
  }
}, [currentConversationId, conversations, dispatch]);
```

### 2. Chat 页面修复

**文件**：`frontend/src/components/layout/AppLayout.jsx`

#### 修改点 1：页面挂载时清空不匹配的会话状态

```javascript
// Chat 页面挂载时，清空不属于 chat 类型的会话状态
useEffect(() => {
  if (isChatPage && currentConversationId) {
    const currentConv = conversations.find(c => c.id === currentConversationId);
    if (!currentConv || currentConv.conversation_type !== 'chat') {
      console.log('Chat 页面：检测到不匹配的会话类型，清空状态');
      dispatch(setCurrentConversation(null));
      dispatch(setMessages([]));
    }
  }
}, [location.pathname, isChatPage, currentConversationId, conversations, dispatch]);
```

**文件**：`frontend/src/components/ChatHistory.jsx`

#### 修改点 2：切换会话时验证类型

```javascript
// 切换会话
const handleSelectConversation = useCallback(async (convId) => {
  if (convId === currentConversationId) return;
  
  try {
    dispatch(setLoading(true));
    
    // 验证会话是否属于 chat 类型
    const targetConv = conversations.find(c => c.id === convId);
    if (!targetConv) {
      console.warn('会话不存在于列表中');
      dispatch(setLoading(false));
      return;
    }
    if (targetConv.conversation_type !== 'chat') {
      console.warn('会话类型不匹配，期望: chat, 实际:', targetConv.conversation_type);
      dispatch(setLoading(false));
      return;
    }
    
    dispatch(setCurrentConversation(convId));
    const messages = await getConversationMessages(convId);
    dispatch(setMessages(messages));
    
    // 重新加载会话列表以获取最新信息
    const updatedConvs = await getConversations('chat');
    dispatch(setConversations(updatedConvs));
    
    // 再次验证当前会话是否还在列表中且类型正确
    const updatedConv = updatedConvs.find(c => c.id === convId);
    if (!updatedConv || updatedConv.conversation_type !== 'chat') {
      console.warn('会话类型验证失败，清空状态');
      dispatch(setCurrentConversation(null));
      dispatch(setMessages([]));
    }
  } catch (error) {
    console.error('加载消息失败:', error);
    dispatch(setCurrentConversation(null));
    dispatch(setMessages([]));
  } finally {
    dispatch(setLoading(false));
  }
}, [currentConversationId, conversations, dispatch]);
```

#### 修改点 3：加载会话列表时验证当前会话

```javascript
// 加载会话列表
useEffect(() => {
  const loadAndValidate = async () => {
    await loadConversations();
    
    // 如果当前选中的会话不在新的会话列表中，清空状态
    if (currentConversationId) {
      const convs = await getConversations('chat');
      const currentConv = convs.find(c => c.id === currentConversationId);
      if (!currentConv || currentConv.conversation_type !== 'chat') {
        console.log('当前会话不属于 chat 类型，清空状态');
        dispatch(setCurrentConversation(null));
        dispatch(setMessages([]));
      }
    }
  };
  loadAndValidate();
}, []);
```

## 修复效果

1. **页面切换时自动清理**：当用户从 Chat 页面切换到 Agent 页面（或反之）时，如果当前会话类型不匹配，会自动清空 `currentConversationId` 和 `messages`
2. **加载前验证**：在加载消息前，会验证会话类型是否匹配，避免加载错误类型的消息
3. **会话列表同步验证**：加载会话列表后，会验证当前选中的会话是否还在列表中且类型正确

## 测试建议

1. **测试场景 1**：在 Chat 页面选择一个会话，然后切换到 Agent 页面
   - 预期：Agent 页面不应该显示 Chat 页面的消息
   - 预期：Agent 页面的会话列表只显示 agent 类型的会话

2. **测试场景 2**：在 Agent 页面选择一个会话，然后切换到 Chat 页面
   - 预期：Chat 页面不应该显示 Agent 页面的消息
   - 预期：Chat 页面的会话列表只显示 chat 类型的会话

3. **测试场景 3**：在 Chat 页面发送消息，然后切换到 Agent 页面，再切换回 Chat 页面
   - 预期：Chat 页面的消息应该正常显示
   - 预期：Agent 页面不应该显示 Chat 页面的消息

## 技术要点

1. **路由监听**：使用 `useLocation` hook 监听路由变化，在页面切换时触发验证
2. **类型验证**：在多个关键点验证会话类型，确保数据隔离
3. **状态清理**：当检测到类型不匹配时，立即清空相关状态，避免数据混淆

## 相关文件

- `frontend/src/pages/Agent.jsx` - Agent 页面组件
- `frontend/src/components/layout/AppLayout.jsx` - Chat 页面布局组件
- `frontend/src/components/ChatHistory.jsx` - Chat 页面历史记录组件
- `frontend/src/store/store.js` - Redux store 配置
- `frontend/src/services/api.js` - API 服务

## 日期

2026-01-23
