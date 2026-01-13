/**
 * Chat 页面 - 沉浸式对话界面
 * 升级后的液态玻璃设计 + 动态交互效果
 */
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Settings, Loader, Brain, RotateCcw, Home } from 'lucide-react';
import MessageBubble from '../components/MessageBubble';
import InputBox from '../components/InputBox';
import ChatHistory from '../components/ChatHistory';
import ContextPanel from '../components/ContextPanel';
import Toast from '../components/Toast';
import {
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  endStreaming,
  addToast,
  setMessages,
  setConversations,
  setCurrentConversation,
  toggleThinking,
} from '../store/store';
import { sendMessageStream, generateConversationTitle, getConversations, createConversation } from '../services/api';

const Chat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    let conversationId = currentConversationId;
    
    // 如果没有当前对话，自动创建一个
    if (!conversationId) {
      try {
        const newConv = await createConversation();
        conversationId = newConv.id;
        dispatch(setCurrentConversation(conversationId));
        // 刷新对话列表
        const updatedConvs = await getConversations();
        dispatch(setConversations(updatedConvs));
      } catch (error) {
        dispatch(addToast({
          type: 'error',
          message: `创建对话失败: ${error.message || error}`,
          duration: 3000,
        }));
        return;
      }
    }

    const isFirstMessage = messages.length === 0;
    dispatch(addUserMessage(message));
    dispatch(startStreaming());

    sendMessageStream(
      conversationId,
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
            await generateConversationTitle(conversationId, message);
            // 刷新会话列表以显示新标题
            const updatedConvs = await getConversations();
            dispatch(setConversations(updatedConvs));
          } catch (error) {
            console.error('生成标题失败:', error);
          }
        } else {
          // 即使不是第一条消息，也刷新会话列表以更新更新时间
          try {
            const updatedConvs = await getConversations();
            dispatch(setConversations(updatedConvs));
          } catch (error) {
            console.error('刷新会话列表失败:', error);
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
    <div className="h-[calc(100vh-6rem)] flex bg-transparent relative gap-0">
      {/* 动态背景效果 */}
      <div className="fixed inset-0 z-0 bg-[#050509] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-elite-gold/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] bg-elite-copper/10 rounded-full blur-[100px] animate-pulse-slower" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-elite-champagne/10 rounded-full blur-[80px]" />
      </div>

      {/* 左侧历史面板 */}
      <motion.div
        className="hidden lg:flex w-72 h-full relative z-10"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ChatHistory />
      </motion.div>

      {/* 右侧主聊天区域 */}
      <motion.div
        className="flex-1 h-full flex flex-col rounded-l-3xl overflow-hidden relative z-10"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0 1.5rem 1.5rem 0'
        }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 聊天顶部栏 */}
        <motion.div
          className="flex items-center justify-between px-6 py-4 border-b border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-elite-gold via-elite-champagne to-elite-copper flex items-center justify-center">
              <Brain className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-200 tracking-wider">SYNTH ASSISTANT</h2>
              <p className="text-xs text-gray-500 font-mono">ONLINE // V.1.0</p>
            </div>
          </div>

          {/* 右侧工具按钮 */}
          <div className="flex items-center gap-2">
            <motion.button
              className="btn-icon text-gray-400 hover:text-elite-gold hover:bg-elite-gold/10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              title="返回首页"
            >
              <Home className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="btn-icon text-gray-400 hover:text-elite-gold hover:bg-elite-gold/10"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="btn-icon text-gray-400 hover:text-elite-champagne hover:bg-elite-champagne/10"
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
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
          }}
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
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-elite-gold/20 via-elite-champagne/20 to-elite-copper/20 flex items-center justify-center">
                <Brain className="w-10 h-10 text-elite-gold" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-200 mb-2 tracking-wide">
                  系统已就绪
                </h3>
                <p className="text-gray-500 font-mono text-sm">
                  神经连接稳定。等待指令输入...
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
              className="flex items-center gap-2 text-gray-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm font-mono">AI 正在处理...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </motion.div>

        {/* 输入区域 */}
        <motion.div
          className="px-6 py-4 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Thinking 开关 */}
          <motion.div
            className="mb-4 flex items-center gap-3 px-4 py-2 rounded-lg bg-white/5"
            whileHover={{ scale: 1.02 }}
          >
            <Brain className="w-4 h-4 text-elite-gold" />
            <label className="flex-1 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={thinkingEnabled}
                onChange={() => dispatch(toggleThinking())}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-400 font-mono">
                启用深度思考 (可能更慢但更准确)
              </span>
            </label>
          </motion.div>

          <InputBox onSend={handleSendMessage} disabled={isStreaming} />
        </motion.div>
      </motion.div>

      {/* 右侧上下文面板 */}
      <ContextPanel />

      {/* Toast 通知 */}
      <Toast />
    </div>
  );
};

export default Chat;
