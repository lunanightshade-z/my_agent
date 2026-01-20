/**
 * 主应用布局组件
 * Chat 页面保留原本的 SYNTH AI 样式
 * 非 Chat 页面渲染 children，并显示魔法导航栏
 */
import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Sparkles, Maximize2, Code, FileText, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../styles/utils.js';
import ParticleBackground from '../ui/ParticleBackground.jsx';
import ChatArea from '../composite/ChatArea.jsx';
import InputContainer from '../composite/InputContainer.jsx';
import Button from '../ui/Button.jsx';
import ChatHistory from '../ChatHistory.jsx';
import MagicNavbar from '../MagicNavbar.jsx';
import {
  addUserMessage,
  startStreaming,
  appendStreamingThinking,
  appendStreamingContent,
  endStreaming,
  addToast,
  setConversations,
  setCurrentConversation,
} from '../../store/store';
import {
  createConversation,
  getConversations,
  generateConversationTitle,
  sendMessageStream,
} from '../../services/api';

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const showMagicNavbar = !isChatPage;

  // 所有hooks必须在条件返回之前调用
  const { thinkingEnabled, currentConversationId, messages, isStreaming } = useSelector(
    (state) => state.chat
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeArtifact] = useState(null);
  const containerRef = useRef(null);

  // 非 Chat 页面直接渲染 children（Home / Agent）
  if (!isChatPage) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {showMagicNavbar && <MagicNavbar />}
        <div className={showMagicNavbar ? 'pt-24' : ''}>
          {children}
        </div>
      </div>
    );
  }

  // Chat 页面：使用原本的 SYNTH AI 布局样式

  // 视差鼠标跟踪（带防抖和优化）
  useEffect(() => {
    let throttleTimer;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      if (throttleTimer) return;

      throttleTimer = setTimeout(() => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX - innerWidth / 2) / innerWidth;
        const y = (e.clientY - innerHeight / 2) / innerHeight;

        const dx = Math.abs(x - lastX);
        const dy = Math.abs(y - lastY);

        if (dx > 0.01 || dy > 0.01) {
          lastX = x;
          lastY = y;
          setMousePos({ x, y });
        }

        throttleTimer = null;
      }, 16);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, []);

  const tiltStyle = {
    transform: `perspective(1000px) rotateY(${mousePos.x * 0.5}deg) rotateX(${mousePos.y * -0.5}deg)`,
    willChange: 'transform',
    transition: 'transform 0.1s ease-out',
  };

  // 发送消息（让 InputContainer 真正触发 API 请求）
  const handleSendMessage = async (message) => {
    let conversationId = currentConversationId;

    if (!conversationId) {
      try {
        const newConv = await createConversation();
        conversationId = newConv.id;
        dispatch(setCurrentConversation(conversationId));
        const updatedConvs = await getConversations();
        dispatch(setConversations(updatedConvs));
      } catch (error) {
        dispatch(
          addToast({
            type: 'error',
            message: `创建对话失败: ${error?.message || error}`,
            duration: 3000,
          })
        );
        return;
      }
    }

    const isFirstMessage = (messages || []).length === 0;
    dispatch(addUserMessage(message));
    dispatch(startStreaming());

    sendMessageStream(
      conversationId,
      message,
      thinkingEnabled,
      (thinking) => dispatch(appendStreamingThinking(thinking)),
      (content) => dispatch(appendStreamingContent(content)),
      async () => {
        dispatch(endStreaming());
        if (isFirstMessage) {
          try {
            await generateConversationTitle(conversationId, message);
            const updatedConvs = await getConversations();
            dispatch(setConversations(updatedConvs));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('生成标题失败:', e);
          }
        } else {
          try {
            const updatedConvs = await getConversations();
            dispatch(setConversations(updatedConvs));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('刷新会话列表失败:', e);
          }
        }
      },
      (err) => {
        dispatch(endStreaming());
        dispatch(
          addToast({
            type: 'error',
            message: `发送失败: ${err}`,
            duration: 4000,
          })
        );
      }
    );
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black text-slate-200 font-sans selection:bg-elite-gold/30"
      ref={containerRef}
    >
      {/* 背景层 */}
      <div
        className={cn(
          'absolute inset-0 transition-colors duration-1000',
          thinkingEnabled ? 'bg-[#0a0510]' : 'bg-[#0f0f0f]'
        )}
      >
        {/* 径向渐变光源 */}
        <div
          className="absolute w-[900px] h-[900px] rounded-full blur-[150px] opacity-15 transition-all duration-1000"
          style={{
            background: thinkingEnabled
              ? 'radial-gradient(circle, #ffd700, #4b0082)'
              : 'radial-gradient(circle, #d4af37, #b87333)',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)`,
          }}
        />
      </div>

      {/* 粒子背景 */}
      <ParticleBackground
        isDeepThinking={thinkingEnabled}
        intensity="medium"
        className="opacity-70"
      />

      {/* 主容器 */}
      <div
        className="relative z-10 flex w-full h-full p-6 gap-6 transition-transform duration-100 ease-out"
        style={tiltStyle}
      >
        {/* 左侧: 会话历史 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:flex flex-col w-72"
        >
          <ChatHistory />
        </motion.div>

        {/* 中间: 主聊天界面 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* 顶部条 */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-lg transition-all duration-500',
                  thinkingEnabled ? 'bg-elite-gold/20 text-elite-gold' : 'bg-elite-gold/20 text-elite-gold'
                )}
              >
                <Box size={20} />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-wider">
                  SYNTH <span className="font-thin opacity-50">AI</span>
                </h1>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full animate-pulse',
                      thinkingEnabled ? 'bg-elite-gold' : 'bg-green-500'
                    )}
                  />
                  <span className="text-[10px] uppercase tracking-widest opacity-60">
                    {thinkingEnabled ? 'Deep Processing Active' : 'Systems Nominal'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 返回首页按钮 */}
            <motion.button
              className="p-2 rounded-lg text-gray-400 hover:text-elite-gold hover:bg-elite-gold/10 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              title="返回首页"
            >
              <Home className="w-5 h-5" />
            </motion.button>
          </header>

          {/* 聊天区域 */}
          <ChatArea />

          {/* 输入框 */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent border-t border-white/5">
            <InputContainer
              onSend={handleSendMessage}
              disabled={isStreaming}
            />
          </div>
        </motion.div>

        {/* 右侧: Artifact 面板 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className={cn(
            'hidden xl:flex flex-col w-80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500',
            activeArtifact ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50 grayscale',
            thinkingEnabled ? 'bg-elite-gold/5' : 'bg-elite-gold/5'
          )}
        >
          {/* 头部 */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-elite-gold" />
              <span className="text-sm font-bold tracking-widest uppercase">Artifact</span>
            </div>
            <Maximize2 size={14} className="opacity-50 hover:opacity-100 cursor-pointer" />
          </div>

          {/* 内容区 */}
          <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative">
            {!activeArtifact ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-30">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                  <Box size={48} className="mb-4" />
                </motion.div>
                <p className="text-sm">Waiting for output...</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {activeArtifact.type === 'code' ? (
                    <Code size={16} className="text-elite-rose" />
                  ) : (
                    <FileText size={16} className="text-elite-champagne" />
                  )}
                  <span className="text-xs font-mono text-elite-rose bg-elite-rose/10 px-2 py-0.5 rounded">
                    {activeArtifact.title}
                  </span>
                </div>
                <div className="bg-black/40 rounded-lg p-4 font-mono text-xs border border-white/5 text-gray-300 overflow-x-auto max-h-96">
                  <pre className="whitespace-pre-wrap break-words">{activeArtifact.content}</pre>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full rounded-full bg-elite-gold"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-50">
                    <span>Stability: 98%</span>
                    <span>Complexity: High</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="p-5 border-t border-white/5">
            <Button
              fullWidth
              variant={thinkingEnabled ? 'secondary' : 'ghost'}
              className={cn(
                'text-xs uppercase tracking-wider font-semibold',
                thinkingEnabled
                  ? 'bg-elite-gold/10 text-elite-gold border border-elite-gold/30 hover:bg-elite-gold/20'
                  : 'bg-elite-gold/10 text-elite-gold border border-elite-gold/30 hover:bg-elite-gold/20'
              )}
            >
              Export Artifact
            </Button>
          </div>
        </motion.div>
      </div>

      {/* 全局样式定义 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
