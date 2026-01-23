/**
 * Chat 页面输入框容器组件 - 使用 CSS Modules 和主题系统
 * 支持Thinking模式切换、快捷指令、输入历史
 */
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Sparkles, Paperclip, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../styles/utils.js';
import { useTheme } from '../../shared/ThemeProvider';
import { toggleThinking, addToInputHistory } from '../../../store/store';
import { Textarea } from '../../ui/Input.jsx';
import Button from '../../ui/Button.jsx';
import styles from './InputContainer.module.css';

const SLASH_COMMANDS = [
  { cmd: '/summarize', desc: '总结内容', icon: '📝' },
  { cmd: '/translate', desc: '翻译成英文', icon: '🌐' },
  { cmd: '/code', desc: '写一段代码', icon: '💻' },
  { cmd: '/explain', desc: '详细解释', icon: '📚' },
  { cmd: '/improve', desc: '优化改进', icon: '✨' },
  { cmd: '/continue', desc: '请继续', icon: '➡️' },
];

const InputContainer = ({ onSend, disabled = false }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
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
    <div className={styles.container}>
      {/* 指令菜单 */}
      <AnimatePresence>
        {showCommands && filteredCommands.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={styles.commandMenu}
          >
            <div className={styles.commandMenuContent}>
              {filteredCommands.map((cmd, idx) => (
                <button
                  key={cmd.cmd}
                  onClick={() => handleSelectCommand(cmd)}
                  className={cn(
                    styles.commandItem,
                    idx === selectedCommandIndex && styles.commandItemActive
                  )}
                >
                  <span>{cmd.icon}</span>
                  <div className={styles.commandItemContent}>
                    <div className={styles.commandItemName}>{cmd.cmd}</div>
                    <div className={styles.commandItemDesc}>{cmd.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 输入框容器 */}
      <div className={styles.inputWrapper}>
        <div className={cn(styles.inputContainer, thinkingEnabled && !disabled && styles.inputContainerActive)}>
          {/* 顶部工具条 */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <button
                className={styles.attachButton}
                disabled={disabled}
                title="上传文件"
              >
                <Paperclip size={18} />
              </button>
              <button
                className={styles.attachButton}
                disabled={disabled}
                title="工具箱"
              >
                <Box size={18} />
              </button>
            </div>

            {/* Deep Thought Toggle - Mechanical Switch Look */}
            <div 
              onClick={() => dispatch(toggleThinking())}
              className={cn(styles.deepThoughtToggle, thinkingEnabled && styles.deepThoughtToggleActive)}
            >
              <span className={cn(styles.deepThoughtLabel, thinkingEnabled && styles.deepThoughtLabelActive)}>
                Deep Thought
              </span>
              <div className={cn(styles.toggleSwitch, thinkingEnabled && styles.toggleSwitchActive)}>
                <div className={cn(styles.toggleThumb, thinkingEnabled && styles.toggleThumbActive)} />
              </div>
            </div>
          </div>

          {/* 输入区域 */}
          <div className={styles.inputArea}>
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder="Insert idea..."
              autoExpand
              className={styles.textarea}
              rows={1}
            />

            <button
              onClick={handleSend}
              disabled={disabled || !inputValue.trim()}
              className={cn(
                styles.sendButton,
                inputValue.trim() && !disabled && styles.sendButtonActive
              )}
              title="发送"
            >
              {thinkingEnabled ? <Sparkles size={20} /> : <Send size={20} />}
            </button>
          </div>

          {/* 底部光效 */}
          <div className={styles.glowEffect} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(InputContainer);
