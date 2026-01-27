import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Paperclip, Mic, Cpu, Box, 
  Layers, Zap, MoreHorizontal, Maximize2, 
  X, ChevronRight, ChevronLeft, Sparkles,
  Play, Pause, RotateCcw
} from 'lucide-react';

/**
 * INCEPTION AI CHAT - LEVEL 4 DESIGN
 * Theme: "The Construct" - Surreal, Cinematic, Atmospheric
 */

const InceptionChat = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: 'We are in the dream state. What structure shall we build today?', type: 'text' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isDeepThought, setIsDeepThought] = useState(false);
  const [artifacts, setArtifacts] = useState([
    { id: 1, title: 'Dream_Layer_01.js', type: 'code', content: 'const limbo = true;' }
  ]);
  const [activeArtifact, setActiveArtifact] = useState(1);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isArtifactOpen, setArtifactOpen] = useState(true);
  const [isDreaming, setIsDreaming] = useState(false); // AI processing state

  const canvasRef = useRef(null);
  const chatEndRef = useRef(null);

  // --- 1. THE DREAM ENGINE (Background Particles) ---
  useEffect(() => {
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
      ctx.fillStyle = 'rgba(10, 12, 16, 0.2)'; // Very dark blue/grey
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
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // User Message
    const newMsg = { id: Date.now(), role: 'user', content: inputValue, type: 'text' };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsDreaming(true);

    // Simulate AI "Inception" Delay
    setTimeout(() => {
      setIsDreaming(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        content: `Analysis complete. Depth level: ${isDeepThought ? 'Subconscious' : 'Surface'}. I have constructed a new paradigm for you.`,
        type: 'text'
      }]);
      // Add a dummy artifact
      setArtifacts(prev => [...prev, {
        id: Date.now() + 2,
        title: 'Paradox_Engine_v2.tsx',
        type: 'code',
        content: '// The seed has been planted'
      }]);
    }, 2500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0c10] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-100">
      
      {/* --- EXTERNAL STYLES & FONTS --- */}
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

        /* Deep Thought Gradient */
        .deep-thought-active {
          background: linear-gradient(135deg, rgba(20,20,20,0.9), rgba(50,20,20,0.8));
          border: 1px solid rgba(255, 100, 100, 0.3);
        }

        /* Scrollbar hiding */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- BACKGROUND CANVAS --- */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-60" />

      {/* --- NOISE OVERLAY (Film Grain) --- */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* --- MAIN LAYOUT GRID --- */}
      <div className="relative z-10 flex w-full h-full p-4 gap-4 perspective-container overflow-hidden">
        
        {/* === LEFT: HISTORY / MNEMOSYNE === */}
        <div className={`
          flex-shrink-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isSidebarOpen ? 'w-64 opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-10'}
          glass-panel rounded-2xl overflow-hidden
        `}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-cinematic text-amber-500/80 font-bold tracking-widest text-sm">ARCHIVES</h2>
            <Layers size={14} className="text-white/40" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                <div className="text-xs text-amber-500/50 font-tech mb-1 uppercase tracking-wider">Dream Level {i}</div>
                <div className="text-sm text-slate-300 truncate font-light group-hover:text-white transition-colors">
                  Subject: Reality Distortion Field
                </div>
              </div>
            ))}
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

        {/* === CENTER: THE LIMBO / CHAT === */}
        <div className="flex-1 flex flex-col relative rounded-2xl overflow-hidden glass-panel border-opacity-50 transition-all duration-500">
          
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a0c10]/80 to-transparent z-20 flex items-center justify-between px-6 pointer-events-none">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="pointer-events-auto p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
              {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
            <h1 className="font-cinematic text-2xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-slate-200 via-amber-100 to-slate-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              CONSTRUCT
            </h1>
            <button onClick={() => setArtifactOpen(!isArtifactOpen)} className="pointer-events-auto p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
              {isArtifactOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 pt-20 pb-40 space-y-8 no-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  relative max-w-[80%] p-6 rounded-none
                  ${msg.role === 'user' 
                    ? 'bg-gradient-to-br from-amber-900/20 to-black/40 border-r-2 border-amber-600/50 rounded-tl-2xl rounded-bl-2xl' 
                    : 'bg-gradient-to-br from-slate-800/30 to-black/40 border-l-2 border-slate-400/30 rounded-tr-2xl rounded-br-2xl'}
                  tilt-card backdrop-blur-md
                `}>
                  {/* Decorative corner accents */}
                  <div className={`absolute top-0 w-2 h-2 border-t border-${msg.role === 'user' ? 'amber-500' : 'slate-400'} ${msg.role === 'user' ? 'right-0 border-r' : 'left-0 border-l'}`} />
                  <div className={`absolute bottom-0 w-2 h-2 border-b border-${msg.role === 'user' ? 'amber-500' : 'slate-400'} ${msg.role === 'user' ? 'right-0 border-r' : 'left-0 border-l'}`} />
                  
                  <div className="flex items-center gap-2 mb-2 opacity-50">
                     <span className="text-[10px] font-tech uppercase tracking-widest">
                       {msg.role === 'user' ? 'PROJECTION' : 'SUB CORTEX'}
                     </span>
                     {msg.role === 'ai' && <Zap size={10} className="text-yellow-200" />}
                  </div>
                  
                  <p className={`text-base leading-relaxed ${msg.role === 'user' ? 'font-light text-amber-100/90' : 'font-normal text-slate-200'}`}>
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading / Totem State */}
            {isDreaming && (
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
            <div ref={chatEndRef} />
          </div>

          {/* --- INPUT ZONE (Sticky Bottom) --- */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
            <div className={`
              w-full glass-input rounded-xl p-4 transition-all duration-500
              ${isDeepThought ? 'border border-amber-500/40 shadow-[0_0_50px_rgba(217,119,6,0.15)]' : 'border border-white/10'}
            `}>
              
              {/* Input Tools */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-amber-200 transition-colors">
                    <Paperclip size={18} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-amber-200 transition-colors">
                    <Box size={18} />
                  </button>
                </div>

                {/* Deep Thought Toggle - Mechanical Switch Look */}
                <div 
                  onClick={() => setIsDeepThought(!isDeepThought)}
                  className="group flex items-center gap-3 cursor-pointer select-none"
                >
                  <span className={`text-[10px] font-tech uppercase tracking-widest transition-colors ${isDeepThought ? 'text-amber-400 text-shadow-glow' : 'text-slate-500'}`}>
                    Deep Thought
                  </span>
                  <div className={`
                    w-12 h-6 rounded-full p-1 transition-all duration-500 relative border
                    ${isDeepThought ? 'bg-amber-900/40 border-amber-500/50' : 'bg-slate-800/50 border-slate-600/30'}
                  `}>
                    <div className={`
                      w-4 h-4 rounded-full shadow-md transition-all duration-500 transform
                      ${isDeepThought ? 'translate-x-6 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'translate-x-0 bg-slate-400'}
                    `} />
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <div className="relative flex items-end gap-2">
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Insert idea..."
                  rows={1}
                  className="w-full bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 font-light resize-none py-3 px-2 max-h-32 focus:ring-0"
                  style={{ minHeight: '44px' }}
                />
                
                <button 
                  onClick={handleSend}
                  className={`
                    p-3 rounded-lg transition-all duration-300 flex-shrink-0
                    ${inputValue.trim() 
                      ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:bg-amber-500 hover:scale-105' 
                      : 'bg-white/5 text-white/20 cursor-not-allowed'}
                  `}
                >
                  {isDeepThought ? <Sparkles size={20} /> : <Send size={20} />}
                </button>
              </div>
            </div>
            
            <div className="text-center mt-2">
               <span className="text-[9px] text-slate-600 font-tech tracking-[0.3em] uppercase">
                 Stable Connection • Layer 4
               </span>
            </div>
          </div>
        </div>

        {/* === RIGHT: ARTIFACTS / TOTEM ROOM === */}
        <div className={`
          flex-shrink-0 flex flex-col transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isArtifactOpen ? 'w-80 opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-10'}
          glass-panel rounded-2xl ml-4 overflow-hidden border-l border-amber-500/10
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
               {artifacts.map(art => (
                 <div 
                   key={art.id}
                   onClick={() => setActiveArtifact(art.id)}
                   className={`
                     px-4 py-3 text-xs font-tech cursor-pointer whitespace-nowrap transition-colors border-b-2
                     ${activeArtifact === art.id 
                       ? 'text-amber-100 border-amber-500 bg-white/5' 
                       : 'text-slate-500 border-transparent hover:text-slate-300'}
                   `}
                 >
                   {art.title}
                 </div>
               ))}
             </div>

             {/* Artifact Content (Code/Preview) */}
             <div className="flex-1 p-4 bg-[#0d1117] font-mono text-xs text-green-400/80 overflow-auto relative">
               {/* Decorative grid overlay for the artifact area */}
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
               
               <pre className="relative z-10 leading-loose">
                 <code>
                   {artifacts.find(a => a.id === activeArtifact)?.content || '// No data loaded...'}
                 </code>
               </pre>

               {/* Floating holographic element */}
               <div className="absolute bottom-4 right-4 animate-pulse opacity-50">
                  <Cpu size={24} className="text-amber-500" />
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
  );
};

export default InceptionChat;