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
export const createConversation = async (title = '新对话', conversationType = 'chat') => {
  const response = await apiClient.post('/conversations', { 
    title,
    conversation_type: conversationType
  });
  return response.data;
};

/**
 * 获取所有对话列表
 */
export const getConversations = async (conversationType = null) => {
  const params = {};
  if (conversationType) {
    params.conversation_type = conversationType;
  }
  const response = await apiClient.get('/conversations', { params });
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
  const response = await apiClient.post(`/conversations/${conversationId}/generate-title`, {
    first_message: firstMessage
  });
  return response.data;
};

/**
 * 更新对话标题
 */
export const updateConversationTitle = async (conversationId, title) => {
  const response = await apiClient.put(`/conversations/${conversationId}/title`, {
    title: title
  });
  return response.data;
};

// ==================== 聊天 API ====================

/**
 * 发送聊天消息（流式）
 * 使用 fetch 处理 SSE 流式响应
 */
export const sendMessageStream = (conversationId, message, thinkingEnabled, onThinking, onChunk, onDone, onError) => {
  // 使用 fetch 发送 POST 请求，然后处理流式响应
  const url = `${API_BASE_URL}/chat/stream`;
  
  let buffer = ''; // 用于累积不完整的数据块
  
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
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        });
      }
      
      if (!response.body) {
        throw new Error('响应体为空');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // 递归读取流
      const readStream = () => {
        reader.read()
          .then(({ done, value }) => {
            if (done) {
              // 处理剩余的缓冲区数据
              if (buffer.trim()) {
                processBuffer(buffer);
                buffer = '';
              }
              onDone();
              return;
            }
            
            // 解码数据并添加到缓冲区
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            // 处理完整的 SSE 消息（以 \n\n 分隔）
            const parts = buffer.split('\n\n');
            // 保留最后一个可能不完整的部分
            buffer = parts.pop() || '';
            
            // 处理每个完整的 SSE 消息
            parts.forEach(part => {
              processBuffer(part);
            });
            
            // 继续读取
            readStream();
          })
          .catch(error => {
            console.error('读取流失败:', error);
            onError(error.message || '读取流失败');
          });
      };
      
      // 处理 SSE 数据缓冲区
      const processBuffer = (data) => {
        const lines = data.split('\n');
        
        lines.forEach(line => {
          line = line.trim();
          if (!line) return;
          
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) return;
            
            try {
              const parsed = JSON.parse(jsonStr);
              
              if (parsed.type === 'thinking' && parsed.content !== undefined) {
                // 思考过程
                onThinking(parsed.content);
              } else if (parsed.type === 'delta' && parsed.content !== undefined) {
                // 回答内容增量
                onChunk(parsed.content);
              } else if (parsed.type === 'done') {
                // 完成信号
                onDone();
              } else if (parsed.type === 'error') {
                // 错误信息
                onError(parsed.content || parsed.error || '未知错误');
              }
            } catch (e) {
              console.error('解析 SSE 数据失败:', e, '原始数据:', jsonStr);
              // 不抛出错误，继续处理其他数据
            }
          }
        });
      };
      
      readStream();
    })
    .catch(error => {
      console.error('请求失败:', error);
      onError(error.message || '请求失败');
    });
};


// ==================== 智能体 API ====================

/**
 * 发送智能体消息（流式 - 支持工具调用）
 * 使用 fetch 处理 SSE 流式响应
 */
export const sendAgentMessageStream = (conversationId, message, onToolCall, onToolResult, onChunk, onDone, onError) => {
  const url = `${API_BASE_URL}/agent/stream`;
  
  let buffer = '';
  
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      message: message,
      thinking_enabled: false, // 智能体不使用thinking模式
    }),
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
        });
      }
      
      if (!response.body) {
        throw new Error('响应体为空');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      const readStream = () => {
        reader.read()
          .then(({ done, value }) => {
            if (done) {
              if (buffer.trim()) {
                processBuffer(buffer);
                buffer = '';
              }
              onDone();
              return;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;
            
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            
            parts.forEach(part => {
              processBuffer(part);
            });
            
            readStream();
          })
          .catch(error => {
            console.error('读取流失败:', error);
            onError(error.message || '读取流失败');
          });
      };
      
      const processBuffer = (data) => {
        const lines = data.split('\n');
        
        lines.forEach(line => {
          line = line.trim();
          if (!line) return;
          
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) return;
            
            try {
              const parsed = JSON.parse(jsonStr);
              
              // 添加日志记录
              console.log('📡 [SSE Parser] 收到数据类型:', parsed.type);
              
              if (parsed.type === 'tool_call') {
                // 工具调用
                console.log('🔧 [SSE Parser] 解析工具调用:', {
                  tool_name: parsed.tool_name,
                  has_arguments: !!parsed.tool_arguments
                });
                console.log('🔧 [SSE Parser] 工具调用完整数据:', parsed);
                onToolCall(parsed);
              } else if (parsed.type === 'tool_result') {
                // 工具结果
                console.log('✅ [SSE Parser] 解析工具结果:', {
                  tool_name: parsed.tool_name,
                  content_length: parsed.content ? parsed.content.length : 0
                });
                onToolResult(parsed);
              } else if (parsed.type === 'delta' && parsed.content !== undefined) {
                // 回答内容增量
                console.log('📝 [SSE Parser] 回答内容增量 (长度: ' + parsed.content.length + ')');
                onChunk(parsed.content);
              } else if (parsed.type === 'done') {
                // 完成信号
                console.log('🏁 [SSE Parser] 流式响应完成信号');
                onDone();
              } else if (parsed.type === 'error') {
                // 错误信息
                console.error('❌ [SSE Parser] 错误:', parsed.content || parsed.error);
                onError(parsed.content || parsed.error || '未知错误');
              } else {
                // 未处理的类型
                console.warn('⚠️ [SSE Parser] 未处理的消息类型:', parsed.type, parsed);
              }
            } catch (e) {
              console.error('❌ [SSE Parser] JSON 解析失败:', e);
              console.error('原始数据:', jsonStr);
            }
          }
        });
      };
      
      readStream();
    })
    .catch(error => {
      console.error('请求失败:', error);
      onError(error.message || '请求失败');
    });
};

