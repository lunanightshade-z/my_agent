/**
 * 魔法主题落地页 (Magic Landing Page)
 * 四级设计：液态魔法宇宙
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Scroll, Feather, Star, Wand2, Ghost, Orbit } from 'lucide-react';

// --- 宇宙导航栏组件 ---
const CosmicNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`cosmic-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="logo-glow flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative">
            <Orbit className="w-8 h-8 text-cyan-400 animate-spin-slow" />
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl" />
          </div>
          <span className="font-magic-title text-xl text-white tracking-wider">
            Powerful <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400">Agent</span>
          </span>
        </div>

        {/* 导航项 */}
        <div className="hidden md:flex items-center gap-2">
          <div className="nav-item-cosmic font-magic-body" onClick={() => navigate('/chat')}>
            <Sparkles className="w-4 h-4 inline mr-2" />
            Chat
          </div>
          <div className="nav-item-cosmic font-magic-body" onClick={() => navigate('/agent')}>
            <Wand2 className="w-4 h-4 inline mr-2" />
            Agent
          </div>
          <div className="nav-item-cosmic font-magic-body">
            <Scroll className="w-4 h-4 inline mr-2" />
            Docs
          </div>
        </div>

        {/* CTA 按钮 */}
        <button 
          onClick={() => navigate('/agent')}
          className="relative px-6 py-2 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 rounded-lg text-white font-magic-title font-semibold overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
          <span className="relative z-10 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Get Started
          </span>
        </button>
      </div>
    </nav>
  );
};

// --- 显现动画包装器 ---
const RevealOnScroll = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let timeoutId;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timeoutId = setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay]);

  return (
    <div ref={ref} className={`ink-reveal ${isVisible ? 'visible' : ''}`}>
      {children}
    </div>
  );
};

// --- 主页面组件 ---
export default function Home() {
  const navigate = useNavigate();
  const [spellCast, setSpellCast] = useState(false);

  // 点击主按钮时的特效
  const castSpell = () => {
    setSpellCast(true);
    setTimeout(() => {
      navigate('/agent');
    }, 500);
    setTimeout(() => setSpellCast(false), 2000);
  };

  const features = [
    {
      title: "Instant Conjuration",
      description: "Generate entire worlds, codebases, and essays in the blink of an eye. Faster than a Quick-Quotes Quill.",
      icon: <Zap className="w-8 h-8" />
    },
    {
      title: "Liquid Memories",
      description: "Context window as vast as the Hogwarts Lake. It remembers every detail of your conversation.",
      icon: <Ghost className="w-8 h-8" />
    },
    {
      title: "Universal Translation",
      description: "Break the barriers of language. Speak to anyone, anywhere, as if you drank Polyjuice Potion.",
      icon: <Scroll className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen liquid-bg text-amber-50 relative selection:bg-cyan-900/50 selection:text-cyan-100 overflow-x-hidden">
      <CosmicNav />
      {/* 完全移除 MagicCursor 和 ParticleField */}
      
      {/* 简化星尘纹理覆盖层 */}
      <div className="fixed inset-0 parchment-texture z-[1]" />

      {/* Hero Section */}
      <header className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-24">
        
        {/* 背景魔法阵 - 四级设计：多层次能量圈 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-pink-500/15 rounded-full animate-[spin_40s_linear_infinite_reverse] rotate-45" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border-2 border-amber-500/20 rounded-full animate-[spin_30s_linear_infinite]" style={{ borderStyle: 'dashed' }} />
        
        {/* 中心能量源 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 rounded-full blur-[80px] opacity-20 animate-pulse" />
        </div>

        <RevealOnScroll>
          <div className="mb-6 inline-flex items-center gap-3 px-6 py-3 rounded-full border border-transparent bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-amber-500/10 backdrop-blur-md text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-300 to-amber-300 text-sm tracking-[0.25em] uppercase font-semibold relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-amber-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="relative z-10">The Next Generation Intelligence</span>
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <h1 className="font-magic-title text-6xl md:text-9xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-200 to-pink-400 drop-shadow-[0_0_30px_rgba(100,200,255,0.5)] relative">
            Powerful <br />
            <span className="text-4xl md:text-7xl italic font-serif bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300">Agent</span>
            {/* 文字光晕 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-cyan-200 to-pink-400 blur-[40px] opacity-30 -z-10" />
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={400}>
          <p className="max-w-2xl text-lg md:text-xl text-cyan-100/70 leading-relaxed font-light mb-12 italic font-magic-body">
            "It does not just compute; it <span className="text-pink-300 font-semibold">divines</span> the answer. <br/>
            Unleash the <span className="text-amber-300 font-semibold">alchemy</span> of data and creativity with a single wave."
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={600}>
          <button 
            onClick={castSpell}
            className={`group relative px-12 py-5 bg-transparent overflow-hidden rounded-lg transition-all duration-500 ${spellCast ? 'scale-95' : 'hover:scale-110'}`}
          >
            {/* 多层次光晕背景 */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 opacity-80 blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* 流光动画 */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            
            {/* 边框 */}
            <div className="absolute inset-0 border-2 border-white/50 rounded-lg group-hover:border-white transition-colors" />
            
            <span className="relative z-10 flex items-center gap-3 font-magic-title text-xl text-white group-hover:text-white transition-colors font-bold tracking-wide">
              <Wand2 className={`w-6 h-6 ${spellCast ? 'animate-spin text-amber-200' : 'group-hover:rotate-12 transition-transform'}`} />
              Awaken The Magic
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
            </span>
          </button>
        </RevealOnScroll>
      </header>

      {/* Feature Section (Liquid Glass Cards) */}
      <section className="relative z-10 py-32 px-4 max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="text-center mb-20">
            <h2 className="font-magic-title text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-pink-300 to-amber-300 mb-4">
              The Tri-Wizard Capabilities
            </h2>
            <div className="h-[2px] w-32 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 mx-auto" />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 card-container">
          {features.map((feature, idx) => {
            const colors = [
              { border: 'cyan', glow: 'rgba(100, 200, 255, 0.3)', icon: 'from-cyan-400 to-cyan-600' },
              { border: 'pink', glow: 'rgba(255, 100, 200, 0.3)', icon: 'from-pink-400 to-pink-600' },
              { border: 'amber', glow: 'rgba(255, 215, 0, 0.3)', icon: 'from-amber-400 to-amber-600' }
            ][idx];

            return (
              <RevealOnScroll key={idx} delay={idx * 200}>
                <div className="glass-card-magic p-8 rounded-xl h-full flex flex-col items-center text-center group relative overflow-hidden">
                  {/* 悬停时的彩虹流光特效 */}
                  <div 
                    className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 opacity-0 group-hover:animate-shine"
                  />
                  
                  {/* 图标容器 */}
                  <div 
                    className={`mb-6 p-5 rounded-full bg-gradient-to-br ${colors.icon} border border-white/20 text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 relative`}
                    style={{
                      boxShadow: `0 0 30px ${colors.glow}`
                    }}
                  >
                    {feature.icon}
                    {/* 旋转光晕 */}
                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `conic-gradient(from 0deg, transparent, ${colors.glow}, transparent)`,
                        animation: 'spin 2s linear infinite',
                        filter: 'blur(10px)'
                      }}
                    />
                  </div>

                  <h3 className="font-magic-title text-2xl mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:via-pink-300 group-hover:to-amber-300 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-cyan-100/60 leading-relaxed font-light group-hover:text-white transition-colors font-magic-body">
                    {feature.description}
                  </p>

                  {/* 底部能量线 */}
                  <div 
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-30 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`
                    }}
                  />
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* The "Orb" Interactive Section */}
      <section className="relative z-10 py-20 flex flex-col items-center justify-center overflow-hidden min-h-[80vh]">
        {/* 背景多层光晕 */}
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6">
          <RevealOnScroll>
            <div className="relative group">
              {/* 全能球体模拟 - 四级设计 */}
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-full relative mx-auto">
                {/* 外层旋转光环 */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-pink-400/30 to-amber-400/30 blur-xl animate-[spin_15s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-2 border-cyan-500/40 animate-[spin_20s_linear_infinite_reverse]" style={{ borderStyle: 'dashed' }} />
                <div className="absolute inset-8 rounded-full border border-pink-500/30 animate-[spin_25s_linear_infinite]" />
                
                {/* 核心球体 */}
                <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center backdrop-blur-sm border border-white/20 relative"
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(100, 200, 255, 0.3), rgba(255, 100, 200, 0.2), rgba(0, 0, 0, 0.8))',
                    boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(100, 200, 255, 0.3)'
                  }}
                >
                  {/* 内部能量 */}
                  <div className="text-8xl relative z-10">
                    <Zap className="w-32 h-32 text-transparent bg-clip-text" style={{
                      filter: 'drop-shadow(0 0 20px rgba(100, 200, 255, 0.8))',
                      fill: 'url(#gradient)'
                    }} />
                    <svg width="0" height="0">
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#64C8FF" />
                          <stop offset="50%" stopColor="#FF64C8" />
                          <stop offset="100%" stopColor="#FFD700" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  
                  {/* 脉冲波纹 */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/50 animate-ping" style={{ animationDuration: '3s' }} />
                </div>
                
                {/* 悬浮粒子圈 */}
                <div className="absolute -inset-12 border border-dashed border-amber-500/20 rounded-full animate-[spin_30s_linear_infinite]" />
                <div className="absolute -inset-16 border border-dotted border-pink-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              </div>
            </div>
          </RevealOnScroll>

          <div className="space-y-8 text-left">
            <RevealOnScroll delay={200}>
              <h2 className="font-magic-title text-5xl text-white drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400">Omniscient</span> Core
              </h2>
            </RevealOnScroll>
            
            <RevealOnScroll delay={300}>
              <p className="text-xl text-cyan-100/70 italic border-l-2 border-gradient-to-b from-cyan-500 via-pink-500 to-amber-500 pl-6 font-magic-body relative">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-cyan-500 via-pink-500 to-amber-500" />
                "Like the Pensieve of old, it holds memories of the entire web. Like the Time-Turner, it processes at speeds beyond comprehension."
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={400}>
              <div className="space-y-4">
                {[
                  { title: 'Alchemy of Code', desc: 'Transmute thoughts into functional reality.', color: 'cyan' },
                  { title: 'Sight of the Oracle', desc: 'Perceive images and understand their soul.', color: 'pink' },
                  { title: 'Whispers of Babel', desc: 'Speak and translate every tongue of man.', color: 'amber' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10 group cursor-pointer">
                    <div className={`mt-1 min-w-[24px] h-[24px] rounded-full border-2 border-${item.color}-500 flex items-center justify-center group-hover:scale-110 transition-transform`}
                      style={{
                        borderColor: item.color === 'cyan' ? '#06b6d4' : item.color === 'pink' ? '#ec4899' : '#f59e0b',
                        boxShadow: `0 0 15px ${item.color === 'cyan' ? 'rgba(100, 200, 255, 0.3)' : item.color === 'pink' ? 'rgba(255, 100, 200, 0.3)' : 'rgba(255, 215, 0, 0.3)'}`
                      }}
                    >
                      <div className={`w-2 h-2 bg-${item.color}-400 rounded-full animate-pulse`}
                        style={{
                          backgroundColor: item.color === 'cyan' ? '#22d3ee' : item.color === 'pink' ? '#f472b6' : '#fbbf24'
                        }}
                      />
                    </div>
                    <div>
                      <h4 className={`font-magic-title text-${item.color}-200 group-hover:text-${item.color}-100 transition-colors`}
                        style={{
                          color: item.color === 'cyan' ? '#a5f3fc' : item.color === 'pink' ? '#fbcfe8' : '#fef3c7'
                        }}
                      >
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 font-magic-body transition-colors">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-24 text-center border-t border-gradient-to-r from-cyan-500/20 via-pink-500/20 to-amber-500/20 bg-[#05080f] overflow-hidden">
        {/* 背景渐变光 */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-t from-cyan-500/10 via-pink-500/10 to-transparent blur-[100px]" />
        
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto px-6 relative z-10">
            {/* 浮动羽毛图标 */}
            <div className="relative inline-block mb-8">
              <Feather className="w-16 h-16 text-transparent mx-auto rotate-45 animate-float" style={{
                filter: 'drop-shadow(0 0 20px rgba(100, 200, 255, 0.6))',
                stroke: 'url(#featherGradient)',
                strokeWidth: 1.5,
                fill: 'none'
              }} />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="featherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#64C8FF" />
                    <stop offset="50%" stopColor="#FF64C8" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 rounded-full blur-2xl opacity-20 animate-pulse" />
            </div>
            
            <h2 className="font-magic-title text-4xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 via-pink-200 to-amber-200">
              Ready to begin your journey?
            </h2>
            
            <p className="text-cyan-200/50 mb-10 font-serif italic text-lg font-magic-body leading-relaxed">
              The parchment is blank. The quill is inked. <br/> 
              The <span className="text-pink-300 font-semibold">magic</span> awaits your <span className="text-amber-300 font-semibold">command</span>.
            </p>
            
            <button 
              onClick={() => navigate('/chat')}
              className="relative px-12 py-4 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500 text-white font-magic-title font-bold tracking-widest rounded-lg overflow-hidden group transition-all duration-300 hover:scale-105"
            >
              {/* 内层光晕 */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              
              {/* 流光 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              
              <span className="relative z-10 flex items-center gap-3 justify-center">
                <Star className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                Start Free Trial
                <Star className="w-5 h-5 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              </span>
            </button>
          </div>
          
          <div className="mt-20 text-cyan-500/30 text-xs tracking-[0.3em] font-magic-title relative">
            <div className="inline-block relative">
              Mischief Managed © 2024 Powerful AI
              <div className="absolute -bottom-2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            </div>
          </div>
        </RevealOnScroll>
      </footer>
    </div>
  );
}
