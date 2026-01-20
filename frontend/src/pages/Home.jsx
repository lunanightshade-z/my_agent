/**
 * 魔法主题落地页 (Magic Landing Page)
 * 参考设计: Powerful Agent 魔法世界
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Scroll, Feather, Star, Wand2, Ghost } from 'lucide-react';

// --- 魔法光标组件 (Lumos Wand) ---
const MagicCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // 添加轨迹粒子
      const newSparkle = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
        size: Math.random() * 4 + 1
      };
      
      setTrail((prev) => [...prev.slice(-15), newSparkle]);
    };

    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]">
      {/* 核心光标：魔杖尖端 */}
      <div 
        className="absolute w-4 h-4 rounded-full bg-yellow-200 blur-[2px] mix-blend-screen"
        style={{ 
          left: position.x, 
          top: position.y,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 15px 2px rgba(255, 215, 0, 0.8)'
        }}
      />
      
      {/* 魔法轨迹 */}
      {trail.map((sparkle, index) => (
        <div
          key={sparkle.id}
          className="absolute rounded-full bg-amber-300 animate-pulse"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size + 'px',
            height: sparkle.size + 'px',
            opacity: (index + 1) / trail.length,
            transform: `translate(-50%, -50%) scale(${(index + 1) / trail.length})`,
            transition: 'opacity 0.2s'
          }}
        />
      ))}
    </div>
  );
};

// --- 3D 悬浮粒子背景 ---
const ParticleField = () => {
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    animationDuration: Math.random() * 10 + 10 + 's',
    animationDelay: Math.random() * 5 + 's',
    size: Math.random() * 3 + 1 + 'px'
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white opacity-20 animate-float-particle"
          style={{
            left: p.left,
            top: '110%',
            width: p.size,
            height: p.size,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay
          }}
        />
      ))}
    </div>
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
      navigate('/chat');
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
    <div className="min-h-screen liquid-bg text-amber-50 relative selection:bg-amber-900 selection:text-amber-100 overflow-x-hidden" style={{ cursor: 'none' }}>
      <MagicCursor />
      <ParticleField />
      
      {/* 羊皮纸纹理覆盖层 */}
      <div className="fixed inset-0 parchment-texture z-[1]" />

      {/* Hero Section */}
      <header className="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-24">
        
        {/* 背景魔法阵 (CSS 装饰) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-amber-500/10 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-amber-500/20 rounded-full animate-[spin_40s_linear_infinite_reverse] rotate-45" />

        <RevealOnScroll>
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-black/30 backdrop-blur-md text-amber-300/80 text-xs tracking-[0.2em] uppercase">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>The Next Generation Intelligence</span>
            <Sparkles className="w-3 h-3 animate-pulse" />
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={200}>
          <h1 className="font-magic-title text-6xl md:text-9xl mb-6 bg-clip-text text-transparent bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            Powerful <br />
            <span className="text-4xl md:text-7xl italic font-serif text-amber-100/80">Agent</span>
          </h1>
        </RevealOnScroll>

        <RevealOnScroll delay={400}>
          <p className="max-w-2xl text-lg md:text-xl text-amber-100/60 leading-relaxed font-light mb-12 italic font-magic-body">
            "It does not just compute; it divines the answer. <br/>
            Unleash the alchemy of data and creativity with a single wave."
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={600}>
          <button 
            onClick={castSpell}
            className={`group relative px-12 py-4 bg-transparent overflow-hidden rounded-sm transition-all duration-300 ${spellCast ? 'scale-95' : 'hover:scale-105'}`}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="absolute inset-0 border border-amber-500/50 rounded-sm" />
            <div className="absolute inset-[3px] border border-amber-500/20 rounded-sm" />
            
            <span className="relative z-10 flex items-center gap-3 font-magic-title text-xl text-amber-200 group-hover:text-white transition-colors">
              <Wand2 className={`w-5 h-5 ${spellCast ? 'text-amber-100 animate-spin' : ''}`} />
              Awaken The Magic
            </span>
          </button>
        </RevealOnScroll>
      </header>

      {/* Feature Section (Liquid Glass Cards) */}
      <section className="relative z-10 py-32 px-4 max-w-7xl mx-auto">
        <RevealOnScroll>
          <div className="text-center mb-20">
            <h2 className="font-magic-title text-4xl md:text-5xl text-amber-100 mb-4">The Tri-Wizard Capabilities</h2>
            <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto" />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 card-container">
          {features.map((feature, idx) => (
            <RevealOnScroll key={idx} delay={idx * 200}>
              <div className="glass-card-magic p-8 rounded-xl h-full flex flex-col items-center text-center group relative overflow-hidden">
                {/* 悬停时的流光特效 */}
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-0 group-hover:animate-shine" />
                
                <div className="mb-6 p-4 rounded-full bg-amber-900/30 border border-amber-500/30 text-amber-300 group-hover:text-white group-hover:scale-110 group-hover:bg-amber-600/50 transition-all duration-500 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                  {feature.icon}
                </div>

                <h3 className="font-magic-title text-2xl mb-4 text-amber-100 group-hover:text-amber-300 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-amber-100/60 leading-relaxed font-light group-hover:text-amber-50 transition-colors font-magic-body">
                  {feature.description}
                </p>

                {/* 底部装饰纹理 */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-30" />
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* The "Orb" Interactive Section */}
      <section className="relative z-10 py-20 flex flex-col items-center justify-center overflow-hidden min-h-[80vh]">
        {/* 背景光晕 */}
        <div className="absolute w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6">
          <RevealOnScroll>
            <div className="relative group">
              {/* 全能球体模拟 */}
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-full relative mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/20 to-purple-900/60 blur-md animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border border-amber-500/30 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center backdrop-blur-sm shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] border border-white/10">
                   <div className="text-8xl text-amber-200/80 filter blur-[1px] animate-pulse">
                     <Zap className="w-32 h-32" />
                   </div>
                </div>
                {/* 悬浮粒子圈 */}
                <div className="absolute -inset-10 border border-dashed border-amber-500/10 rounded-full animate-[spin_20s_linear_infinite]" />
              </div>
            </div>
          </RevealOnScroll>

          <div className="space-y-8 text-left">
            <RevealOnScroll delay={200}>
              <h2 className="font-magic-title text-5xl text-white drop-shadow-lg">
                <span className="text-amber-400">Omniscient</span> Core
              </h2>
            </RevealOnScroll>
            
            <RevealOnScroll delay={300}>
              <p className="text-xl text-amber-100/70 italic border-l-2 border-amber-500/30 pl-6 font-magic-body">
                "Like the Pensieve of old, it holds memories of the entire web. Like the Time-Turner, it processes at speeds beyond comprehension."
              </p>
            </RevealOnScroll>

            <RevealOnScroll delay={400}>
              <div className="space-y-4">
                {[
                  { title: 'Alchemy of Code', desc: 'Transmute thoughts into functional reality.' },
                  { title: 'Sight of the Oracle', desc: 'Perceive images and understand their soul.' },
                  { title: 'Whispers of Babel', desc: 'Speak and translate every tongue of man.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-amber-500/20">
                    <div className="mt-1 min-w-[20px] h-[20px] rounded-full border border-amber-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    </div>
                    <div>
                      <h4 className="font-magic-title text-amber-200">{item.title}</h4>
                      <p className="text-sm text-gray-400 font-magic-body">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative z-10 py-24 text-center border-t border-amber-500/20 bg-[#05080f]">
        <RevealOnScroll>
          <div className="max-w-2xl mx-auto px-6">
            <Feather className="w-12 h-12 text-amber-500/50 mx-auto mb-6 rotate-45" />
            <h2 className="font-magic-title text-4xl mb-8 text-amber-100">Ready to begin your journey?</h2>
            <p className="text-amber-200/50 mb-10 font-serif italic text-lg font-magic-body">
              The parchment is blank. The quill is inked. <br/> The magic awaits your command.
            </p>
            <button 
            onClick={() => navigate('/chat')}
              className="px-10 py-3 bg-amber-600 hover:bg-amber-500 text-black font-magic-title font-bold tracking-widest rounded shadow-[0_0_30px_rgba(217,119,6,0.4)] hover:shadow-[0_0_50px_rgba(217,119,6,0.6)] transition-all transform hover:-translate-y-1"
            >
              Start Free Trial
            </button>
          </div>
          
          <div className="mt-20 text-amber-500/20 text-xs tracking-[0.3em] font-magic-title">
            Mischief Managed © 2024 Powerful AI
          </div>
        </RevealOnScroll>
      </footer>
    </div>
  );
}
