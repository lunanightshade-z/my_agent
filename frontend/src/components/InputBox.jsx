/**
 * 输入框组件
 * 支持 Enter 发送、thinking 模式切换、快捷指令、输入历史
 */
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Sparkles, Command } from 'lucide-react';
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
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Thinking 模式开关 */}
        <div className="flex items-center gap-2 mb-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleThinking())}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${thinkingEnabled
                ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <Sparkles size={16} />
            <span>深度思考</span>
          </motion.button>
          {thinkingEnabled && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-gray-500"
            >
              AI 将进行更深入的思考
            </motion.span>
          )}
        </div>

        {/* 输入框 */}
        <div className="flex gap-3 items-end relative">
          {/* 快捷指令菜单 */}
          <AnimatePresence>
            {showCommands && filteredCommands.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
              >
                <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                  <Command size={14} />
                  <span>快捷指令</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredCommands.map((command, index) => (
                    <motion.button
                      key={command.cmd}
                      onClick={() => handleSelectCommand(command)}
                      className={`
                        w-full px-3 py-2 text-left flex items-center gap-3 hover:bg-mint-50 transition-colors
                        ${index === selectedCommandIndex ? 'bg-mint-50' : ''}
                      `}
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-2xl">{command.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{command.cmd}</div>
                        <div className="text-xs text-gray-500">{command.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                  <span>↑↓ 选择 • Enter 确认 • Esc 关闭</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={disabled ? '正在接收回复...' : '输入消息...（/ 快捷指令，↑↓ 历史记录，Enter 发送，Shift+Enter 换行）'}
              rows={1}
              className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-mint-400 resize-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              style={{
                minHeight: '48px',
                maxHeight: '120px',
                height: 'auto',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
            />
          </div>

          {/* 发送按钮 */}
          <motion.button
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={handleSend}
            disabled={disabled || !inputValue.trim()}
            className={`
              p-3 rounded-2xl transition-all duration-200 shadow-md
              ${disabled || !inputValue.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-mint-400 to-sky-fresh-400 text-white hover:shadow-lg'
              }
            `}
          >
            <Send size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default InputBox;

