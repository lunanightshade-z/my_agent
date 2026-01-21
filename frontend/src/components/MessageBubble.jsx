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
import { Prism } from 'react-syntax-highlighter';
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
      className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} group animate-fade-in-up`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 消息内容区域 */}
      <div className={`flex flex-col max-w-[80%] relative ${isUser ? 'pl-10' : 'pr-10'}`}>
        
        {/* 消息元数据 */}
        <div className={`flex items-center gap-3 mb-2 text-xs font-mono ${isUser ? 'flex-row-reverse text-right' : 'flex-row'}`}>
          <span className={`${isUser ? "text-cyan-400" : "text-purple-400"} font-semibold tracking-wider`}>
            {isUser ? "OPERATOR" : "SYNTH_AI"}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
          <span className="text-gray-500">{new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit', second: '2-digit'})}</span>
        </div>

        {/* 消息体设计：摒弃气泡，使用左/右侧强调线 */}
        <div
          className={`
            relative p-5 rounded-2xl backdrop-blur-sm transition-all duration-300
            ${isUser
              ? 'bg-gradient-to-l from-cyan-900/10 to-transparent border-r-2 border-cyan-500/50 hover:bg-cyan-900/20'
              : 'bg-gradient-to-r from-purple-900/10 to-transparent border-l-2 border-purple-500/50 hover:bg-purple-900/20'
            }
          `}
        >
          {/* 装饰性角落 */}
          <div className={`absolute top-0 w-3 h-3 border-t border-white/20 ${isUser ? 'right-0 border-r rounded-tr-xl' : 'left-0 border-l rounded-tl-xl'}`}></div>
          <div className={`absolute bottom-0 w-3 h-3 border-b border-white/20 ${isUser ? 'right-0 border-r rounded-br-xl' : 'left-0 border-l rounded-bl-xl'}`}></div>
          {isUser ? (
            // 用户消息（纯文本或编辑模式）
            isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-white/20 bg-black/30 backdrop-blur-sm focus:outline-none focus:border-cyan-500/50 resize-none text-gray-200"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    <X size={14} className="inline mr-1" />
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white hover:shadow-cyan-900/50 transition-all"
                  >
                    <Send size={14} className="inline mr-1" />
                    保存
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-200 leading-7 font-light text-sm md:text-base whitespace-pre-wrap break-words">{message.content}</p>
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
                  className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Brain size={16} className="text-purple-400 animate-pulse" />
                    <span className="text-xs font-semibold text-purple-300 font-mono tracking-wider">深度思考中...</span>
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap break-words font-mono leading-relaxed">
                    {message.thinking}
                    {isThinking && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="inline-block w-2 h-3 bg-purple-400 ml-1 align-middle rounded-sm"
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
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-white text-xs hover:bg-white/20 font-medium"
                          >
                            <Copy size={12} className="inline mr-1" />
                            复制代码
                          </button>
                        </div>
                      ) : (
                        <code className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-lg text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // 段落
                    p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-200 leading-relaxed">{children}</p>,
                    // 标题
                    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold mb-3 text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-white">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-sm font-bold mb-2 text-white">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-sm font-bold mb-2 text-white">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-sm font-bold mb-2 text-white">{children}</h6>,
                    // 列表
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 text-gray-200 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 text-gray-200 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    // 链接
                    a: ({ children, href }) => (
                      <a href={href} className="text-cyan-400 hover:text-cyan-300 underline transition-colors" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    // 强调（加粗）
                    strong: ({ children }) => <strong style={{ fontWeight: '700', color: '#ffffff' }}>{children}</strong>,
                    // 加粗别名
                    b: ({ children }) => <b style={{ fontWeight: '700', color: '#ffffff' }}>{children}</b>,
                    em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#e5e5e5' }}>{children}</em>,
                    i: ({ children }) => <i style={{ fontStyle: 'italic', color: '#e5e5e5' }}>{children}</i>,
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
                  className="inline-block w-2 h-4 bg-purple-400 ml-1 rounded-sm"
                />
              )}
              
              {/* AI回复时的附件或链接样式 */}
              {message.hasAttachment && (
                <div className="mt-4 flex gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 rounded bg-black/30 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-purple-500/50 cursor-pointer transition-colors">
                    <FileText size={14} /> <span>design_spec_v1.pdf</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 交互按钮 (悬停显示 - 仅AI消息) */}
        {!isUser && (
          <div className="absolute -right-12 top-10 opacity-0 group-hover:opacity-100 flex flex-col gap-2 transition-opacity">
            <button 
              onClick={handleCopy}
              className="p-1.5 rounded-full bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              title="复制"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14}/>}
            </button>
            <button 
              onClick={handleRegenerate}
              className="p-1.5 rounded-full bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              title="重新生成"
            >
              <RefreshCw size={14}/>
            </button>
          </div>
        )}
        
        {/* 操作按钮（悬停显示 - 用户消息） */}
        {isUser && isHovered && !isStreaming && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2 mt-3 justify-end"
          >
            {/* 复制按钮 */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all duration-300 backdrop-blur-sm"
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
            
            {/* 编辑按钮 */}
            {onEdit && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 transition-all duration-300 backdrop-blur-sm"
                title="编辑消息"
              >
                <Edit2 size={12} />
                <span>编辑</span>
              </button>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;

