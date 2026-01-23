/**
 * 工具调用卡片组件 - 高度审美设计
 * 集成动画、微交互、现代视觉设计
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ChevronDown, 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Code2,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import styles from './ToolCallCard.module.css';

const ToolCallCard = ({ toolCall, toolResult, isExecuting = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const toolName = toolCall?.tool_name || toolResult?.tool_name || 'unknown';
  const toolArguments = toolCall?.tool_arguments || {};
  const resultContent = toolResult?.content || toolResult || '';
  const hasResult = !!toolResult && (toolResult.content !== undefined || typeof toolResult === 'string');
  const isError = toolResult?.type === 'error' || 
                  (typeof resultContent === 'string' && (resultContent.includes('失败') || resultContent.includes('错误')));

  // 解析结果内容（可能是JSON字符串）
  let parsedResult = null;
  if (resultContent) {
    try {
      parsedResult = JSON.parse(resultContent);
    } catch (e) {
      parsedResult = resultContent;
    }
  }

  // 格式化参数显示
  const formatArguments = (args) => {
    if (!args || Object.keys(args).length === 0) return '无参数';
    return JSON.stringify(args, null, 2);
  };

  // 格式化结果显示
  const formatResult = (result) => {
    if (typeof result === 'string') {
      if (result.length > 500) {
        return result.substring(0, 500) + '\n... (内容已截断)';
      }
      return result;
    }
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  };

  // 复制到剪贴板
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 获取工具名称的显示文本（格式化）
  const getFormattedToolName = (name) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={styles.container}
    >
      {/* 工具调用头部 - 可点击 */}
      <motion.div
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(14, 165, 233, 0.02)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={styles.headerLeft}>
          {/* 工具图标 - 带动画 */}
          <motion.div
            className={styles.iconWrapper}
            animate={isExecuting ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={isExecuting ? {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          >
            {isExecuting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={18} className={styles.iconLoading} />
              </motion.div>
            ) : isError ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <XCircle size={18} className={styles.iconError} />
              </motion.div>
            ) : hasResult ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
              >
                <CheckCircle2 size={18} className={styles.iconSuccess} />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap size={18} className={styles.iconDefault} />
              </motion.div>
            )}
          </motion.div>

          {/* 工具名称 */}
          <motion.span 
            className={styles.toolName}
            layout
          >
            {getFormattedToolName(toolName)}
          </motion.span>

          {/* 状态标签 */}
          <AnimatePresence>
            {isExecuting && (
              <motion.span
                className={styles.statusBadge}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  ⏳ 执行中
                </motion.span>
              </motion.span>
            )}
            {hasResult && !isExecuting && (
              <motion.span
                className={`${styles.statusBadge} ${isError ? styles.statusError : styles.statusSuccess}`}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {isError ? '❌ 失败' : '✓ 完成'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* 展开/折叠按钮 */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className={styles.chevron} />
        </motion.div>
      </motion.div>

      {/* 展开内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={styles.content}
          >
            {/* 工具参数 */}
            {toolCall && Object.keys(toolArguments).length > 0 && (
              <motion.div
                className={styles.section}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className={styles.sectionHeader}>
                  <Code2 size={16} className={styles.sectionIcon} />
                  <span className={styles.sectionTitle}>📥 调用参数</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <pre className={styles.codeBlock}>
                    {formatArguments(toolArguments)}
                  </pre>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopy(formatArguments(toolArguments))}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '6px 10px',
                      background: 'rgba(14, 165, 233, 0.1)',
                      border: '1px solid rgba(14, 165, 233, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      color: '#0284c7',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>复制</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* 执行结果 */}
            {hasResult && (
              <motion.div
                className={styles.section}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className={styles.sectionHeader}>
                  {isError ? (
                    <>
                      <XCircle size={16} className={styles.sectionIconError} />
                      <span className={styles.sectionTitle}>❌ 执行结果</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} className={styles.sectionIconSuccess} />
                      <span className={styles.sectionTitle}>✓ 执行结果</span>
                    </>
                  )}
                </div>
                <div className={styles.resultContent}>
                  {typeof parsedResult === 'object' && parsedResult !== null ? (
                    <div style={{ position: 'relative' }}>
                      <pre className={styles.codeBlock}>
                        {formatResult(parsedResult)}
                      </pre>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCopy(formatResult(parsedResult))}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          padding: '6px 10px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          color: '#059669',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {copied ? (
                          <>
                            <Check size={14} />
                            <span>已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>复制</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  ) : (
                    <motion.div
                      className={styles.resultText}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {formatResult(parsedResult)}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* 执行中提示 */}
            {isExecuting && !hasResult && (
              <motion.div
                className={styles.section}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className={styles.executingHint}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Loader2 size={16} className={styles.executingIcon} />
                  </motion.div>
                  <span>工具正在执行中，请稍候...</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight size={12} style={{ marginLeft: '4px' }} />
                  </motion.span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ToolCallCard;
