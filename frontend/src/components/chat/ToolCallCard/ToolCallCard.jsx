/**
 * 工具调用卡片组件
 * 支持展开/折叠、动画效果、显示工具执行结果
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ChevronDown, ChevronUp, CheckCircle2, Loader2, XCircle, Code2 } from 'lucide-react';
import styles from './ToolCallCard.module.css';

const ToolCallCard = ({ toolCall, toolResult, isExecuting = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
      // 不是JSON，保持原样
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
      // 尝试截取前500字符
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={styles.container}
    >
      {/* 工具调用头部 - 可点击 */}
      <motion.div
        className={styles.header}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={styles.headerLeft}>
          {/* 工具图标 - 带动画 */}
          <motion.div
            className={styles.iconWrapper}
            animate={isExecuting ? {
              rotate: [0, 360],
            } : {}}
            transition={isExecuting ? {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            } : {}}
          >
            {isExecuting ? (
              <Loader2 size={16} className={styles.iconLoading} />
            ) : isError ? (
              <XCircle size={16} className={styles.iconError} />
            ) : hasResult ? (
              <CheckCircle2 size={16} className={styles.iconSuccess} />
            ) : (
              <Wrench size={16} className={styles.iconDefault} />
            )}
          </motion.div>

          {/* 工具名称 */}
          <span className={styles.toolName}>
            {toolName}
          </span>

          {/* 状态标签 */}
          {isExecuting && (
            <motion.span
              className={styles.statusBadge}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              执行中...
            </motion.span>
          )}
          {hasResult && !isExecuting && (
            <span className={`${styles.statusBadge} ${isError ? styles.statusError : styles.statusSuccess}`}>
              {isError ? '执行失败' : '执行完成'}
            </span>
          )}
        </div>

        {/* 展开/折叠按钮 */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={16} className={styles.chevron} />
        </motion.div>
      </motion.div>

      {/* 展开内容 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={styles.content}
          >
            {/* 工具参数 */}
            {toolCall && Object.keys(toolArguments).length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Code2 size={14} className={styles.sectionIcon} />
                  <span className={styles.sectionTitle}>调用参数</span>
                </div>
                <pre className={styles.codeBlock}>
                  {formatArguments(toolArguments)}
                </pre>
              </div>
            )}

            {/* 执行结果 */}
            {hasResult && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  {isError ? (
                    <XCircle size={14} className={styles.sectionIconError} />
                  ) : (
                    <CheckCircle2 size={14} className={styles.sectionIconSuccess} />
                  )}
                  <span className={styles.sectionTitle}>执行结果</span>
                </div>
                <div className={styles.resultContent}>
                  {typeof parsedResult === 'object' && parsedResult !== null ? (
                    <pre className={styles.codeBlock}>
                      {formatResult(parsedResult)}
                    </pre>
                  ) : (
                    <div className={styles.resultText}>
                      {formatResult(parsedResult)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 执行中提示 */}
            {isExecuting && !hasResult && (
              <div className={styles.section}>
                <div className={styles.executingHint}>
                  <Loader2 size={14} className={styles.executingIcon} />
                  <span>工具正在执行中，请稍候...</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ToolCallCard;
