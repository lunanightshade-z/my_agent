/**
 * Chat 页面 - 沉浸式对话界面
 * 升级后的液态玻璃设计 + 动态交互效果
 */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Settings, Loader, Brain, RotateCcw } from 'lucide-react';
import MessageBubble from '../components/MessageBubble';
import InputBox from '../components/InputBox';
import ChatHistory from '../components/ChatHistory';
import Toast from '../components/Toast';
import {
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  endStreaming,
  addToast,
  setMessages,
} from '../store/store';
import { sendMessageStream, generateConversationTitle } from '../services/api';

const Chat = () => {
  const dispatch = useDispatch();
  const { currentConversationId, messages, isStreaming, thinkingEnabled } = useSelector(
    (state) => state.chat
  );
  const messagesEndRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);

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
        dispatch(addToast({
          type: 'error',
          message: `重新生成失败: ${error}`,
          duration: 4000,
        }));
      }
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex bg-transparent">
      {/* 左侧历史面板 */}
      <motion.div
        className="hidden lg:flex w-72 h-full mr-4"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChatHistory />
      </motion.div>

      {/* 右侧主聊天区域 */}
      <motion.div
        className="flex-1 h-full flex flex-col glass-lg rounded-3xl shadow-glass-lg overflow-hidden"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 聊天顶部栏 */}
        <motion.div
          className="flex items-center justify-between px-6 py-4 border-b border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aurora-300 via-fresh-sky-400 to-lavender-400 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">Chat Assistant</h2>
              <p className="text-xs text-text-tertiary">Online</p>
            </div>
          </div>

          {/* 右侧工具按钮 */}
          <div className="flex items-center gap-2">
            <motion.button
              className="btn-icon text-text-secondary hover:text-aurora-300 hover:bg-aurora-300/10"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="btn-icon text-text-secondary hover:text-fresh-sky-400 hover:bg-fresh-sky-400/10"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* 消息区域 */}
        <motion.div
          className="flex-1 overflow-y-auto px-6 py-6 space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {messages.length === 0 ? (
            <motion.div
              className="h-full flex flex-col items-center justify-center text-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-aurora-300/20 via-fresh-sky-400/20 to-lavender-400/20 flex items-center justify-center">
                <Brain className="w-10 h-10 text-aurora-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  开始对话
                </h3>
                <p className="text-text-secondary">
                  提出您的问题，让我帮助您。
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                variants={messageVariants}
              >
                <MessageBubble
                  message={message}
                  index={index}
                  onRegenerate={handleRegenerate}
                />
              </motion.div>
            ))
          )}

          {isStreaming && (
            <motion.div
              className="flex items-center gap-2 text-text-secondary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI 正在思考...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </motion.div>

        {/* 输入区域 */}
        <motion.div
          className="px-6 py-4 border-t border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Thinking 开关 */}
          <motion.div
            className="mb-4 flex items-center gap-3 px-4 py-2 rounded-lg bg-white/20"
            whileHover={{ scale: 1.02 }}
          >
            <Brain className="w-4 h-4 text-lavender-400" />
            <label className="flex-1 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={thinkingEnabled}
                onChange={() => {
                  // 这里应该调用 toggleThinking action
                }}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-text-secondary">
                启用深度思考 (可能更慢但更准确)
              </span>
            </label>
          </motion.div>

          <InputBox onSend={handleSendMessage} disabled={isStreaming} />
        </motion.div>
      </motion.div>

      {/* Toast 通知 */}
      <Toast />
    </div>
  );
};

export default Chat;
