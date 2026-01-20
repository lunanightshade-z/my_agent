import React, { useState, useEffect, useRef } from 'react';
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
  Star
} from 'lucide-react';

// --- 字体引入 (通过 Style 标签模拟) ---
const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap');
    
    .font-magic-title { font-family: 'Cinzel', serif; }
    .font-magic-body { font-family: 'Cormorant Garamond', serif; }
    
    /* 自定义滚动条 - 隐形但在滚动时显示金色 */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.3); border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.6); }

    /* 背景噪点纹理 */
    .bg-noise {
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
    }
  `}</style>
);

// --- 粒子背景组件 ---
const MagicalParticles = () => {
  // 生成随机粒子
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
export default function App() {
  const [activeTab, setActiveTab] = useState('chat'); // For mobile mainly
  const [inputFocused, setInputFocused] = useState(false);
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'ai', content: '欢迎来到思维殿堂。今日你想探寻什么魔法知识？', timestamp: '10:00 AM' },
    { id: 2, type: 'user', content: '帮我构思一个关于时间旅行的短篇小说大纲。', timestamp: '10:02 AM' },
    { id: 3, type: 'ai', content: '很有趣的课题。我们需要确定几个核心要素：时间悖论的类型、主角的媒介（怀表？魔药？），以及代价。正在启动深度构思...', isThinking: false },
  ]);
  const [artifacts, setArtifacts] = useState([
    { id: 1, title: '时间法则草稿', type: 'text', content: '第一法则：观测即坍塌...' },
    { id: 2, title: '角色设定：艾拉', type: 'image', content: '一个维多利亚时代的钟表匠...' },
  ]);

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

  return (
    <div 
      className="relative w-full h-screen bg-[#FDFBF7] text-[#2C3E50] overflow-hidden font-magic-body selection:bg-amber-200 selection:text-amber-900"
      onMouseMove={handleMouseMove}
    >
      <FontStyles />
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
          <div className="p-6 border-b border-amber-900/10 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" />
            <h2 className="font-magic-title text-lg font-bold text-amber-900/80 tracking-widest">Memories</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <motion.div 
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item * 0.1 }}
                className="group relative p-3 rounded-xl cursor-pointer hover:bg-white/50 transition-all border border-transparent hover:border-amber-200/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-100/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity" />
                <h3 className="text-sm font-semibold text-slate-700 font-magic-title group-hover:text-amber-800">
                  {['贤者之石的研究', '黑魔法防御术', '魔药配方优化', '量子纠缠解释', '晚宴食谱'][item - 1]}
                </h3>
                <p className="text-xs text-slate-400 mt-1 truncate">
                  上次编辑于 2 小时前...
                </p>
                <Sparkles className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
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

          {/* 聊天内容区域 */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 scroll-smooth">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* 头像 */}
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-lg backdrop-blur-md border border-white/50
                    ${msg.type === 'ai' ? 'bg-gradient-to-br from-indigo-100 to-white text-indigo-600' : 'bg-gradient-to-br from-amber-100 to-white text-amber-700'}`}>
                    {msg.type === 'ai' ? <Wand2 size={18} /> : <Feather size={18} />}
                  </div>

                  {/* 消息气泡 - 液态玻璃效果 */}
                  <div className={`relative p-6 rounded-2xl border backdrop-blur-md shadow-sm
                    ${msg.type === 'ai' 
                      ? 'bg-white/60 border-white/60 text-slate-700 rounded-tl-none' 
                      : 'bg-indigo-900/5 border-indigo-500/10 text-slate-800 rounded-tr-none'
                    }`}>
                    <div className="font-magic-title text-xs opacity-50 mb-2 uppercase tracking-wider flex items-center gap-2">
                       {msg.type === 'ai' ? 'The Oracle' : 'The Seeker'}
                       <span className="text-[10px] opacity-60 ml-auto">{msg.timestamp}</span>
                    </div>
                    <div className="leading-relaxed text-lg">
                      {msg.content}
                    </div>
                    
                    {/* 深度思考指示器 */}
                    {msg.isThinking && (
                      <div className="mt-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center gap-3">
                         <div className="relative w-4 h-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                         </div>
                         <span className="text-sm text-indigo-800 italic">正在编织命运的丝线 (Deep Thinking)...</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="h-24" /> {/* Spacer for bottom input */}
          </div>

          {/* --- 底部输入区域 (The Wand) --- */}
          <div className="absolute bottom-6 left-6 right-6 z-20">
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
                  className="flex-1 bg-transparent border-none outline-none resize-none p-3 max-h-32 text-slate-700 placeholder:text-slate-400 font-magic-body text-lg"
                  placeholder="挥动你的羽毛笔..."
                  rows={1}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                />

                {/* 功能区 */}
                <div className="flex items-center gap-2 pb-1">
                  
                  {/* 深度思考开关 */}
                  <div 
                    onClick={() => setDeepThinkEnabled(!deepThinkEnabled)}
                    className={`cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border
                      ${deepThinkEnabled 
                        ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-700' 
                        : 'bg-slate-100/50 border-transparent text-slate-400 hover:text-slate-600'}
                    `}
                  >
                    <BrainCircuit size={16} className={deepThinkEnabled ? "animate-pulse" : ""} />
                    <span className="text-xs font-bold font-magic-title">Deep Think</span>
                  </div>

                  {/* 发送按钮 */}
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full text-white shadow-lg shadow-amber-500/30"
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

          <div className="flex-1 p-5 overflow-y-auto space-y-6">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest font-magic-title mb-2">Current Manifestations</div>
            
            {artifacts.map((artifact) => (
              <motion.div 
                key={artifact.id}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-0 rounded-xl shadow-sm border border-slate-100 overflow-hidden group cursor-pointer"
              >
                {/* 顶部标签色块 */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-400 to-purple-400" />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-magic-title font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">{artifact.title}</h3>
                     <Maximize2 size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-sm text-slate-500 font-magic-body leading-snug line-clamp-3">
                    {artifact.content}
                  </div>
                </div>
                {/* 底部元数据 */}
                <div className="px-4 py-2 bg-slate-50 flex justify-between items-center text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  <span>{artifact.type}</span>
                  <span className="group-hover:text-amber-500 transition-colors">View Rune</span>
                </div>
              </motion.div>
            ))}

            {/* 空白占位符，模拟未解锁的页面 */}
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-300 gap-2">
               <Hourglass size={24} className="animate-spin-slow" />
               <span className="text-xs font-magic-title">Awaiting Conjuration...</span>
            </div>
          </div>
        </motion.aside>

      </div>
      
      {/* 移动端覆盖层 (仅示意) */}
      <div className="md:hidden absolute bottom-24 right-4 flex flex-col gap-3">
         <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-amber-600"><History /></button>
         <button className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-indigo-600"><Scroll /></button>
      </div>
    </div>
  );
}