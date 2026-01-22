/**
 * Chat 页面主聊天界面组件 - 使用 CSS Modules 和主题系统
 * 展示消息列表、处理流式响应、管理交互
 */
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MessageCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatBubble from '../ChatBubble/ChatBubble';
import { useTheme } from '../../shared/ThemeProvider';
import { cn } from '../../../styles/utils.js';
import {
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  endStreaming,
  addToast,
  setMessages,
} from '../../../store/store';
import { sendMessageStream, generateConversationTitle } from '../../../services/api';
import styles from './ChatArea.module.css';

const ChatArea = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
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
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
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

    const userMessage = messages[userMessageIndex].content;
    const truncatedMessages = messages.slice(0, userMessageIndex + 1);
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

    const truncatedMessages = messages
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
    <div className={styles.container}>
      {/* 装饰性网格线 */}
      <div className={styles.gridBackground} />

      {/* 聊天内容区 */}
      <div className={styles.contentArea}>
        <div className={styles.contentWrapper}>
          {!currentConversationId ? (
            // 未选择对话
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.emptyState}
            >
              <div className={styles.emptyIcon}>
                <MessageCircle size={48} className={styles.emptyIconSvg} />
              </div>
              <h2 className={styles.emptyTitle}>欢迎使用 SYNTH AI</h2>
              <p className={styles.emptyDescription}>选择左侧的对话，或创建一个新对话开始聊天</p>
              <div className={styles.featureGrid}>
                {[
                  { icon: '💬', title: '智能对话', desc: '自然流畅的对话体验' },
                  { icon: '🧠', title: '深度思考', desc: '开启 thinking 模式' },
                  { icon: '📝', title: 'Markdown', desc: '支持富文本渲染' },
                  { icon: '💾', title: '历史记录', desc: '自动保存对话内容' },
                ].map((item, i) => (
                  <div key={i} className={styles.featureCard}>
                    <h3 className={styles.featureIcon}>{item.icon}</h3>
                    <p className={styles.featureTitle}>{item.title}</p>
                    <p className={styles.featureDesc}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : isLoading ? (
            // 加载状态
            <div className={styles.loadingState}>
              <Loader className={styles.loader} size={48} />
            </div>
          ) : messages.length === 0 ? (
            // 新对话
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.newConversationState}
            >
              <div className={styles.newConversationIcon}>
                <MessageCircle size={40} className={styles.newConversationIconSvg} />
              </div>
              <h3 className={styles.newConversationTitle}>开始新对话</h3>
              <p className={styles.newConversationDescription}>在下方输入框中输入您的问题</p>
            </motion.div>
          ) : (
            // 消息列表
            <>
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                  messageIndex={index}
                  isStreaming={message.isStreaming}
                  onRegenerate={handleRegenerate}
                  onEdit={handleEditMessage}
                />
              ))}
              
              {/* Loading / Totem State */}
              {isStreaming && (
                <div className="flex justify-center py-10">
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    {/* The Totem (Spinning Top) Visual */}
                    <svg viewBox="0 0 24 24" className="w-8 h-8 text-amber-500/80 animate-totem drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                      <path fill="currentColor" d="M12 2L2 19h20L12 2zm0 3l6 14H6l6-14z" />
                      <circle cx="12" cy="12" r="2" className="fill-white" />
                    </svg>
                    <div className="absolute -bottom-4 text-[10px] font-tech text-amber-500/50 tracking-widest animate-pulse">
                      CALIBRATING REALITY...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
