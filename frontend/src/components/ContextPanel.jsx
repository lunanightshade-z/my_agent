/**
 * 右侧上下文面板组件 (Neural State)
 * 显示当前对话的上下文信息、关键实体、系统状态
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Aperture, Activity } from 'lucide-react';

const ContextPanel = () => {
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="hidden lg:flex flex-col w-80 h-full gap-0">
      <div className="flex-1 rounded-r-3xl p-5 flex flex-col relative overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0 1.5rem 1.5rem 0'
        }}
      >
        {/* 装饰性背景 */}
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Aperture className="text-purple-500 animate-spin-slow" size={60} />
        </div>

        {/* 标题 */}
        <h3 className="text-gray-400 text-xs font-mono tracking-widest mb-6 uppercase flex items-center gap-2 relative z-10">
          <Zap size={14} className="text-yellow-500" />
          Neural State
        </h3>

        {/* Tab切换 */}
        <div className="flex gap-2 mb-6 relative z-10">
          {['summary', 'entities'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs rounded-lg transition-all ${
                activeTab === tab 
                ? 'bg-white/10 text-white shadow-lg' 
                : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
          }}
        >
          {activeTab === 'summary' ? (
            <>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-black/20 border border-white/5"
              >
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  <span className="text-purple-400 font-mono text-[10px] block mb-1">CURRENT FOCUS</span>
                  正在讨论聊天界面的赛博朋克风格重构,重点在于深色主题与未来科技美学的结合。
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-3 rounded-lg bg-black/20 border border-white/5"
              >
                <p className="text-xs text-gray-300 leading-relaxed font-light">
                  <span className="text-cyan-400 font-mono text-[10px] block mb-1">KEY INSIGHT</span>
                  用户偏向于深色模式与非线性布局的结合,摒弃传统气泡设计。
                </p>
              </motion.div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-2"
            >
              {['React', 'Tailwind', 'Docker', 'Cyberpunk', 'Neural UI'].map((tag, i) => (
                <motion.span 
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 hover:bg-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
                >
                  #{tag}
                </motion.span>
              ))}
            </motion.div>
          )}
        </div>

        {/* 底部可视化数据装饰 */}
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-2 relative z-10">
          <div className="text-center">
            <div className="text-[10px] text-gray-500 mb-1 font-mono">Load</div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '40%' }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-green-500"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 mb-1 font-mono">Tokens</div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                className="h-full bg-purple-500"
              />
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-gray-500 mb-1 font-mono">Ping</div>
            <div className="text-[10px] text-white font-mono">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                12ms
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContextPanel;
