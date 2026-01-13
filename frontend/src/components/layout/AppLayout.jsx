/**
 * 主应用布局组件 - 赛博朋克设计
 * 三列布局: 历史记录 | 聊天区 | Artifact面板
 * 集成粒子背景和深度思考模式
 */
import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layers, Sparkles, MoreHorizontal, Box, Maximize2, Code, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../styles/utils.js';
import { colors } from '../../styles/tokens.js';
import ParticleBackground from '../ui/ParticleBackground.jsx';
import ChatArea from '../composite/ChatArea.jsx';
import InputContainer from '../composite/InputContainer.jsx';
import Button from '../ui/Button.jsx';

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { thinkingEnabled } = useSelector((state) => state.chat);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeArtifact, setActiveArtifact] = useState(null);
  const containerRef = useRef(null);

  // 视差鼠标跟踪
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / innerWidth;
      const y = (e.clientY - innerHeight / 2) / innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const tiltStyle = {
    transform: `perspective(1000px) rotateY(${mousePos.x * 1}deg) rotateX(${mousePos.y * -1}deg)`,
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
          className="hidden lg:flex flex-col w-72 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:bg-white/10 transition-all duration-300 group"
        >
          {/* 头部 */}
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-gradient-to-r from-white/5 to-transparent">
            <div className={cn(
              'p-2 rounded-lg transition-all',
              thinkingEnabled ? 'bg-elite-gold/20 text-elite-gold' : 'bg-elite-gold/20 text-elite-gold'
            )}>
              <Layers size={18} />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase opacity-70">Memory Log</span>
          </div>

          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {[1, 2, 3, 4, 5].map((item) => (
              <motion.div
                key={item}
                whileHover={{ x: 4 }}
                className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group/item border border-transparent hover:border-white/10"
              >
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                  <div
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all group-hover/item:shadow-[0_0_8px_currentColor]',
                      thinkingEnabled ? 'bg-elite-gold' : 'bg-elite-gold'
                    )}
                  />
                  <span>Session #{100 + item}</span>
                </div>
                <div className="text-sm truncate opacity-80 group-hover/item:opacity-100">
                  Project Aether Design...
                </div>
              </motion.div>
            ))}
          </div>

          {/* 底部操作 */}
          <div className="p-4 border-t border-white/5 bg-black/20">
            <button className="flex items-center gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity w-full hover:text-elite-gold">
              <MoreHorizontal size={14} />
              <span>Archive</span>
            </button>
          </div>
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
          </header>

          {/* 聊天区域 */}
          <ChatArea />

          {/* 输入框 */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent border-t border-white/5">
            <InputContainer
              onSend={() => {
                // 消息发送处理在 ChatArea 中
              }}
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
              <Sparkles
                size={16}
                className={thinkingEnabled ? 'text-elite-gold' : 'text-elite-gold'}
              />
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
                      className={cn(
                        'h-full rounded-full',
                        thinkingEnabled ? 'bg-elite-gold' : 'bg-elite-gold'
                      )}
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
