/**
 * 主聊天界面组件 - 赛博朋克风格
 * 展示消息列表、处理流式响应、管理交互
 */
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatBubble from './ChatBubble.jsx';
import { cn } from '../../styles/utils.js';
import { colors } from '../../styles/tokens.js';
import {
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  endStreaming,
  addToast,
  setMessages,
} from '../../store/store';
import { sendMessageStream, generateConversationTitle } from '../../services/api';

const ChatArea= () => {
  const dispatch = useDispatch();
  const { currentConversationId, messages, isStreaming, isLoading, thinkingEnabled } = useSelector(
    state => state.chat
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
      dispatch(
        addToast({
          type: 'error',
          message: '请先选择或创建一个对话',
          duration: 3000,
        })
      );
      return;
    }

    const isFirstMessage = messages.length === 0;
    dispatch(addUserMessage(message));
    dispatch(startStreaming());

    sendMessageStream(
      currentConversationId,
      message,
      thinkingEnabled,
      (thinking) => {
        dispatch(appendStreamingThinking(thinking));
      },
      (content) => {
        dispatch(appendStreamingContent(content));
      },
      async () => {
        dispatch(endStreaming());

        if (isFirstMessage) {
          try {
            await generateConversationTitle(currentConversationId, message);
          } catch (error) {
            console.error('生成标题失败:', error);
          }
        }
      },
      (error) => {
        dispatch(endStreaming());
        dispatch(
          addToast({
            type: 'error',
            message: `发送失败: ${error}`,
            duration: 4000,
          })
        );
      }
    );
  };

  // 重新生成回答
  const handleRegenerate = (messageIndex) => {
    if (!currentConversationId || isStreaming) return;

    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && (messages)[userMessageIndex].role !== 'user') {
      userMessageIndex--;
    }

    if (userMessageIndex < 0) {
      dispatch(
        addToast({
          type: 'error',
          message: '未找到对应的用户消息',
          duration: 3000,
        })
      );
      return;
    }

    const userMessage = (messages)[userMessageIndex].content;
    const truncatedMessages = (messages).slice(0, userMessageIndex + 1);
    dispatch(setMessages(truncatedMessages));
    dispatch(startStreaming());

    sendMessageStream(
      currentConversationId,
      userMessage,
      thinkingEnabled,
      (thinking) => dispatch(appendStreamingThinking(thinking)),
      (content) => dispatch(appendStreamingContent(content)),
      () => dispatch(endStreaming()),
      (error) => {
        dispatch(endStreaming());
        dispatch(
          addToast({
            type: 'error',
            message: `重新生成失败: ${error}`,
            duration: 4000,
          })
        );
      }
    );
  };

  // 编辑消息
  const handleEditMessage = (messageIndex, newContent) => {
    if (!currentConversationId || isStreaming) return;

    const truncatedMessages = (messages)
      .slice(0, messageIndex + 1)
      .map((msg, idx) => (idx === messageIndex ? { ...msg, content: newContent } : msg));
    dispatch(setMessages(truncatedMessages));
    dispatch(startStreaming());

    sendMessageStream(
      currentConversationId,
      newContent,
      thinkingEnabled,
      (thinking) => dispatch(appendStreamingThinking(thinking)),
      (content) => dispatch(appendStreamingContent(content)),
      () => dispatch(endStreaming()),
      (error) => {
        dispatch(endStreaming());
        dispatch(
          addToast({
            type: 'error',
            message: `重新发送失败: ${error}`,
            duration: 4000,
          })
        );
      }
    );
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* 装饰性网格线 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 聊天内容区 */}
      <div className="flex-1 overflow-y-auto px-6 py-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {!currentConversationId ? (
            // 未选择对话
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center py-20"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-elite-gold/20 to-elite-copper/20 flex items-center justify-center mb-6 border border-elite-gold/30">
                <MessageCircle size={48} className="text-elite-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">欢迎使用 SYNTH AI</h2>
              <p className="text-gray-400 max-w-md">选择左侧的对话，或创建一个新对话开始聊天</p>
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-lg">
                {[
                  { icon: '💬', title: '智能对话', desc: '自然流畅的对话体验' },
                  { icon: '🧠', title: '深度思考', desc: '开启 thinking 模式' },
                  { icon: '📝', title: 'Markdown', desc: '支持富文本渲染' },
                  { icon: '💾', title: '历史记录', desc: '自动保存对话内容' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/8 border border-elite-gold/20 rounded-xl p-4 hover:border-elite-gold/50 transition-all"
                  >
                    <h3 className="font-medium text-white mb-1 text-lg">{item.icon}</h3>
                    <p className="font-medium text-white mb-1">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : isLoading ? (
            // 加载状态
            <div className="flex items-center justify-center py-20">
              <Loader className="animate-spin text-elite-gold" size={48} />
            </div>
          ) : (messages).length === 0 ? (
            // 新对话
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-elite-gold/20 to-elite-copper/20 flex items-center justify-center mb-4 mx-auto border border-elite-gold/30">
                <MessageCircle size={40} className="text-elite-gold" />
              </div>
              <h3 className="text-xl font-medium text-gray-100 mb-2">开始新对话</h3>
              <p className="text-gray-400">在下方输入框中输入您的问题</p>
            </motion.div>
          ) : (
            // 消息列表
            <>
              {(messages).map((message, index) => (
                <ChatBubble
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
    </div>
  );
};

export default ChatArea;
