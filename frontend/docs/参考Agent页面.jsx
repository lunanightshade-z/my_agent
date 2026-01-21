import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Cpu, 
  Sparkles, 
  Clock, 
  MoreHorizontal, 
  Image as ImageIcon,
  Mic,
  X,
  Zap,
  Leaf,
  Wind,
  AlignLeft
} from 'lucide-react';

// --- 组件：背景动态流体 ---
// 使用纯CSS动画模拟流动的空气感背景
const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#fdfcf8]">
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-100/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
    <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-100/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
    <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-pink-100/40 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
  </div>
);

// --- 模拟数据 ---
const INITIAL_MESSAGES = [
  { id: 1, role: 'ai', content: '你好，今天是充满灵感的一天。无论是写作、绘图还是代码，我都准备好了。你想从哪里开始？', type: 'text' },
  { id: 2, role: 'user', content: '帮我构思一个关于"云端书店"的短篇故事大纲。', type: 'text' },
  { id: 3, role: 'ai', content: '这听起来很浪漫。我们可以设定书店不是在普通的云端服务器，而是真正漂浮在平流层的积雨云上。\n\n**核心概念：**\n1. **入场券**：必须在下雨天通过收集雨水换取。\n2. **店主**：一个已经活了300年的气象观测员。\n3. **冲突**：一场罕见的干旱威胁到了书店的存在。', type: 'text' }
];

const HISTORY_ITEMS = [
  { id: 1, title: '云端书店构思', time: '10:42 AM' },
  { id: 2, title: 'React 性能优化', time: '昨天' },
  { id: 3, title: '京都以此行程', time: '周一' },
  { id: 4, title: '早安问候语', time: '上周' },
];

const MODELS = [
  { id: 'gpt-4o', name: 'Gemini Pro', icon: <Sparkles size={14} />, color: 'text-indigo-500' },
  { id: 'claude-3', name: 'Claude Opus', icon: <Wind size={14} />, color: 'text-orange-500' },
  { id: 'llama-3', name: 'Llama 3', icon: <Zap size={14} />, color: 'text-blue-500' },
];

// --- 主应用组件 ---
export default function App() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [activeHistory, setActiveHistory] = useState(1);
  
  // 上下文总结状态 (右侧面板)
  const [summary] = useState([
    { label: 'Key Theme', text: 'Magic Realism' },
    { label: 'Characters', text: 'Meteorologist, Rain Collector' },
    { label: 'Tone', text: 'Melancholic yet hopeful' }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = { id: Date.now(), role: 'user', content: inputValue, type: 'text' };
    setMessages([...messages, newMessage]);
    setInputValue('');
    
    // 模拟AI回复延迟
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: '这是一个非常棒的切入点。我们可以继续深化"雨水货币"这个设定。或许不同季节的雨水能买到不同情绪的书籍？',
        type: 'text'
      }]);
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen font-sans text-slate-600 selection:bg-teal-100 selection:text-teal-800">
      <AmbientBackground />

      {/* 布局容器：这里不使用传统的Grid，而是使用Flex配合绝对定位创造空间感 */}
      <div className="relative z-10 flex w-full h-full p-6 gap-6 overflow-hidden">

        {/* --- 左侧：时光胶囊 (历史记录) --- */}
        <div className="w-16 md:w-20 lg:w-64 flex-shrink-0 flex flex-col gap-6 transition-all duration-500 ease-in-out">
          <div className="h-12 w-12 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/60 mb-4 cursor-pointer hover:scale-105 transition-transform">
            <Leaf className="text-teal-500" size={20} />
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-20 mask-gradient-b">
            {HISTORY_ITEMS.map((item) => (
              <div 
                key={item.id}
                onClick={() => setActiveHistory(item.id)}
                className={`group relative p-3 rounded-2xl transition-all duration-300 cursor-pointer border
                  ${activeHistory === item.id 
                    ? 'bg-white/80 border-white shadow-lg shadow-teal-500/10 scale-105' 
                    : 'bg-white/30 border-transparent hover:bg-white/50 hover:border-white/40'
                  }`}
              >
                {/* 仅在宽屏显示标题，窄屏显示时间点 */}
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full transition-colors ${activeHistory === item.id ? 'bg-teal-400' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                  <div className="hidden lg:block">
                    <h4 className={`text-sm font-medium ${activeHistory === item.id ? 'text-slate-800' : 'text-slate-500'}`}>{item.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                  </div>
                </div>
                {/* 窄屏Tooltip */}
                <div className="absolute left-14 top-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 lg:hidden group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 中间：对话舞台 --- */}
        <div className="flex-1 relative flex flex-col items-center">
          
          {/* 顶部标题区 - 极简 */}
          <div className="w-full flex justify-between items-center mb-4 px-4">
            <h2 className="text-xl font-light tracking-wide text-slate-700">Cloud Bookstore</h2>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium">Online</span>
            </div>
          </div>

          {/* 消息滚动区 */}
          <div className="w-full max-w-3xl flex-1 overflow-y-auto no-scrollbar px-4 pb-32 mask-gradient-t-b">
            <div className="flex flex-col gap-8 py-8">
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id} 
                  className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`
                    relative max-w-[80%] md:max-w-[70%] p-6 rounded-3xl backdrop-blur-md border shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-slate-800/5 border-slate-200/50 text-slate-700 rounded-br-none' 
                      : 'bg-white/70 border-white/60 text-slate-600 rounded-tl-none shadow-indigo-100/50'
                    }
                  `}>
                    {/* Role Label */}
                    <span className={`absolute -top-6 text-[10px] font-bold tracking-widest uppercase opacity-40
                       ${msg.role === 'user' ? 'right-0' : 'left-0'}
                    `}>
                      {msg.role}
                    </span>

                    <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* --- 悬浮控制胶囊 (输入区) --- */}
          <div className="absolute bottom-6 w-full max-w-2xl px-4 z-50">
            <div className="
              relative w-full p-2 bg-white/80 backdrop-blur-xl rounded-[2rem] 
              border border-white shadow-2xl shadow-indigo-500/10 
              flex flex-col gap-2 transition-all duration-300
              focus-within:shadow-indigo-500/20 focus-within:scale-[1.01]
            ">
              {/* 输入框 */}
              <div className="flex items-end gap-2 px-2">
                <button className="p-3 rounded-full text-slate-400 hover:text-teal-500 hover:bg-teal-50 transition-colors">
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none outline-none resize-none py-3 max-h-32 text-slate-700 placeholder:text-slate-400/70 text-base"
                  rows={1}
                  style={{ minHeight: '48px' }}
                />
                <button 
                  onClick={handleSend}
                  className={`
                    p-3 rounded-full transition-all duration-300 shadow-md
                    ${inputValue.trim() 
                      ? 'bg-slate-800 text-white hover:bg-slate-700 shadow-slate-800/20' 
                      : 'bg-slate-100 text-slate-300 shadow-transparent cursor-default'}
                  `}
                >
                  <Send size={18} />
                </button>
              </div>

              {/* 底部工具栏：模型选择与功能 */}
              <div className="flex justify-between items-center px-4 pb-1 pl-14">
                <div className="relative">
                  <button 
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/50 hover:bg-white hover:shadow-sm transition-all text-xs font-medium text-slate-600"
                  >
                    <span className={selectedModel.color}>{selectedModel.icon}</span>
                    {selectedModel.name}
                  </button>

                  {/* 模型选择下拉菜单 (Glass popover) */}
                  {isModelMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl border border-white shadow-xl shadow-slate-200/50 overflow-hidden py-1 animate-scale-in origin-bottom-left">
                      {MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => { setSelectedModel(model); setIsModelMenuOpen(false); }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-teal-50/50 transition-colors text-left"
                        >
                          <span className={model.color}>{model.icon}</span>
                          <span className={`text-sm ${selectedModel.id === model.id ? 'text-slate-800 font-semibold' : 'text-slate-500'}`}>
                            {model.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                   <span className="text-[10px] text-slate-300 font-mono tracking-tighter">ETHER v1.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 右侧：灵感碎片 (上下文总结) --- */}
        <div className="hidden lg:flex w-72 flex-col gap-4 pt-12">
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border border-white/50 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <AlignLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Context Memory</span>
            </div>

            <div className="flex flex-col gap-4">
              {summary.map((item, idx) => (
                <div key={idx} className="group">
                  <h5 className="text-[10px] text-slate-400 font-medium mb-1 pl-2 border-l-2 border-transparent group-hover:border-teal-300 transition-colors">
                    {item.label}
                  </h5>
                  <div className="p-3 bg-white/60 rounded-xl text-sm text-slate-700 shadow-sm border border-transparent group-hover:border-white transition-all">
                    {item.text}
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:text-slate-400 hover:border-slate-300 cursor-pointer transition-all">
                <span className="text-xs">+ Add context</span>
              </div>
            </div>
          </div>

          {/* 装饰性的小组件 */}
          <div className="bg-gradient-to-br from-teal-50 to-indigo-50 rounded-[2rem] p-6 border border-white/50 shadow-sm opacity-80 mt-auto mb-20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl">🌤</span>
              <span className="text-xs font-mono text-slate-400">STATUS</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">All systems operational.</p>
            <p className="text-xs text-slate-400 mt-1">Creative engine running at 98%</p>
          </div>
        </div>

      </div>

      {/* Tailwind 自定义动画补充 (通常在tailwind.config.js中，这里用style模拟) */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
        .mask-gradient-b {
           mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
        }
        .mask-gradient-t-b {
           mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
        }
      `}</style>
    </div>
  );
}