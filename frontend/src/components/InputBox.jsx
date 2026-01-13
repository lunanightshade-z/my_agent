/**
 * 输入框组件
 * 支持 Enter 发送、thinking 模式切换、快捷指令、输入历史
 */
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Sparkles, Command, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleThinking, addToInputHistory } from '../store/store';

// 快捷指令列表
const SLASH_COMMANDS = [
  { cmd: '/summarize', desc: '总结上述内容', icon: '📝' },
  { cmd: '/translate', desc: '翻译成英文', icon: '🌐' },
  { cmd: '/code', desc: '写一段代码', icon: '💻' },
  { cmd: '/explain', desc: '详细解释', icon: '📚' },
  { cmd: '/improve', desc: '优化改进', icon: '✨' },
  { cmd: '/continue', desc: '请继续', icon: '➡️' },
];

const InputBox = ({ onSend, disabled }) => {
  const dispatch = useDispatch();
  const { thinkingEnabled, inputHistory } = useSelector((state) => state.chat);
  const [inputValue, setInputValue] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef(null);

  // 监听输入变化,检测是否输入了 /
  useEffect(() => {
    if (inputValue.startsWith('/') && inputValue.length > 0) {
      setShowCommands(true);
      setSelectedCommandIndex(0);
    } else {
      setShowCommands(false);
    }
  }, [inputValue]);

  // 过滤匹配的指令
  const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
    cmd.cmd.toLowerCase().includes(inputValue.toLowerCase())
  );

  // 处理发送
  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      dispatch(addToInputHistory(inputValue));
      onSend(inputValue);
      setInputValue('');
      setHistoryIndex(-1);
    }
  };

  // 处理键盘事件
  const handleKeyDown = (e) => {
    // Enter 发送(不含 Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showCommands && filteredCommands.length > 0) {
        // 选择指令
        handleSelectCommand(filteredCommands[selectedCommandIndex]);
      } else {
        handleSend();
      }
    }
    
    // 快捷指令菜单导航
    if (showCommands) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'Escape') {
        setShowCommands(false);
      }
    } else {
      // 输入历史导航
      if (e.key === 'ArrowUp' && inputHistory.length > 0) {
        e.preventDefault();
        const newIndex = historyIndex < inputHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInputValue(inputHistory[newIndex]);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInputValue(inputHistory[newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInputValue('');
        }
      }
    }
  };

  // 选择指令
  const handleSelectCommand = (command) => {
    setInputValue(command.cmd + ' ');
    setShowCommands(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="bg-transparent space-y-3">
      {/* 输入框容器 - 悬浮控制台风格 */}
      <div className="relative group transition-all">
        <div className="rounded-3xl p-2 flex flex-col gap-2 relative group transition-all border"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          
          {/* 顶部工具条：Thinking模式 */}
          <div className="flex justify-between items-center px-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleThinking())}
              className={`
                flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300
                ${thinkingEnabled
                  ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'
                }
              `}
            >
              <Sparkles size={14} />
              <span>深度思考</span>
            </motion.button>
          </div>
          {/* 输入区域 */}
          <div className="relative px-2">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={disabled ? '正在接收回复...' : '输入指令...'}
              rows={1}
              className="w-full bg-transparent text-gray-100 placeholder-gray-600 text-sm md:text-base px-4 py-3 focus:outline-none resize-none h-14 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                minHeight: '56px',
                maxHeight: '120px',
                height: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
            <div className="absolute right-4 bottom-3 flex items-center gap-3">
              <button 
                className="text-gray-500 hover:text-white transition-colors"
                disabled={disabled}
              >
                <Paperclip size={18} />
              </button>
              <motion.button
                whileHover={{ scale: disabled || !inputValue.trim() ? 1 : 1.1 }}
                whileTap={{ scale: disabled || !inputValue.trim() ? 1 : 0.9 }}
                onClick={handleSend}
                disabled={disabled || !inputValue.trim()}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${inputValue.trim() && !disabled
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/50 scale-100'
                    : 'bg-white/5 text-gray-600 scale-95'
                  }
                `}
              >
                <Send size={18} className={inputValue.trim() && !disabled ? 'translate-x-0.5 -translate-y-0.5' : ''} />
              </motion.button>
            </div>
          </div>
          
          {/* 底部光效条 */}
          <div className="absolute -bottom-[1px] left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>
    </div>
  );
};

export default InputBox;

