/**
 * Agent 页面 - 魔法三栏布局
 * 左侧: 记忆回廊 (Memories)
 * 中间: 主舞台 (Chat Interface)
 * 右侧: 神器面板 (Grimoire/Artifacts)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Feather, 
  Scroll, 
  BrainCircuit, 
  History, 
  X, 
  Maximize2, 
  Wand2,
  Hourglass,
  Star,
  Plus,
  Home
} from 'lucide-react';
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
import { 
  sendMessageStream, 
  generateConversationTitle, 
  getConversations, 
  createConversation,
  getConversationMessages 
} from '../services/api';

// --- 粒子背景组件 ---
const MagicalParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-200/40 blur-[1px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, 50, -50, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// --- 主应用组件 ---
export default function Agent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    currentConversationId, 
    messages, 
    isStreaming, 
    thinkingEnabled,
    conversations 
  } = useSelector((state) => state.chat);

  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef(null);

  // 视差效果 Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  // 左侧面板视差
  const rotateXLeft = useTransform(mouseY, [-0.5, 0.5], [2, -2]);
  const rotateYLeft = useTransform(mouseX, [-0.5, 0.5], [-2, 2]);

  // 中间面板视差 (更稳定)
  const rotateXMid = useTransform(mouseY, [-0.5, 0.5], [1, -1]);
  const rotateYMid = useTransform(mouseX, [-0.5, 0.5], [-1, 1]);

  // 右侧面板视差
  const rotateXRight = useTransform(mouseY, [-0.5, 0.5], [2, -2]);
  const rotateYRight = useTransform(mouseX, [-0.5, 0.5], [-2, 2]);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载会话列表
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await getConversations();
        dispatch(setConversations(convs));
      } catch (error) {
        console.error('加载会话列表失败:', error);
      }
    };
    loadConversations();
  }, [dispatch]);

  // 加载选中会话的消息
  useEffect(() => {
    if (currentConversationId) {
      const loadMessages = async () => {
        try {
          const msgs = await getConversationMessages(currentConversationId);
          dispatch(setMessages(msgs));
        } catch (error) {
          console.error('加载消息失败:', error);
        }
      };
      loadMessages();
    }
  }, [currentConversationId, dispatch]);

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return;

    let conversationId = currentConversationId;
    
    if (!conversationId) {
      try {
        const newConv = await createConversation();
        conversationId = newConv.id;
        dispatch(setCurrentConversation(conversationId));
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

    const message = inputValue;
    const isFirstMessage = messages.length === 0;
    setInputValue('');
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
            const updatedConvs = await getConversations();
            dispatch(setConversations(updatedConvs));
          } catch (error) {
            console.error('生成标题失败:', error);
          }
        } else {
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

  // 切换会话
  const handleConversationClick = (convId) => {
    dispatch(setCurrentConversation(convId));
  };

  // 新建会话
  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation();
      dispatch(setCurrentConversation(newConv.id));
      dispatch(setMessages([]));
      const updatedConvs = await getConversations();
      dispatch(setConversations(updatedConvs));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: `创建对话失败: ${error.message || error}`,
        duration: 3000,
      }));
    }
  };

  return (
    <div 
      className="relative w-full h-[calc(100vh-6rem)] min-h-[calc(100vh-6rem)] bg-[#FDFBF7] text-[#2C3E50] overflow-hidden font-magic-body selection:bg-amber-200 selection:text-amber-900"
      onMouseMove={handleMouseMove}
    >
      <div className="bg-noise absolute inset-0 z-0 pointer-events-none mix-blend-multiply" />
      <MagicalParticles />

      {/* 顶部光辉装饰 */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white via-white/50 to-transparent z-10 pointer-events-none" />

      {/* 主布局容器 */}
      <div className="relative z-10 flex w-full h-full p-4 gap-4 perspective-1000">
        
        {/* --- 左侧：记忆回廊 (History) --- */}
        <motion.aside 
          style={{ rotateX: rotateXLeft, rotateY: rotateYLeft }}
          className="hidden md:flex flex-col w-64 h-full rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden transition-all duration-500 hover:bg-white/60"
        >
          <div className="p-6 border-b border-amber-900/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-600" />
              <h2 className="font-magic-title text-lg font-bold text-amber-900/80 tracking-widest">Memories</h2>
            </div>
            <button 
              onClick={handleNewConversation}
              className="p-1 rounded-lg hover:bg-amber-100/50 transition-colors"
              title="新建会话"
            >
              <Plus className="w-4 h-4 text-amber-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 magic-scrollbar">
            {conversations.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8">
                暂无历史会话
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.div 
                  key={conv.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    currentConversationId === conv.id
                      ? 'bg-white/70 border-amber-200'
                      : 'hover:bg-white/50 border-transparent hover:border-amber-200/50'
                  }`}
                  onClick={() => handleConversationClick(conv.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                  <h3 className="text-sm font-semibold text-slate-700 font-magic-title group-hover:text-amber-800 truncate">
                    {conv.title || '新对话'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {new Date(conv.updated_at).toLocaleString('zh-CN')}
                  </p>
                  {currentConversationId === conv.id && (
                    <Sparkles className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-400" />
                  )}
                </motion.div>
              ))
            )}
          </div>
          {/* 底部用户信息区域 */}
          <div className="p-4 bg-gradient-to-t from-white/40 to-transparent">
             <div className="flex items-center gap-3 p-2 rounded-xl bg-white/40 border border-white shadow-sm">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold font-magic-title">M</div>
                <div className="text-sm font-bold text-slate-600">Magus User</div>
             </div>
          </div>
        </motion.aside>

        {/* --- 中间：主舞台 (Chat Interface) --- */}
        <motion.main 
          style={{ rotateX: rotateXMid, rotateY: rotateYMid }}
          className="flex-1 flex flex-col h-full rounded-[2rem] bg-white/30 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden"
        >
          {/* 装饰性光晕 */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-200/30 rounded-full blur-3xl pointer-events-none mix-blend-overlay" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl pointer-events-none mix-blend-overlay" />

          {/* 顶部栏 - 返回首页按钮 */}
          <div className="relative z-20 flex items-center justify-end px-6 pt-4 pb-2">
            <motion.button
              className="p-2 rounded-full bg-white/50 backdrop-blur-md border border-amber-200/50 text-amber-700 hover:text-amber-800 hover:bg-white/70 transition-all shadow-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              title="返回首页"
            >
              <Home className="w-5 h-5" />
            </motion.button>
          </div>

          {/* 聊天内容区域 */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 scroll-smooth magic-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200/30 via-amber-300/30 to-amber-400/30 flex items-center justify-center">
                  <Wand2 className="w-10 h-10 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-800 mb-2 tracking-wide font-magic-title">
                    欢迎来到思维殿堂
                  </h3>
                  <p className="text-slate-500 font-magic-body text-sm">
                    今日你想探寻什么魔法知识？
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* 头像 */}
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg backdrop-blur-md border border-white/50
                      ${msg.role === 'assistant' ? 'bg-gradient-to-br from-indigo-100 to-white text-indigo-600' : 'bg-gradient-to-br from-amber-100 to-white text-amber-700'}`}>
                      {msg.role === 'assistant' ? <Wand2 size={18} /> : <Feather size={18} />}
                    </div>

                    {/* 消息气泡 - 液态玻璃效果 */}
                    <div className={`relative p-6 rounded-2xl border backdrop-blur-md shadow-sm
                      ${msg.role === 'assistant' 
                        ? 'bg-white/60 border-white/60 text-slate-700 rounded-tl-none' 
                        : 'bg-indigo-900/5 border-indigo-500/10 text-slate-800 rounded-tr-none'
                      }`}>
                      <div className="font-magic-title text-xs opacity-50 mb-2 uppercase tracking-wider">
                         {msg.role === 'assistant' ? 'The Oracle' : 'The Seeker'}
                      </div>
                      <div className="leading-relaxed text-base whitespace-pre-wrap">
                        {msg.content}
                      </div>
                      
                      {/* 深度思考显示 */}
                      {msg.thinking && (
                        <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-sm text-indigo-700 font-mono whitespace-pre-wrap">
                          <div className="font-bold mb-2 flex items-center gap-2">
                            <BrainCircuit size={14} />
                            思考过程:
                          </div>
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* --- 底部输入区域 (The Wand) --- */}
          <div className="relative bottom-0 left-6 right-6 z-20 p-6">
            <motion.div 
              className={`relative bg-white/70 backdrop-blur-xl rounded-[2rem] border transition-all duration-300 shadow-2xl
                ${inputFocused ? 'border-amber-400/50 shadow-amber-100/50 scale-[1.01]' : 'border-white/80 shadow-slate-200/50'}
              `}
              layout
            >
              <div className="flex items-end gap-2 p-3">
                
                {/* 附件上传 */}
                <button className="p-3 rounded-full hover:bg-slate-100/50 text-slate-500 hover:text-indigo-600 transition-colors">
                  <Paperclip size={20} />
                </button>

                {/* 输入框 */}
                <textarea 
                  className="flex-1 bg-transparent border-none outline-none resize-none p-3 max-h-32 text-slate-700 placeholder:text-slate-400 font-magic-body text-base"
                  placeholder="挥动你的羽毛笔..."
                  rows={1}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isStreaming}
                />

                {/* 功能区 */}
                <div className="flex items-center gap-2 pb-1">
                  
                  {/* 深度思考开关 */}
                  <div 
                    onClick={() => dispatch(toggleThinking())}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border
                      ${thinkingEnabled 
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-700' 
                        : 'bg-slate-100/50 border-transparent text-slate-400 hover:text-slate-600'}
                    `}
                  >
                    <BrainCircuit size={16} className={thinkingEnabled ? "animate-pulse" : ""} />
                    <span className="text-xs font-bold font-magic-title">Deep Think</span>
                  </div>

                  {/* 发送按钮 */}
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full text-white shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={isStreaming || !inputValue.trim()}
                  >
                    <Send size={20} fill="currentColor" />
                  </motion.button>
                </div>
              </div>
              
              {/* 装饰性底部线条 */}
              <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            </motion.div>
          </div>
        </motion.main>

        {/* --- 右侧：神器面板 (Artifacts) --- */}
        <motion.aside 
          style={{ rotateX: rotateXRight, rotateY: rotateYRight }}
          className="hidden lg:flex flex-col w-80 h-full rounded-3xl bg-[#FDFBF7]/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden"
        >
           {/* 书脊装饰 */}
           <div className="absolute left-0 top-4 bottom-4 w-1 bg-amber-900/10 rounded-r-full" />

          <div className="p-6 border-b border-amber-900/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-indigo-600" />
              <h2 className="font-magic-title text-lg font-bold text-slate-800 tracking-widest">Grimoire</h2>
            </div>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-red-400/50" />
               <div className="w-2 h-2 rounded-full bg-amber-400/50" />
               <div className="w-2 h-2 rounded-full bg-green-400/50" />
            </div>
          </div>

          <div className="flex-1 p-5 overflow-y-auto space-y-6 magic-scrollbar">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-magic-title mb-2">Current Manifestations</div>
            
            {/* 空白占位符，模拟未解锁的页面 */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-300 gap-2">
               <Hourglass size={24} className="animate-spin-slow" />
               <span className="text-xs font-magic-title">Awaiting Conjuration...</span>
            </div>
          </div>
        </motion.aside>

      </div>
    </div>
  );
}
