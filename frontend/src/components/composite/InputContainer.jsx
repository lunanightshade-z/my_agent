/**
 * 输入框容器组件 - 赛博朋克风格
 * 支持Thinking模式切换、快捷指令、输入历史
 */
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Sparkles, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../styles/utils.js';
import { toggleThinking, addToInputHistory } from '../../store/store';
import { Textarea } from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';


const SLASH_COMMANDS = [
  { cmd: '/summarize', desc: '总结内容', icon: '📝' },
  { cmd: '/translate', desc: '翻译成英文', icon: '🌐' },
  { cmd: '/code', desc: '写一段代码', icon: '💻' },
  { cmd: '/explain', desc: '详细解释', icon: '📚' },
  { cmd: '/improve', desc: '优化改进', icon: '✨' },
  { cmd: '/continue', desc: '请继续', icon: '➡️' },
];

const InputContainer= ({ onSend, disabled = false }) => {
  const dispatch = useDispatch();
  const { thinkingEnabled, inputHistory } = useSelector(state => state.chat);
  const [inputValue, setInputValue] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const textareaRef = useRef(null);

  // 监听输入变化
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

  // 发送消息
  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      dispatch(addToInputHistory(inputValue));
      onSend(inputValue);
      setInputValue('');
      setHistoryIndex(-1);
    }
  };

  // 键盘事件处理
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showCommands && filteredCommands.length > 0) {
        handleSelectCommand(filteredCommands[selectedCommandIndex]);
      } else {
        handleSend();
      }
    }

    // 快捷指令菜单导航
    if (showCommands) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
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
    <div className="bg-transparent space-y-3 relative z-10">
      {/* 指令菜单 */}
      <AnimatePresence>
        {showCommands && filteredCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-32 left-6 right-6 max-w-2xl backdrop-blur-xl bg-white/8 border border-elite-gold/30 rounded-xl overflow-hidden shadow-xl"
          >
            <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.cmd}
                  onClick={() => handleSelectCommand(cmd)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-all',
                    idx === selectedCommandIndex
                      ? 'bg-elite-gold/20 border border-elite-gold/50 text-elite-champagne'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
                  )}
                >
                  <span>{cmd.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-mono">{cmd.cmd}</div>
                    <div className="text-xs text-gray-500">{cmd.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入框容器 */}
      <div className="group transition-all">
        <div
          className="rounded-2xl p-4 flex flex-col gap-3 relative"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            boxShadow:
              thinkingEnabled && !disabled
                ? '0 0 20px rgba(212, 175, 55, 0.15)'
                : '0 0 20px rgba(212, 175, 55, 0.1)',
            transition: 'all 0.3s ease-out',
          }}
        >
          {/* 顶部工具条 */}
          <div className="flex justify-between items-center px-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch(toggleThinking())}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
                thinkingEnabled
                  ? 'bg-elite-gold/20 text-elite-gold border border-elite-gold/50'
                  : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10 hover:text-gray-400'
              )}
            >
              <Sparkles size={14} />
              <span>深度思考</span>
            </motion.button>
          </div>

          {/* 输入区域 */}
          <div className="relative flex items-end gap-3">
            <button
              className="p-2 text-gray-500 hover:text-elite-gold hover:bg-white/5 rounded-lg transition-all disabled:opacity-50"
              disabled={disabled}
              title="上传文件"
            >
              <Paperclip size={18} />
            </button>

            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={
                disabled ? '正在接收回复...' : thinkingEnabled ? '输入复杂问题...' : '输入指令...'
              }
              autoExpand
              className="flex-1 !border-none !bg-transparent !shadow-none text-gray-100 placeholder-gray-600"
              rows={1}
            />

            <motion.button
              whileHover={{ scale: disabled || !inputValue.trim() ? 1 : 1.1 }}
              whileTap={{ scale: disabled || !inputValue.trim() ? 1 : 0.9 }}
              onClick={handleSend}
              disabled={disabled || !inputValue.trim()}
              className={cn(
                'p-2.5 rounded-lg flex items-center justify-center transition-all duration-300',
                inputValue.trim() && !disabled
                  ? 'bg-gradient-to-r from-elite-gold to-elite-champagne text-black shadow-lg shadow-elite-gold/30 hover:shadow-elite-gold/50'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              )}
              title="发送"
            >
              <Send size={18} />
            </motion.button>
          </div>

          {/* 底部提示 */}
          <div className="text-center text-[10px] text-gray-600 font-mono opacity-70">
            SYNTH OS v2.0 • SECURE CONNECTION
          </div>

          {/* 底部光效 */}
          <div className="absolute -bottom-[1px] left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-elite-gold/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      </div>
    </div>
  );
};

export default InputContainer;
