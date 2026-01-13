/**
 * 聊天气泡组件 - 赛博朋克风格
 * 支持思考过程、Markdown渲染、代码高亮、消息操作
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, RefreshCw, Edit2, X, Send, Brain } from 'lucide-react';
import { useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '../../styles/utils.js';
import { colors } from '../../styles/tokens.js';
import Button from '../ui/Button.jsx';
import { Textarea } from '../ui/Input.jsx';



const ChatBubble= ({
  message,
  messageIndex,
  isStreaming = false,
  onRegenerate,
  onEdit,
}) => {
  const dispatch = useDispatch();
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

  // 气泡样式 - 金色系统一
  const bubbleStyle = isUser
    ? {
        background: `linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(232, 217, 195, 0.05) 100%)`,
        borderRight: `2px solid rgba(212, 175, 55, 0.4)`,
      }
    : {
        background: `linear-gradient(135deg, rgba(184, 115, 51, 0.12) 0%, rgba(212, 175, 55, 0.08) 100%)`,
        borderLeft: `2px solid rgba(212, 175, 55, 0.35)`,
      };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      className={cn('flex w-full mb-6', isUser ? 'justify-end' : 'justify-start', 'group')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 消息容器 */}
      <div className={cn('flex flex-col max-w-[80%]', isUser && 'items-end')}>
        {/* 消息头 */}
        <div
          className={cn(
            'flex items-center gap-2 mb-2 text-xs font-mono',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className={cn(isUser ? 'text-elite-gold' : 'text-elite-champagne', 'font-semibold tracking-wider')}>
            {isUser ? 'YOU' : 'SYNTH'}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-gray-600 text-[10px]">{new Date().toLocaleTimeString()}</span>
        </div>

        {/* 消息气泡 */}
        <div
          className="relative p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:backdrop-blur-md"
          style={{
            ...bubbleStyle,
            border: '1px solid rgba(212, 175, 55, 0.2)',
          }}
        >
          {/* 装饰角 */}
          <div
            className={cn(
              'absolute top-0 w-3 h-3 border-t border-white/20',
              isUser ? 'right-0 border-r rounded-tr-xl' : 'left-0 border-l rounded-tl-xl'
            )}
          />
          <div
            className={cn(
              'absolute bottom-0 w-3 h-3 border-b border-white/20',
              isUser ? 'right-0 border-r rounded-br-xl' : 'left-0 border-l rounded-bl-xl'
            )}
          />

          {isUser ? (
            // 用户消息
            isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
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
              <p className="text-gray-200 leading-7 font-light text-sm whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )
          ) : (
            // AI消息
            <div className="space-y-3">
              {/* 思考过程 */}
              {hasThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-xl bg-elite-gold/10 border border-elite-gold/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={14} className="text-elite-champagne animate-pulse" />
                    <span className="text-xs font-mono text-elite-champagne">深度思考</span>
                  </div>
                  <div className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                    {message.thinking}
                    {isThinking && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-1 h-3 bg-elite-gold ml-1 rounded-sm"
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* 回答内容 */}
              {message.content && (
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      // 安全处理 className，确保是字符串类型
                      const classNameStr = className ? String(className) : '';
                      const match = /language-(\w+)/.exec(classNameStr);
                      return !inline && match ? (
                        <div className="relative group my-2 rounded-lg overflow-hidden">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-lg !m-0"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                          <button
                            onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30 transition-all"
                          >
                            <Copy size={12} className="inline mr-1" />
                            复制
                          </button>
                        </div>
                      ) : (
                        <code
                          className="bg-elite-gold/20 text-elite-champagne px-2 py-1 rounded text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => (
                      <p className="text-gray-200 leading-relaxed text-sm mb-2 last:mb-0">{children}</p>
                    ),
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-100">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-100">{children}</h2>,
                    h3: ({ children }) => <h3 className="font-bold mb-1 text-gray-100">{children}</h3>,
                    ul: ({ children }) => (
                      <ul className="list-disc pl-4 mb-2 text-gray-200 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 mb-2 text-gray-200 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => <li className="text-sm">{children}</li>,
                    a: ({ children, href }) => (
                      <a
                        href={href}
                        className="text-elite-gold hover:text-elite-champagne underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
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
                  className="inline-block w-1 h-4 bg-elite-gold ml-1 rounded-sm"
                />
              )}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        {!isUser && isHovered && !isStreaming && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-2"
          >
            <Button
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              title="复制"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
              ) : (
                <Copy size={12} />
              )}
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={handleRegenerate}
              title="重新生成"
            >
              <RefreshCw size={12} />
            </Button>
          </motion.div>
        )}

        {isUser && isHovered && !isStreaming && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mt-2"
          >
            <Button
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              title="复制"
            >
              {copied ? (
                <Check size={12} className="text-green-400" />
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
              >
                <Edit2 size={12} />
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;
