/**
 * 快捷按键组件
 * 显示预设的快捷问题，点击即可发送
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const QuickActions = ({ actions, onActionClick, disabled = false, theme = 'chat' }) => {
  if (!actions || actions.length === 0) return null;

  // 根据主题选择样式
  const isChatTheme = theme === 'chat';
  
  const containerClass = isChatTheme
    ? 'flex flex-wrap gap-3'
    : 'flex flex-wrap gap-3';
  
  const buttonBaseClass = isChatTheme
    ? 'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer border backdrop-blur-md'
    : 'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer border backdrop-blur-md';
  
  const buttonClass = isChatTheme
    ? `${buttonBaseClass} bg-white/10 hover:bg-white/20 border-amber-500/20 hover:border-amber-500/40 text-amber-100 hover:text-amber-50 hover:scale-105 active:scale-95`
    : `${buttonBaseClass} bg-white/50 hover:bg-white/70 border-teal-200/50 hover:border-teal-300/70 text-slate-600 hover:text-slate-700 hover:scale-105 active:scale-95`;

  return (
    <div className={containerClass}>
      {actions.map((action, index) => (
        <motion.button
          key={index}
          onClick={() => !disabled && onActionClick(action)}
          disabled={disabled}
          className={`${buttonClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} max-w-full`}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span className="flex items-center gap-2 flex-wrap">
            <Zap size={14} className={`flex-shrink-0 ${isChatTheme ? 'text-amber-400' : 'text-teal-500'}`} />
            <span className="text-left break-words">{action}</span>
          </span>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickActions;
