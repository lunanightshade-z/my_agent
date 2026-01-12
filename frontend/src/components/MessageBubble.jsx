/**
 * 消息气泡组件
 * 支持 Markdown 渲染和代码高亮
 * 支持消息操作:复制、重新生成、编辑
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Brain, Copy, Check, RefreshCw, Edit2, X, Send } from 'lucide-react';
import { useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { addToast } from '../store/store';

const MessageBubble = ({ message, isStreaming, onRegenerate, onEdit, messageIndex }) => {
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
      dispatch(addToast({
        type: 'success',
        message: '已复制到剪贴板',
        duration: 2000,
      }));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: '复制失败',
        duration: 2000,
      }));
    }
  };
  
  // 重新生成
  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(messageIndex);
      dispatch(addToast({
        type: 'info',
        message: '正在重新生成回答...',
        duration: 2000,
      }));
    }
  };
  
  // 开始编辑
  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };
  
  // 保存编辑
  const handleSaveEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(messageIndex, editContent.trim());
      setIsEditing(false);
      dispatch(addToast({
        type: 'success',
        message: '消息已更新',
        duration: 2000,
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 10 }}
      className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* AI 头像（左侧） */}
      {!isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-aurora-300 via-fresh-sky-400 to-lavender-500 flex items-center justify-center shadow-glow-blue">
          <Bot size={18} className="text-white" />
        </div>
      )}

      {/* 消息内容区域 */}
      <div className="flex flex-col max-w-[70%]">
        {/* 消息气泡 */}
        <div
          className={`
            rounded-3xl px-5 py-4 shadow-floating backdrop-blur-sm transition-all duration-300
            ${isUser
              ? 'bg-gradient-to-r from-aurora-300 via-fresh-sky-400 to-lavender-500 text-white shadow-glow-aurora animate-jelly'
              : 'glass-lg text-text-primary border border-white/30'
            }
          `}
        >
          {isUser ? (
            // 用户消息（纯文本或编辑模式）
            isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-white/40 bg-white/20 backdrop-blur-sm focus:outline-none focus:border-aurora-300 focus:shadow-glow-aurora resize-none text-text-primary"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm rounded-lg bg-white/20 text-text-secondary hover:bg-white/30 transition-colors"
                  >
                    <X size={14} className="inline mr-1" />
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-aurora-300 to-fresh-sky-400 text-white hover:shadow-glow-aurora transition-all"
                  >
                    <Send size={14} className="inline mr-1" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )
          ) : (
            // AI 消息（Markdown 渲染）
            <div className="markdown-body prose prose-sm max-w-none">
              {/* 思考过程区域 */}
              {hasThinking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-lavender-300/30 to-lavender-400/20 border border-lavender-300/50 shadow-glow-purple"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-lavender-400 animate-pulse" />
                    <span className="text-xs font-semibold text-lavender-500">深度思考中...</span>
                  </div>
                  <div className="text-sm text-text-primary whitespace-pre-wrap break-words font-mono leading-relaxed">
                    {message.thinking}
                    {isThinking && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-3 bg-lavender-400 ml-1 align-middle rounded-sm"
                      />
                    )}
                  </div>
                </motion.div>
              )}
              
              {/* 回答内容 */}
              {message.content && (
                <ReactMarkdown
                  components={{
                    // 代码块渲染
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="relative group my-3 rounded-xl overflow-hidden">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-xl"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                          {/* 代码块复制按钮 */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              dispatch(addToast({
                                type: 'success',
                                message: '代码已复制',
                                duration: 2000,
                              }));
                            }}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs hover:bg-white/30 font-medium"
                          >
                            <Copy size={12} className="inline mr-1" />
                            复制代码
                          </button>
                        </div>
                      ) : (
                        <code className="bg-white/20 text-fresh-sky-400 px-2 py-1 rounded-lg text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // 段落
                    p: ({ children }) => <p className="mb-3 last:mb-0 text-text-primary leading-relaxed">{children}</p>,
                    // 标题
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-text-primary gradient-text">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-3 text-text-primary">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-text-primary">{children}</h3>,
                    // 列表
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-text-primary space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 text-text-primary space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    // 链接
                    a: ({ children, href }) => (
                      <a href={href} className="text-fresh-sky-400 hover:text-aurora-300 underline transition-colors" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
              
              {/* 流式输入中的光标效果（仅在回答内容时显示） */}
              {isStreaming && !isThinking && message.content && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-aurora-300 ml-1 rounded-sm"
                />
              )}
            </div>
          )}
        </div>
        
        {/* 操作按钮（悬停显示） */}
        {isHovered && !isStreaming && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 mt-3"
          >
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/20 hover:bg-white/30 text-text-secondary hover:text-text-primary transition-all duration-300 backdrop-blur-sm"
              title="复制消息"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  <span className="text-green-400 font-medium">已复制</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>复制</span>
                </>
              )}
            </button>
            
            {/* AI 消息:重新生成按钮 */}
            {!isUser && onRegenerate && (
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/20 hover:bg-white/30 text-text-secondary hover:text-text-primary transition-all duration-300 backdrop-blur-sm"
                title="重新生成回答"
              >
                <RefreshCw size={12} />
                <span>重新生成</span>
              </button>
            )}
            
            {/* 用户消息:编辑按钮 */}
            {isUser && onEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/20 hover:bg-white/30 text-text-secondary hover:text-text-primary transition-all duration-300 backdrop-blur-sm"
                title="编辑消息"
              >
                <Edit2 size={12} />
                <span>编辑</span>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* 用户头像（右侧） */}
      {isUser && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-pink-accent-400 via-aurora-300 to-fresh-sky-400 flex items-center justify-center shadow-glow-pink">
          <User size={18} className="text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;

