/**
 * API 服务模块
 * 封装所有与后端的 HTTP 通信
 */
import axios from 'axios';

// 关键：使用相对路径走 Vite proxy（同源），避免浏览器 CORS 预检导致的失败
const API_BASE_URL = '/api';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== 会话管理 API ====================

/**
 * 创建新对话
 */
export const createConversation = async (title = '新对话') => {
  const response = await apiClient.post('/conversations', { title });
  return response.data;
};

/**
 * 获取所有对话列表
 */
export const getConversations = async () => {
  const response = await apiClient.get('/conversations');
  return response.data.conversations;
};

/**
 * 删除对话
 */
export const deleteConversation = async (conversationId) => {
  await apiClient.delete(`/conversations/${conversationId}`);
};

/**
 * 获取对话的消息历史
 */
export const getConversationMessages = async (conversationId) => {
  const response = await apiClient.get(`/conversations/${conversationId}/messages`);
  return response.data.messages;
};

/**
 * 生成对话标题
 */
export const generateConversationTitle = async (conversationId, firstMessage) => {
  const response = await apiClient.post(`/conversations/${conversationId}/generate-title`, null, {
    params: { first_message: firstMessage }
  });
  return response.data;
};

/**
 * 更新对话标题
 */
export const updateConversationTitle = async (conversationId, title) => {
  const response = await apiClient.put(`/conversations/${conversationId}/title`, null, {
    params: { title }
  });
  return response.data;
};

// ==================== 聊天 API ====================

/**
 * 发送聊天消息（流式）
 * 使用 EventSource 处理 SSE
 */
export const sendMessageStream = (conversationId, message, thinkingEnabled, onThinking, onChunk, onDone, onError) => {
  // 使用 fetch 发送 POST 请求，然后处理流式响应
  const url = `${API_BASE_URL}/chat/stream`;
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      message: message,
      thinking_enabled: thinkingEnabled,
    }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // 递归读取流
      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            onDone();
            return;
          }
          
          // 解码数据
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          lines.forEach(line => {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'thinking' && parsed.content) {
                  // 思考过程
                  onThinking(parsed.content);
                } else if (parsed.type === 'delta' && parsed.content) {
                  // 回答内容
                  onChunk(parsed.content);
                } else if (parsed.type === 'done') {
                  onDone();
                } else if (parsed.type === 'error') {
                  onError(parsed.error || '未知错误');
                }
              } catch (e) {
                console.error('解析 SSE 数据失败:', e);
              }
            }
          });
          
          // 继续读取
          readStream();
        });
      };
      
      readStream();
    })
    .catch(error => {
      onError(error.message || '请求失败');
    });
};

export default {
  createConversation,
  getConversations,
  deleteConversation,
  getConversationMessages,
  sendMessageStream,
  generateConversationTitle,
  updateConversationTitle,
};

