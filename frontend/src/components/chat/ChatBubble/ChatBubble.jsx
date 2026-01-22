/**
 * Chat 页面聊天气泡组件 - 使用 CSS Modules 和主题系统
 * 支持思考过程、Markdown渲染、代码高亮、消息操作
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Edit2, X, Send, Brain, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../../styles/utils.js';
import { useTheme } from '../../shared/ThemeProvider';
import Button from '../../ui/Button.jsx';
import { Textarea } from '../../ui/Input.jsx';
import styles from './ChatBubble.module.css';

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
                    {message.thinking}
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

              {/* 回答内容 */}
              {message.content && (
                <ReactMarkdown
                  className={styles.markdown}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const classNameStr = className ? String(className) : '';
                      const match = /language-(\w+)/.exec(classNameStr);
                      return !inline && match ? (
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
                      ) : (
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
                    li: ({ children }) => <li className={styles.listItem}>{children}</li>,
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
                  }}
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
