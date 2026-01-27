/**
 * Redux Store 配置
 * 使用 Redux Toolkit 管理应用状态
 */
import { configureStore, createSlice } from '@reduxjs/toolkit';

// ==================== Chat Slice ====================

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],                    // 会话列表
    currentConversationId: null,          // 当前会话 ID
    messages: [],                         // 当前会话的消息列表
    isStreaming: false,                   // 是否正在接收流式响应
    thinkingEnabled: false,               // thinking 模式开关
    modelProvider: 'qwen3-235b',  // 模型标识符（默认 Qwen 235B）
    streamingContent: '',                 // 流式接收中的内容
    streamingThinking: '',                // 流式接收中的思考过程
    isThinking: false,                    // 是否正在思考阶段
    isLoading: false,                     // 是否正在加载
    error: null,                          // 错误信息
    toasts: [],                           // Toast 通知列表
    inputHistory: [],                     // 输入历史记录
  },
  reducers: {
    // 设置会话列表
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    
    // 添加新会话
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },
    
    // 删除会话
    removeConversation: (state, action) => {
      state.conversations = state.conversations.filter(
        conv => conv.id !== action.payload
      );
      if (state.currentConversationId === action.payload) {
        state.currentConversationId = null;
        state.messages = [];
      }
    },
    
    // 切换当前会话
    setCurrentConversation: (state, action) => {
      state.currentConversationId = action.payload;
      state.messages = [];
      state.streamingContent = '';
    },
    
    // 设置消息列表
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    
    // 添加用户消息
    addUserMessage: (state, action) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    
    // 开始流式响应
    startStreaming: (state) => {
      state.isStreaming = true;
      state.streamingContent = '';
      state.streamingThinking = '';
      state.isThinking = false;
      // 添加一个临时的 assistant 消息
      state.messages.push({
        role: 'assistant',
        content: '',
        thinking: '',
        toolCalls: [], // 工具调用列表
        timestamp: new Date().toISOString(),
        isStreaming: true,
        isThinking: false,
      });
    },
    
    // 追加思考过程
    appendStreamingThinking: (state, action) => {
      state.streamingThinking += action.payload;
      state.isThinking = true;
      // 更新最后一条消息的思考过程
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.isStreaming) {
        lastMessage.thinking = state.streamingThinking;
        lastMessage.isThinking = true;
      }
    },
    
    // 添加工具调用
    addToolCall: (state, action) => {
      console.log('addToolCall action:', action.payload);
      const lastMessage = state.messages[state.messages.length - 1];
      console.log('最后一条消息:', lastMessage);
      if (lastMessage && lastMessage.isStreaming) {
        if (!lastMessage.toolCalls) {
          lastMessage.toolCalls = [];
        }
        
        // 确保工具调用对象包含所有必需字段
        const toolCall = {
          id: Date.now() + Math.random(), // 生成唯一ID
          tool_name: action.payload.tool_name || action.payload.name || 'unknown', // 支持多种字段名
          tool_arguments: action.payload.tool_arguments || action.payload.arguments || {}, // 支持多种字段名
          isExecuting: true,
          content: action.payload.content || '', // 保留原始内容
          ...action.payload, // 保留其他字段
        };
        
        console.log('添加工具调用:', toolCall);
        lastMessage.toolCalls.push(toolCall);
        console.log('工具调用列表:', lastMessage.toolCalls);
      } else {
        console.warn('无法添加工具调用: 最后一条消息不存在或不在流式状态', {
          hasLastMessage: !!lastMessage,
          isStreaming: lastMessage?.isStreaming,
          payload: action.payload
        });
      }
    },

    // 更新工具调用结果
    updateToolResult: (state, action) => {
      console.log('updateToolResult action:', action.payload);
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.toolCalls && lastMessage.toolCalls.length > 0) {
        const toolName = action.payload.tool_name;
        
        // 找到匹配的工具调用（优先查找正在执行的，然后查找最后一个）
        let toolCallIndex = -1;
        
        // 先尝试找到正在执行的同名工具调用
        for (let i = lastMessage.toolCalls.length - 1; i >= 0; i--) {
          if (lastMessage.toolCalls[i].tool_name === toolName && lastMessage.toolCalls[i].isExecuting) {
            toolCallIndex = i;
            break;
          }
        }
        
        // 如果没有找到正在执行的，找最后一个同名的
        if (toolCallIndex === -1) {
          for (let i = lastMessage.toolCalls.length - 1; i >= 0; i--) {
            if (lastMessage.toolCalls[i].tool_name === toolName) {
              toolCallIndex = i;
              break;
            }
          }
        }
        
        console.log('找到工具调用索引:', toolCallIndex, '工具名称:', toolName);
        if (toolCallIndex >= 0) {
          lastMessage.toolCalls[toolCallIndex].isExecuting = false;
          lastMessage.toolCalls[toolCallIndex].result = action.payload;
          lastMessage.toolCalls[toolCallIndex].content = action.payload.content || '';
          console.log('工具调用结果已更新:', lastMessage.toolCalls[toolCallIndex]);
        } else {
          console.warn('未找到匹配的工具调用:', {
            toolName,
            toolCalls: lastMessage.toolCalls.map(tc => ({
              name: tc.tool_name,
              isExecuting: tc.isExecuting
            }))
          });
        }
      } else {
        console.warn('无法更新工具调用结果: 最后一条消息不存在或没有工具调用', {
          hasLastMessage: !!lastMessage,
          hasToolCalls: !!lastMessage?.toolCalls,
          toolCallsLength: lastMessage?.toolCalls?.length || 0,
          payload: action.payload
        });
      }
    },

    // 追加流式内容（回答内容）
    appendStreamingContent: (state, action) => {
      state.streamingContent += action.payload;
      state.isThinking = false; // 开始回答，思考阶段结束
      // 更新最后一条消息的内容
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.isStreaming) {
        lastMessage.content = state.streamingContent;
        lastMessage.isThinking = false;
      }
    },
    
    // 结束流式响应
    endStreaming: (state) => {
      state.isStreaming = false;
      state.isThinking = false;
      // 标记最后一条消息为完成状态
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage && lastMessage.isStreaming) {
        lastMessage.isStreaming = false;
        lastMessage.isThinking = false;
      }
      state.streamingContent = '';
      state.streamingThinking = '';
    },
    
    // 切换 thinking 模式
    toggleThinking: (state) => {
      state.thinkingEnabled = !state.thinkingEnabled;
    },
    
    // 设置 thinking 模式
    setThinking: (state, action) => {
      state.thinkingEnabled = action.payload;
    },
    
    // 设置模型提供商
    setModelProvider: (state, action) => {
      state.modelProvider = action.payload;
    },
    
    // 设置加载状态
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // 设置错误信息
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    
    // ==================== Toast 管理 ====================
    
    // 添加 Toast
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        duration: action.payload.duration !== undefined ? action.payload.duration : 4000,
      };
      state.toasts.push(toast);
    },
    
    // 移除 Toast
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    // ==================== 输入历史管理 ====================
    
    // 添加到输入历史
    addToInputHistory: (state, action) => {
      // 避免连续重复
      if (state.inputHistory.length === 0 || state.inputHistory[0] !== action.payload) {
        state.inputHistory.unshift(action.payload);
        // 最多保存 20 条
        if (state.inputHistory.length > 20) {
          state.inputHistory.pop();
        }
      }
    },
    
    // ==================== 消息操作 ====================
    
    // 删除消息（用于重新生成前删除旧回复）
    removeMessage: (state, action) => {
      state.messages = state.messages.filter((_, index) => index !== action.payload);
    },
    
    // 更新消息内容（用于编辑）
    updateMessage: (state, action) => {
      const { index, content } = action.payload;
      if (state.messages[index]) {
        state.messages[index].content = content;
      }
    },
  },
});

// 导出 actions
export const {
  setConversations,
  addConversation,
  removeConversation,
  setCurrentConversation,
  setMessages,
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  addToolCall,
  updateToolResult,
  endStreaming,
  toggleThinking,
  setThinking,
  setModelProvider,
  setLoading,
  setError,
  clearError,
  addToast,
  removeToast,
  addToInputHistory,
  removeMessage,
  updateMessage,
} = chatSlice.actions;

// 创建 Redux store
const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
});

export default store;

