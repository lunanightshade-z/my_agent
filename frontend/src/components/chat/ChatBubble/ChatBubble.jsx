/**
 * Chat 页面聊天气泡组件 - 使用 CSS Modules 和主题系统
 * 支持思考过程、Markdown渲染、代码高亮、消息操作
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Edit2, X, Send, Brain, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import { cn } from '../../../styles/utils.js';
import { useTheme } from '../../shared/ThemeProvider';
import Button from '../../ui/Button.jsx';
import { Textarea } from '../../ui/Input.jsx';
import ToolCallCard from '../ToolCallCard/ToolCallCard';
import styles from './ChatBubble.module.css';

// Markdown 组件定义 - 提取为常量以在多个地方复用
const markdownComponents = {
  code({ node, inline, className, children, ...props }) {
    const classNameStr = className ? String(className) : '';
    const match = /language-(\w+)/.exec(classNameStr);
    
    // 只有明确是多行代码块才使用 SyntaxHighlighter
    if (!inline && match) {
      return (
        <div className={styles.codeBlockWrapper}>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match[1]}
            PreTag="div"
            className={styles.codeBlock}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
          <button
            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
            className={styles.codeCopyButton}
          >
            <Copy size={12} className={styles.codeCopyIcon} />
            复制
          </button>
        </div>
      );
    }
    
    // 其他情况都作为行内代码处理
    return (
      <code className={styles.inlineCode} {...props}>
        {children}
      </code>
    );
  },
  p: ({ children }) => (
    <p className={styles.paragraph}>{children}</p>
  ),
  h1: ({ children }) => <h1 className={styles.heading1}>{children}</h1>,
  h2: ({ children }) => <h2 className={styles.heading2}>{children}</h2>,
  h3: ({ children }) => <h3 className={styles.heading3}>{children}</h3>,
  ul: ({ children }) => (
    <ul className={styles.unorderedList}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className={styles.orderedList}>{children}</ol>
  ),
  li: ({ children, className: liClassName, checked, ...liProps }) => {
    // 处理任务列表
    if (liClassName && liClassName.includes('task-list-item')) {
      return (
        <li className={`${styles.listItem} ${styles.taskListItem}`} {...liProps}>
          <input
            type="checkbox"
            checked={checked}
            disabled
            className={styles.taskCheckbox}
            readOnly
          />
          <span>{children}</span>
        </li>
      );
    }
    return <li className={styles.listItem} {...liProps}>{children}</li>;
  },
  a: ({ children, href }) => (
    <a
      href={href}
      className={styles.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className={styles.strong}>{children}</strong>
  ),
  b: ({ children }) => (
    <b className={styles.bold}>{children}</b>
  ),
  em: ({ children }) => (
    <em>{children}</em>
  ),
  del: ({ children }) => (
    <del className={styles.strikethrough}>{children}</del>
  ),
  table: ({ children }) => (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children, ...props }) => <th {...props}>{children}</th>,
  td: ({ children, ...props }) => <td {...props}>{children}</td>,
};

const ChatBubble = ({
  message,
  messageIndex,
  isStreaming = false,
  onRegenerate,
  onEdit,
}) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const hasThinking = message.thinking && message.thinking.length > 0;
  const isThinking = message.isThinking || false;

  // 状态管理
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  // 复制到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 重新生成
  const handleRegenerate = () => {
    onRegenerate?.(messageIndex);
  };

  // 编辑消息
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(messageIndex, editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      className={cn(styles.container, isUser ? styles.containerUser : styles.containerAssistant, 'group')}
    >
      {/* 包装器：包含消息和按钮区域，用于 hover 检测 */}
      <div 
        className={cn(styles.hoverWrapper, isUser && styles.hoverWrapperUser)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 消息容器 */}
        <div className={cn(styles.messageWrapper, isUser && styles.messageWrapperUser)}>
        {/* 消息头 */}
        <div className={cn(styles.header, isUser ? styles.headerUser : styles.headerAssistant)}>
          <span className={cn(styles.roleLabel, isUser ? styles.roleLabelUser : styles.roleLabelAssistant)}>
            {isUser ? 'PROJECTION' : 'SUB CORTEX'}
          </span>
          {!isUser && <Zap size={10} className="text-yellow-200" />}
        </div>

        {/* 消息气泡 */}
        <div className={cn(styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant)}>
          {/* 装饰角 */}
          <div className={cn(styles.corner, styles.cornerTop, isUser ? styles.cornerTopRight : styles.cornerTopLeft)} />
          <div className={cn(styles.corner, styles.cornerBottom, isUser ? styles.cornerBottomRight : styles.cornerBottomLeft)} />

          {isUser ? (
            // 用户消息
            isEditing ? (
              <div className={styles.editContainer}>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className={styles.editActions}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    <X size={14} />
                    取消
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveEdit}
                  >
                    <Send size={14} />
                    保存
                  </Button>
                </div>
              </div>
            ) : (
              <p className={styles.userContent}>
                {message.content}
              </p>
            )
          ) : (
            // AI消息
            <div className={styles.aiContent}>
              {/* 思考过程 */}
              {hasThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={styles.thinking}
                >
                  <div className={styles.thinkingHeader}>
                    <Brain size={14} className={styles.thinkingIcon} />
                    <span className={styles.thinkingLabel}>深度思考</span>
                  </div>
                  <div className={styles.thinkingContent}>
                    <ReactMarkdown
                      className={styles.thinkingMarkdown}
                      remarkPlugins={[remarkMath, remarkGfm]}
                      rehypePlugins={[rehypeKatex]}
                      components={markdownComponents}
                    >
                      {message.thinking}
                    </ReactMarkdown>
                    {isThinking && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className={styles.thinkingCursor}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* 工具调用列表 */}
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className={styles.toolCallsContainer}>
                  {message.toolCalls.map((toolCall, index) => {
                    console.log('渲染工具调用:', toolCall);
                    return (
                      <ToolCallCard
                        key={toolCall.id || index}
                        toolCall={toolCall}
                        toolResult={toolCall.result}
                        isExecuting={toolCall.isExecuting}
                      />
                    );
                  })}
                </div>
              )}

              {/* 回答内容 */}
              {message.content && (
                <ReactMarkdown
                  className={styles.markdown}
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                  components={markdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              )}

              {/* 流式光标 */}
              {isStreaming && !isThinking && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={styles.streamingCursor}
                />
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {!isUser && isHovered && !isStreaming && !isEditing && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={styles.actionButtonsLeft}
          >
            <Button
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              title="复制"
              className={styles.actionButton}
            >
              {copied ? (
                <Check size={12} className={styles.actionButtonIconSuccess} />
              ) : (
                <Copy size={12} />
              )}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={handleRegenerate}
              title="重新生成"
              className={styles.actionButton}
            >
              <RefreshCw size={12} />
            </Button>
          </motion.div>
        )}

        {isUser && isHovered && !isStreaming && !isEditing && (
          <motion.div
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className={styles.actionButtonsRight}
          >
            <Button
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              title="复制"
              className={styles.actionButton}
            >
              {copied ? (
                <Check size={12} className={styles.actionButtonIconSuccess} />
              ) : (
                <Copy size={12} />
              )}
            </Button>
            {onEdit && (
              <Button
                size="xs"
                variant="ghost"
                onClick={handleEdit}
                title="编辑"
                className={styles.actionButton}
              >
                <Edit2 size={12} />
              </Button>
            )}
          </motion.div>
        )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
