/**
 * 主聊天界面组件
 * 展示消息列表和处理流式响应
 */
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import MessageBubble from './MessageBubble';
import InputBox from './InputBox';
import ModelSelector from './ModelSelector';
import {
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  endStreaming,
  setError,
  addToast,
  setMessages,
} from '../store/store';
import { sendMessageStream, generateConversationTitle } from '../services/api';

const ChatMain = () => {
  const dispatch = useDispatch();
  const { currentConversationId, messages, isStreaming, isLoading, thinkingEnabled, modelProvider } = useSelector(
    (state) => state.chat
  );
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (message) => {
    if (!currentConversationId) {
      dispatch(addToast({
        type: 'error',
        message: '请先选择或创建一个对话',
        duration: 3000,
      }));
      return;
    }

    // 检查是否是第一条消息(用于生成标题)
    const isFirstMessage = messages.length === 0;

    // 添加用户消息
    dispatch(addUserMessage(message));

    // 开始流式响应
    dispatch(startStreaming());

    // 调用 API
    sendMessageStream(
      currentConversationId,
      message,
      thinkingEnabled,
      modelProvider,
      // onThinking - 思考过程
      (thinking) => {
        dispatch(appendStreamingThinking(thinking));
      },
      // onChunk - 回答内容
      (content) => {
        dispatch(appendStreamingContent(content));
      },
      // onDone
      async () => {
        dispatch(endStreaming());
        
        // 如果是第一条消息,生成标题
        if (isFirstMessage) {
          try {
            await generateConversationTitle(currentConversationId, message);
            // 标题生成成功,刷新会话列表以更新标题
            // 这里可以触发会话列表重新加载,或者通过 Redux 更新
          } catch (error) {
            console.error('生成标题失败:', error);
          }
        }
      },
      // onError
      (error) => {
        dispatch(endStreaming());
        dispatch(addToast({
          type: 'error',
          message: `发送失败: ${error}`,
          duration: 4000,
        }));
      }
    );
  };
  
  // 重新生成回答
  const handleRegenerate = (messageIndex) => {
    if (!currentConversationId || isStreaming) return;

    // 找到前一条用户消息
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }
    
    if (userMessageIndex < 0) {
      dispatch(addToast({
        type: 'error',
        message: '未找到对应的用户消息',
        duration: 3000,
      }));
      return;
    }
    
    const userMessage = messages[userMessageIndex].content;

    // 关键：从“该用户消息”开始分叉，清空其后的所有消息（包含当前这条 AI 回复及更后面的对话）
    const truncatedMessages = messages.slice(0, userMessageIndex + 1);
    dispatch(setMessages(truncatedMessages));

    // 在截断位置开始重新生成（会在该用户消息之后追加新的 assistant 流式消息）
    dispatch(startStreaming());
    
    sendMessageStream(
      currentConversationId,
      userMessage,
      thinkingEnabled,
      modelProvider,
      (thinking) => dispatch(appendStreamingThinking(thinking)),
      (content) => dispatch(appendStreamingContent(content)),
      () => dispatch(endStreaming()),
      (error) => {
        dispatch(endStreaming());
        dispatch(addToast({
          type: 'error',
          message: `重新生成失败: ${error}`,
          duration: 4000,
        }));
      }
    );
  };
  
  // 编辑消息
  const handleEditMessage = (messageIndex, newContent) => {
    if (!currentConversationId || isStreaming) return;

    // 关键：将编辑后的消息写回，并清空其后的所有消息（因为对话已分叉）
    const truncatedMessages = messages
      .slice(0, messageIndex + 1)
      .map((msg, idx) => (idx === messageIndex ? { ...msg, content: newContent } : msg));
    dispatch(setMessages(truncatedMessages));

    // 在编辑后的消息位置继续生成新的 assistant 回复
    dispatch(startStreaming());
    
    sendMessageStream(
      currentConversationId,
      newContent,
      thinkingEnabled,
      modelProvider,
      (thinking) => dispatch(appendStreamingThinking(thinking)),
      (content) => dispatch(appendStreamingContent(content)),
      () => dispatch(endStreaming()),
      (error) => {
        dispatch(endStreaming());
        dispatch(addToast({
          type: 'error',
          message: `重新发送失败: ${error}`,
          duration: 4000,
        }));
      }
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-white to-mint-50/30">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto">
          {/* 空状态 */}
          {!currentConversationId ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-20"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mint-100 to-sky-fresh-100 flex items-center justify-center mb-6">
                <MessageCircle size={48} className="text-mint-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Era of AI Agent
              </h2>
              <p className="text-gray-500 max-w-md">
                选择左侧的对话，或创建一个新对话开始聊天
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-mint-100">
                  <h3 className="font-medium text-gray-800 mb-2">💬 智能对话</h3>
                  <p className="text-sm text-gray-600">自然流畅的对话体验</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-mint-100">
                  <h3 className="font-medium text-gray-800 mb-2">🧠 深度思考</h3>
                  <p className="text-sm text-gray-600">开启 thinking 模式</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-mint-100">
                  <h3 className="font-medium text-gray-800 mb-2">📝 Markdown</h3>
                  <p className="text-sm text-gray-600">支持富文本渲染</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-mint-100">
                  <h3 className="font-medium text-gray-800 mb-2">💾 历史记录</h3>
                  <p className="text-sm text-gray-600">自动保存对话内容</p>
                </div>
              </div>
            </motion.div>
          ) : isLoading ? (
            // 加载状态
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-mint-400" size={48} />
            </div>
          ) : messages.length === 0 ? (
            // 新对话空状态
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-mint-100 to-sky-fresh-100 flex items-center justify-center mb-4 mx-auto">
                <MessageCircle size={40} className="text-mint-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">开始新对话</h3>
              <p className="text-gray-500">在下方输入框中输入您的问题</p>
            </motion.div>
          ) : (
            // 消息列表
            <>
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  messageIndex={index}
                  isStreaming={message.isStreaming}
                  onRegenerate={handleRegenerate}
                  onEdit={handleEditMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* 输入区（模型选择器放在输入框上方） */}
      <div className="px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {currentConversationId && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">模型</div>
              <ModelSelector />
            </div>
          )}
          <InputBox onSend={handleSendMessage} disabled={isStreaming} />
        </div>
      </div>
    </div>
  );
};

export default ChatMain;

