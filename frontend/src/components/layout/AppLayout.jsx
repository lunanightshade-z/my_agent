/**
 * 主应用布局组件
 * Chat 页面保留原本的 SYNTH AI 样式
 */
import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Sparkles, Maximize2, Code, FileText, Home, ChevronLeft, ChevronRight, Zap, Layers, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../styles/utils.js';
import ParticleBackground from '../ui/ParticleBackground.jsx';
import ChatArea from '../chat/ChatArea/ChatArea.jsx';
import InputContainer from '../chat/InputContainer/InputContainer.jsx';
import { ThemeProvider } from '../shared/ThemeProvider';
import { chatTheme } from '../../styles/themes';
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
  const [activeArtifact] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isArtifactOpen, setArtifactOpen] = useState(true);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Dream Engine - 背景粒子动画（参考样式）
  useEffect(() => {
    if (!isChatPage) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Resize
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particles representing "Dream Dust"
    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * 0.02
    }));

    const draw = () => {
      // Trail effect for "Liquid Time" feel
      ctx.fillStyle = 'rgba(10, 12, 16, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(Date.now() * 0.001) * p.pulse;

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Golden embers color
        ctx.fillStyle = `rgba(196, 164, 132, ${Math.abs(p.opacity)})`; 
        ctx.fill();
      });

      // Draw faint grid lines to represent "The Architect's Grid"
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 150;
      const timeOffset = Date.now() * 0.01;
      
      // Horizontal bending lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        // Bezier curve to simulate folding reality
        ctx.bezierCurveTo(
          canvas.width / 3, y + Math.sin(timeOffset * 0.05 + y) * 50,
          canvas.width / 3 * 2, y - Math.sin(timeOffset * 0.05 + y) * 50,
          canvas.width, y
        );
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isChatPage]);

  // 非 Chat 页面直接渲染 children（Home / Agent）
  // Agent页面自己管理返回首页按钮，不需要导航栏
  if (!isChatPage) {
    const isAgentPage = location.pathname === '/agent';
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        {!isAgentPage && showMagicNavbar && <MagicNavbar />}
        <div className={!isAgentPage && showMagicNavbar ? 'pt-24' : ''}>
          {children}
        </div>
      </div>
    );
  }

  // 发送消息（让 InputContainer 真正触发 API 请求）
  const handleSendMessage = async (message) => {
    let conversationId = currentConversationId;

    if (!conversationId) {
      try {
        const newConv = await createConversation('新对话', 'chat');
        conversationId = newConv.id;
        dispatch(setCurrentConversation(conversationId));
        const updatedConvs = await getConversations('chat');
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
            const updatedConvs = await getConversations('chat');
            dispatch(setConversations(updatedConvs));
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('生成标题失败:', e);
          }
        } else {
          try {
            const updatedConvs = await getConversations('chat');
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
    <ThemeProvider theme={chatTheme}>
      <div
        className="relative w-full h-screen overflow-hidden bg-[#0a0c10] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-100"
        ref={containerRef}
      >
        {/* 外部样式和字体 */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@300;500;600;700&display=swap');
          
          .font-cinematic { font-family: 'Cinzel', serif; }
          .font-tech { font-family: 'Rajdhani', sans-serif; }
          
          /* Glassmorphism & Liquid Effects */
          .glass-panel {
            background: rgba(20, 25, 35, 0.4);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
          }
          
          .glass-input {
            background: rgba(10, 12, 16, 0.7);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(196, 164, 132, 0.2);
            box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
          }

          /* 3D Tilt Effect on Hover */
          .perspective-container {
            perspective: 1000px;
          }
          .tilt-card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          .tilt-card:hover {
            transform: translateY(-2px) rotateX(1deg);
            box-shadow: 0 12px 40px rgba(196, 164, 132, 0.1);
            border-color: rgba(196, 164, 132, 0.3);
          }

          /* Totem Spinner Animation */
          @keyframes spin-wobble {
            0% { transform: rotate(0deg) rotateX(10deg); }
            50% { transform: rotate(180deg) rotateX(-10deg); }
            100% { transform: rotate(360deg) rotateX(10deg); }
          }
          .animate-totem {
            animation: spin-wobble 3s linear infinite;
          }

          /* Scrollbar hiding */
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        {/* 背景Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />

        {/* 噪声叠加层 (Film Grain) */}
        <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>

        {/* 主布局网格 */}
        <div className="relative z-10 flex w-full h-full p-4 gap-4 perspective-container overflow-hidden">
        
        {/* === 左侧: HISTORY / MNEMOSYNE === */}
        <div className={`
          flex-shrink-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isSidebarOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10'}
          glass-panel rounded-2xl overflow-hidden hidden lg:flex
        `}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-cinematic text-amber-500/80 font-bold tracking-widest text-sm">ARCHIVES</h2>
            <Layers size={14} className="text-white/40" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            <ChatHistory />
          </div>
          {/* User Profile / Stats */}
          <div className="p-4 bg-black/20 mt-auto border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-slate-800 border border-amber-500/30 flex items-center justify-center">
                <span className="font-cinematic text-xs font-bold">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-cinematic text-slate-200">Architect</span>
                <span className="text-[10px] font-tech text-slate-500">Sync: 98%</span>
              </div>
            </div>
          </div>
        </div>

        {/* === 中间: THE LIMBO / CHAT === */}
        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel border-opacity-50 transition-all duration-500">
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a0c10]/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="pointer-events-auto p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors hidden lg:block">
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            <h1 className="font-cinematic text-2xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-amber-100 to-slate-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              CONSTRUCT
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setArtifactOpen(!isArtifactOpen)} className="pointer-events-auto p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors hidden xl:block">
                {isArtifactOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
              <motion.button
                className="pointer-events-auto p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/')}
                title="返回首页"
              >
                <Home size={18} />
              </motion.button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 pt-20 pb-40 space-y-8 no-scrollbar scroll-smooth">
            <ChatArea />
          </div>

          {/* --- INPUT ZONE (Sticky Bottom) --- */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
            <InputContainer
              onSend={handleSendMessage}
              disabled={isStreaming}
            />
          </div>
        </div>

        {/* === 右侧: ARTIFACTS / TOTEM ROOM === */}
        <div className={`
          flex-shrink-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isArtifactOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}
          glass-panel rounded-2xl ml-4 overflow-hidden border-l border-amber-500/10 hidden xl:flex
        `}>
          <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-cinematic text-amber-500/80 font-bold tracking-widest text-sm">CONSTRUCTS</h2>
            <div className="flex gap-2">
              <RotateCcw size={14} className="text-white/40 cursor-pointer hover:text-white" />
              <Maximize2 size={14} className="text-white/40 cursor-pointer hover:text-white" />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
             {/* Artifact Tabs */}
             <div className="flex overflow-x-auto border-b border-white/5 no-scrollbar">
               <div className="px-4 py-3 text-xs font-tech cursor-pointer whitespace-nowrap transition-colors border-b-2 text-amber-100 border-amber-500 bg-white/5">
                 Artifact_01.tsx
               </div>
             </div>

             {/* Artifact Content (Code/Preview) */}
             <div className="flex-1 p-4 bg-[#0d1117] font-mono text-xs text-green-400/80 overflow-auto relative">
               {/* Decorative grid overlay for the artifact area */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
               
               <pre className="relative z-10 leading-loose">
                 <code>
                   {activeArtifact ? activeArtifact.content : '// No data loaded...'}
                 </code>
               </pre>

               {/* Floating holographic element */}
               <div className="absolute bottom-4 right-4 animate-pulse opacity-50">
                  <Box size={24} className="text-amber-500" />
               </div>
             </div>
          </div>
          
          {/* Artifact Footer */}
          <div className="p-3 border-t border-white/5 bg-black/40 flex justify-between items-center text-[10px] text-slate-500 font-tech">
             <span>MEM: 14TB</span>
             <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> LIVE PREVIEW</span>
          </div>
        </div>
      </div>

      </div>
    </ThemeProvider>
  );
};

export default AppLayout;
