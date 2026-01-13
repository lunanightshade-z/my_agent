import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, 
  Cpu, 
  UploadCloud, 
  Send, 
  Box, 
  Layers, 
  MoreHorizontal, 
  Zap,
  Code,
  FileText,
  Sparkles,
  Maximize2
} from 'lucide-react';

/**
 * AETHER UI - Level 4 Design
 * Core Concept: Organic Digitalism.
 * * Features:
 * - HTML5 Canvas Particle System for background (Neural Network effect).
 * - Custom CSS Glassmorphism with holographic gradients.
 * - 3D Tilt effects on panels.
 * - Dynamic "Deep Think" mode state switching.
 * - Fluid animations using CSS transitions and React state.
 */

// --- Sub-components ---

// 1. Particle Background System
const ParticleBackground = ({ isDeepThinking }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    // Config based on mode
    const config = {
      particleCount: 60,
      connectionDistance: 150,
      baseSpeed: isDeepThinking ? 0.2 : 0.5,
      color: isDeepThinking ? '255, 215, 0' : '0, 255, 255', // Gold vs Cyan
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * config.baseSpeed;
        this.vy = (Math.random() - 0.5) * config.baseSpeed;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${config.color}, ${isDeepThinking ? 0.6 : 0.4})`;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < config.connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${config.color}, ${1 - distance / config.connectionDistance})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDeepThinking]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

// 2. Chat Bubble Component with "Materialization" effect
const ChatBubble = ({ message, isDeepThinking }) => {
  const isAi = message.sender === 'ai';
  
  return (
    <div className={`flex w-full mb-6 ${isAi ? 'justify-start' : 'justify-end'} group`}>
      <div 
        className={`
          relative max-w-[80%] p-4 rounded-2xl backdrop-blur-md transition-all duration-500
          border border-white/10 shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01]
          ${isAi 
            ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-tl-none text-gray-100' 
            : 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-tr-none text-white'}
        `}
      >
        {/* Glow effect on AI messages */}
        {isAi && (
          <div className={`absolute -left-1 -top-1 w-2 h-2 rounded-full ${isDeepThinking ? 'bg-yellow-400 shadow-[0_0_10px_rgba(255,215,0,0.8)]' : 'bg-cyan-400 shadow-[0_0_10px_rgba(0,255,255,0.8)]'}`}></div>
        )}
        
        <div className="font-light tracking-wide leading-relaxed text-sm md:text-base">
          {message.content}
        </div>
        
        {/* Metadata footer */}
        <div className="flex items-center justify-end gap-2 mt-2 opacity-40 text-xs">
          {isAi && isDeepThinking && <Sparkles size={10} className="text-yellow-400 animate-pulse" />}
          <span>{message.time}</span>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', content: '系统在线。神经连接已建立。请问我们今天探索什么领域的知识？', time: '10:00' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isDeepThinking, setIsDeepThinking] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Parallax Tilt Logic
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

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMsg = { id: Date.now(), sender: 'user', content: inputValue, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');

    // Simulate AI thinking and response
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        content: isDeepThinking 
          ? `[深度思维模式已激活]\n正在解析 "${newMsg.content}" 的底层逻辑...\n\n经过多维度分析，我为你生成了一个结构化的解决方案。请查看右侧的 Artifact 面板获取详细代码实现。` 
          : `我收到了关于 "${newMsg.content}" 的指令。这是我的快速反馈。`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, aiResponse]);
      
      if (isDeepThinking) {
        setActiveArtifact({
          title: "Neural_Network_Structure.py",
          type: "code",
          content: `class NeuralNet(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.layer1 = nn.Linear(784, 128)\n        self.act = nn.ReLU()\n        \n    def forward(self, x):\n        return self.act(self.layer1(x))`
        });
      }
    }, 1500);
  };

  // Dynamic Styles for Parallax
  const tiltStyle = {
    transform: `perspective(1000px) rotateY(${mousePos.x * 2}deg) rotateX(${mousePos.y * -2}deg)`,
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* Background Layer */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${isDeepThinking ? 'bg-[#0a0510]' : 'bg-[#020610]'}`}>
        {/* Radial Gradients */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 transition-all duration-1000"
          style={{ 
            background: isDeepThinking ? 'radial-gradient(circle, #ffd700, #4b0082)' : 'radial-gradient(circle, #00ffff, #0000ff)',
            top: '50%', left: '50%', transform: `translate(-50%, -50%) translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)`
          }}
        />
      </div>

      <ParticleBackground isDeepThinking={isDeepThinking} />

      {/* Main Glass Container */}
      <div 
        ref={containerRef}
        className="relative z-10 flex w-full h-full p-6 gap-6 transition-transform duration-100 ease-out"
        style={tiltStyle}
      >
        
        {/* LEFT: History Shards */}
        <div className="hidden md:flex flex-col w-64 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:bg-white/10 group">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <Layers size={18} className="text-cyan-400" />
            <span className="text-sm font-bold tracking-widest uppercase opacity-70">Memory Log</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all duration-300 group/item border border-transparent hover:border-white/10">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${isDeepThinking ? 'bg-yellow-500' : 'bg-cyan-500'} group-hover/item:shadow-[0_0_8px_currentColor] transition-all`}></div>
                   Session #{100 + item}
                </div>
                <div className="text-sm truncate opacity-80 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-transform">
                  Project Aether Design...
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 bg-black/20">
            <button className="flex items-center gap-2 text-xs opacity-50 hover:opacity-100 transition-opacity w-full">
               <MoreHorizontal size={14} /> <span>Archive</span>
            </button>
          </div>
        </div>

        {/* CENTER: Main Interface */}
        <div className="flex-1 flex flex-col backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
             <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${isDeepThinking ? 'bg-yellow-500/20 text-yellow-400' : 'bg-cyan-500/20 text-cyan-400'} transition-all duration-500`}>
                  <Box size={20} />
               </div>
               <div>
                 <h1 className="font-bold text-lg tracking-wider">AETHER <span className="font-thin opacity-50">CORE</span></h1>
                 <div className="flex items-center gap-2">
                   <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDeepThinking ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                   <span className="text-[10px] uppercase tracking-widest opacity-60">
                     {isDeepThinking ? 'Deep Processing Active' : 'Systems Nominal'}
                   </span>
                 </div>
               </div>
             </div>
             <div className="flex items-center gap-4">
                {/* Deep Think Toggle Switch */}
                <div 
                  onClick={() => setIsDeepThinking(!isDeepThinking)}
                  className={`cursor-pointer group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-500 ${
                    isDeepThinking 
                    ? 'border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
                    : 'border-white/10 hover:border-cyan-500/50 bg-transparent'
                  }`}
                >
                  <Cpu size={16} className={`transition-all duration-500 ${isDeepThinking ? 'text-yellow-400 rotate-180' : 'text-gray-400 group-hover:text-cyan-400'}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${isDeepThinking ? 'text-yellow-400' : 'text-gray-400 group-hover:text-cyan-400'}`}>
                    Deep Think
                  </span>
                </div>
             </div>
          </header>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
             {/* Decorative Grid Line */}
             <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
             </div>
             
             {messages.map((msg) => (
               <ChatBubble key={msg.id} message={msg} isDeepThinking={isDeepThinking} />
             ))}
          </div>

          {/* Input Area (Control Deck) */}
          <div className="p-6 bg-gradient-to-t from-black/60 to-transparent">
            <div className={`
              relative flex items-end gap-3 p-2 pr-3 rounded-2xl border transition-all duration-300
              ${isDeepThinking 
                ? 'bg-yellow-900/10 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
                : 'bg-white/5 border-white/10 focus-within:border-cyan-500/50 focus-within:bg-white/10 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.1)]'}
            `}>
              <button className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <UploadCloud size={20} />
              </button>
              
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={isDeepThinking ? "Entering complex query into neural cortex..." : "Input command or query..."}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 resize-none py-3 min-h-[50px] max-h-[120px] custom-scrollbar"
                rows={1}
              />
              
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`
                  p-3 rounded-xl transition-all duration-300 flex items-center justify-center
                  ${inputValue.trim() 
                    ? (isDeepThinking ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:scale-105' : 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:scale-105') 
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'}
                `}
              >
                <Send size={20} className={inputValue.trim() ? '-translate-y-0.5 translate-x-0.5' : ''} />
              </button>
            </div>
            <div className="text-center mt-2 text-[10px] text-gray-600 font-mono">
              AETHER OS v4.2.0 • SECURE CONNECTION ESTABLISHED
            </div>
          </div>
        </div>

        {/* RIGHT: Artifact Panel (Holographic Projection) */}
        <div className={`
          hidden xl:flex flex-col w-80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500
          ${activeArtifact ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-50 grayscale'}
          ${isDeepThinking ? 'bg-yellow-900/5' : 'bg-cyan-900/5'}
        `}>
           <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className={isDeepThinking ? 'text-yellow-400' : 'text-cyan-400'} />
                <span className="text-sm font-bold tracking-widest uppercase">Artifact</span>
              </div>
              <Maximize2 size={14} className="opacity-50 hover:opacity-100 cursor-pointer" />
           </div>

           <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative">
              {!activeArtifact ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-30">
                   <Box size={48} className="mb-4 animate-bounce-slow" />
                   <p className="text-sm">Waiting for output generation...</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-4">
                    {activeArtifact.type === 'code' ? <Code size={16} className="text-pink-400" /> : <FileText size={16} />}
                    <span className="text-xs font-mono text-pink-300 bg-pink-500/10 px-2 py-0.5 rounded">{activeArtifact.title}</span>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 font-mono text-xs border border-white/5 shadow-inner text-gray-300 overflow-x-auto">
                    <pre>{activeArtifact.content}</pre>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className={`h-full w-2/3 rounded-full ${isDeepThinking ? 'bg-yellow-500' : 'bg-cyan-500'} animate-pulse`}></div>
                    </div>
                    <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-50">
                       <span>Stability: 98%</span>
                       <span>Complexity: High</span>
                    </div>
                  </div>
                </div>
              )}
           </div>
           
           {/* Bottom "Liquid" Button */}
           <div className="p-5 border-t border-white/5">
              <button className={`
                w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 relative overflow-hidden group
                ${isDeepThinking ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black'}
              `}>
                <span className="relative z-10">Export Artifact</span>
                {/* Simulated liquid hover fill */}
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-current opacity-20"></div>
              </button>
           </div>
        </div>

      </div>

      {/* Global & Animation Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}