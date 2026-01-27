/**
 * Agent 页面 - 参考页面样式重构
 * 左侧: 时光胶囊 (History)
 * 中间: 对话舞台 (Chat Interface)
 * 右侧: 灵感碎片 (Context Memory)
 */
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Send, 
  Paperclip, 
  AlignLeft,
  Plus,
  Home,
  RefreshCw
} from 'lucide-react';
import {
  addUserMessage,
  startStreaming,
  appendStreamingContent,
  addToolCall,
  updateToolResult,
  endStreaming,
  addToast,
  setMessages,
  setConversations,
  setCurrentConversation,
  setModelProvider,
} from '../store/store';
import { 
  sendAgentMessageStream, 
  generateConversationTitle, 
  getConversations, 
  createConversation,
  getConversationMessages,
  generateRSSCache
} from '../services/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { ThemeProvider } from '../components/shared/ThemeProvider';
import { agentTheme } from '../styles/themes';
import ToolCallCard from '../components/chat/ToolCallCard/ToolCallCard';
import AgentModelSelector from '../components/AgentModelSelector';
import { AGENT_DEFAULT_MODEL, AGENT_MODELS } from '../config/models';
import QuickActions from '../components/QuickActions.jsx';

// --- 组件：背景动态流体 ---
// 使用纯CSS动画模拟流动的空气感背景
const AmbientBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#fdfcf8]">
    <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-teal-100/40 rounded-full blur-[100px] animate-blob mix-blend-multiply" />
    <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-100/40 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply" />
    <div className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] bg-pink-100/40 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply" />
  </div>
);

// Agent 页面快捷按键
const AGENT_QUICK_ACTIONS = [
  '根据最近的新闻写一篇日报，然后根据内容给出你的独特的有新意的总结。',
  '总结近期的民生相关的新闻并给出锐评。',
];

// --- 主应用组件 ---
export default function Agent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    currentConversationId, 
    messages, 
    isStreaming, 
    conversations,
    modelProvider
  } = useSelector((state) => state.chat);
  
  // 页面挂载时，清空不属于 agent 类型的会话状态，并设置 Agent 默认模型
  useEffect(() => {
    // 设置 Agent 默认模型（如果还没设置过或是 Chat 默认模型）
    // 检查当前模型是否在 Agent 模型列表中，如果不在则切换到 Agent 默认模型
    const isAgentModel = AGENT_MODELS.some(m => m.id === modelProvider);
    if (!modelProvider || !isAgentModel) {
      // 如果没有模型或当前模型不是 Agent 支持的模型，切换到 Agent 默认模型
      dispatch(setModelProvider(AGENT_DEFAULT_MODEL));
    }
    
    if (currentConversationId) {
      const currentConv = conversations.find(c => c.id === currentConversationId);
      if (!currentConv || currentConv.conversation_type !== 'agent') {
        console.log('Agent 页面：检测到不匹配的会话类型，清空状态');
        dispatch(setCurrentConversation(null));
        dispatch(setMessages([]));
      }
    }
  }, [location.pathname]); // 当路由变化到 /agent 时触发

  // 调试：监听消息变化
  useEffect(() => {
    console.log('消息数组更新:', messages.length, '条消息');
    if (messages.length > 0) {
      console.log('最后一条消息:', messages[messages.length - 1]);
    }
  }, [messages]);

  const [inputValue, setInputValue] = useState('');
  const [isGeneratingCache, setIsGeneratingCache] = useState(false);
  const messagesEndRef = useRef(null);
  const skipNextLoadRef = useRef(false);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载会话列表
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await getConversations('agent');
        dispatch(setConversations(convs));
        
        // 如果当前选中的会话不在新的会话列表中，清空状态
        if (currentConversationId) {
          const currentConv = convs.find(c => c.id === currentConversationId);
          if (!currentConv || currentConv.conversation_type !== 'agent') {
            console.log('当前会话不属于 agent 类型，清空状态');
            dispatch(setCurrentConversation(null));
            dispatch(setMessages([]));
          }
        }
      } catch (error) {
        console.error('加载会话列表失败:', error);
      }
    };
    loadConversations();
  }, [dispatch, currentConversationId]);

  // 加载选中会话的消息
  useEffect(() => {
    if (isStreaming) {
      return;
    }
    if (currentConversationId) {
      if (skipNextLoadRef.current) {
        skipNextLoadRef.current = false;
        return;
      }
      const loadMessages = async () => {
        try {
          // 验证当前会话是否属于 agent 类型
          const currentConv = conversations.find(c => c.id === currentConversationId);
          if (!currentConv) {
            // 如果当前会话不在列表中，说明可能是其他类型的会话，清空状态
            console.warn('当前会话不属于 agent 类型，清空状态');
            dispatch(setCurrentConversation(null));
            dispatch(setMessages([]));
            return;
          }
          if (currentConv.conversation_type !== 'agent') {
            // 如果会话类型不匹配，清空状态
            console.warn('会话类型不匹配，清空状态。期望: agent, 实际:', currentConv.conversation_type);
            dispatch(setCurrentConversation(null));
            dispatch(setMessages([]));
            return;
          }
          
          const msgs = await getConversationMessages(currentConversationId);
          // 转换消息格式，确保格式统一
          const formattedMessages = msgs.map(msg => ({
            role: msg.role,
            content: msg.content || '',
            thinking: msg.thinking || '',
            toolCalls: msg.toolCalls || [], // 保留工具调用信息
            timestamp: msg.timestamp || new Date().toISOString(),
            isStreaming: false,
            isThinking: false,
          }));
          dispatch(setMessages(formattedMessages));
        } catch (error) {
          console.error('加载消息失败:', error);
          // 如果加载失败，清空状态
          dispatch(setCurrentConversation(null));
          dispatch(setMessages([]));
        }
      };
      loadMessages();
    } else {
      // 如果没有选中会话，清空消息
      dispatch(setMessages([]));
    }
  }, [currentConversationId, conversations, dispatch, isStreaming]);

  // 发送消息
  const handleSendMessage = async (messageText) => {
    // 如果传入了消息文本，使用它；否则使用 inputValue
    const message = messageText || inputValue;
    if (!message.trim() || isStreaming) return;

    let conversationId = currentConversationId;
    
    if (!conversationId) {
      try {
        const newConv = await createConversation('新对话', 'agent');
        conversationId = newConv.id;
        skipNextLoadRef.current = true;
        dispatch(setCurrentConversation(conversationId));
        const updatedConvs = await getConversations('agent');
        dispatch(setConversations(updatedConvs));
      } catch (error) {
        dispatch(addToast({
          type: 'error',
          message: `创建对话失败: ${error.message || error}`,
          duration: 3000,
        }));
        return;
      }
    }

    const isFirstMessage = messages.length === 0;
    // 只有在使用 inputValue 时才清空输入框
    if (!messageText) {
      setInputValue('');
    }
    
    // 添加用户消息
    dispatch(addUserMessage(message));
    console.log('用户消息已添加，当前消息数:', messages.length + 1);
    
    // 开始流式响应
    dispatch(startStreaming());
    console.log('开始流式响应');

    // 使用智能体API（支持工具调用）
    // 参数顺序：conversationId, message, modelProvider, onToolCall, onToolResult, onChunk, onDone, onError
    sendAgentMessageStream(
      conversationId,
      message,
      modelProvider || AGENT_DEFAULT_MODEL, // 模型选择（默认 Qwen 235B）
      // onToolCall - 工具调用回调
      (toolCallData) => {
        console.log('🔧 [API] 收到工具调用:', {
          type: toolCallData.type,
          tool_name: toolCallData.tool_name,
          has_tool_arguments: !!toolCallData.tool_arguments,
          arguments_keys: toolCallData.tool_arguments ? Object.keys(toolCallData.tool_arguments) : []
        });
        console.log('🔧 [API] 工具调用完整数据:', toolCallData);
        // 添加工具调用到消息中
        dispatch(addToolCall(toolCallData));
      },
      // onToolResult - 工具结果回调
      (toolResultData) => {
        console.log('✅ [API] 收到工具结果:', {
          type: toolResultData.type,
          tool_name: toolResultData.tool_name,
          content_length: toolResultData.content ? toolResultData.content.length : 0
        });
        console.log('✅ [API] 工具结果完整数据:', toolResultData);
        // 更新工具调用结果
        dispatch(updateToolResult(toolResultData));
      },
      // onChunk - 内容回调
      (content) => {
        console.log('📝 [API] 收到内容块 (长度: ' + content.length + ')');
        dispatch(appendStreamingContent(content));
      },
      // onDone - 完成回调
      async () => {
        console.log('🏁 [API] 流式响应完成');
        dispatch(endStreaming());
        if (isFirstMessage) {
          try {
            await generateConversationTitle(conversationId, message);
            const updatedConvs = await getConversations('agent');
            dispatch(setConversations(updatedConvs));
          } catch (error) {
            console.error('生成标题失败:', error);
          }
        } else {
          try {
            const updatedConvs = await getConversations('agent');
            dispatch(setConversations(updatedConvs));
          } catch (error) {
            console.error('刷新会话列表失败:', error);
          }
        }
      },
      // onError - 错误回调
      (error) => {
        console.error('❌ [API] 流式响应错误:', error);
        dispatch(endStreaming());
        dispatch(addToast({
          type: 'error',
          message: `发送失败: ${error}`,
          duration: 4000,
        }));
      }
    );
  };

  // 切换会话
  const handleConversationClick = (convId) => {
    dispatch(setCurrentConversation(convId));
  };

  // 新建会话
  const handleNewConversation = async () => {
    try {
      const newConv = await createConversation('新对话', 'agent');
      dispatch(setCurrentConversation(newConv.id));
      dispatch(setMessages([]));
      const updatedConvs = await getConversations('agent');
      dispatch(setConversations(updatedConvs));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: `创建对话失败: ${error.message || error}`,
        duration: 3000,
      }));
    }
  };

  // 生成RSS缓存
  const handleGenerateCache = async () => {
    setIsGeneratingCache(true);
    try {
      const result = await generateRSSCache();
      dispatch(addToast({
        type: 'success',
        message: 'RSS缓存生成成功！',
        duration: 3000,
      }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: `生成缓存失败: ${error.message || error}`,
        duration: 4000,
      }));
    } finally {
      setIsGeneratingCache(false);
    }
  };

  return (
    <ThemeProvider theme={agentTheme}>
      <div className="relative w-full h-screen font-sans text-slate-600 selection:bg-teal-100 selection:text-teal-800" style={{ backgroundColor: agentTheme.colors.background }}>
        <AmbientBackground />

      {/* 布局容器：使用Flex配合绝对定位创造空间感 */}
      <div className="relative z-10 flex w-full h-full p-6 gap-6 overflow-hidden">
        
        {/* --- 左侧：时光胶囊 (历史记录) --- */}
        <div className="w-16 md:w-20 lg:w-64 flex-shrink-0 flex flex-col gap-6 transition-all duration-500 ease-in-out">
          <div className="flex items-center gap-2 mb-4">
            <div 
              className="h-12 w-12 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/60 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => navigate('/')}
              title="返回首页"
            >
              <Home className="text-teal-500" size={20} />
            </div>
            {/* 新建会话按钮 - 在顶部更显眼 */}
            <button
              onClick={handleNewConversation}
              className="h-12 px-4 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/60 cursor-pointer hover:scale-105 transition-transform hover:bg-white/70 hover:border-teal-300/50 hidden lg:flex gap-2"
              title="新建会话"
            >
              <Plus className="text-teal-500" size={18} />
              <span className="text-sm font-medium text-slate-700">新建</span>
            </button>
            {/* 移动端新建按钮 */}
            <button
              onClick={handleNewConversation}
              className="h-12 w-12 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/60 cursor-pointer hover:scale-105 transition-transform hover:bg-white/70 hover:border-teal-300/50 lg:hidden"
              title="新建会话"
            >
              <Plus className="text-teal-500" size={20} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-20 mask-gradient-b">
            {conversations.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8 px-2">
                暂无历史会话
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = currentConversationId === conv.id;
                const updatedDate = new Date(conv.updated_at);
                const timeStr = updatedDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
                const dateStr = updatedDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
                
                return (
                  <div 
                    key={conv.id}
                    onClick={() => handleConversationClick(conv.id)}
                    className={`group relative p-3 rounded-2xl transition-all duration-300 cursor-pointer border
                      ${isActive 
                        ? 'bg-white/80 border-white shadow-lg shadow-teal-500/10 scale-105' 
                        : 'bg-white/30 border-transparent hover:bg-white/50 hover:border-white/40'
                      }`}
                  >
                    {/* 仅在宽屏显示标题，窄屏显示时间点 */}
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full transition-colors ${isActive ? 'bg-teal-400' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                      <div className="hidden lg:block">
                        <h4 className={`text-sm font-medium ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                          {conv.title || '新对话'}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{timeStr}</p>
                      </div>
                    </div>
                    {/* 窄屏Tooltip */}
                    <div className="absolute left-14 top-2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 lg:hidden group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {conv.title || '新对话'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- 中间：对话舞台 --- */}
        <div className="flex-1 relative flex flex-col items-center">
          
          {/* 顶部标题区 - 极简 */}
          <div className="w-full flex justify-between items-center mb-4 px-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-light tracking-wide text-slate-700">
                {currentConversationId 
                  ? conversations.find(c => c.id === currentConversationId)?.title || 'Agent Chat'
                  : 'Agent Chat'
                }
              </h2>
              {/* Agent Badge */}
              <span className="px-3 py-1 rounded-full bg-teal-100/50 border border-teal-200/50 text-xs font-medium text-teal-700">
                Agent
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isStreaming ? 'bg-green-400 animate-pulse' : 'bg-green-400'}`}></span>
                <span className="text-xs text-slate-400 font-medium">{isStreaming ? 'Thinking...' : 'Online'}</span>
              </div>
              {/* Chat 切换按钮 */}
              <button
                onClick={() => navigate('/chat')}
                className="
                  px-3 py-1.5 rounded-lg
                  bg-white/50 hover:bg-white/70
                  border border-slate-200/50 hover:border-slate-300/70
                  text-sm text-slate-600 hover:text-slate-700
                  transition-all duration-200
                  flex items-center gap-1.5
                  hover:scale-105 active:scale-95
                "
                title="切换到 Chat"
              >
                <span>💬</span>
                <span>Chat</span>
              </button>
            </div>
          </div>

          {/* 消息滚动区 */}
          <div className="w-full max-w-3xl flex-1 overflow-y-auto no-scrollbar px-4 pb-32 mask-gradient-t-b">
            <div className="flex flex-col gap-8 py-8">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                  <div className="text-4xl mb-2">✨</div>
                  <h3 className="text-xl font-light text-slate-700 mb-2">
                    欢迎使用 Agent
                  </h3>
                  <p className="text-slate-500 text-sm">
                    开始你的对话吧
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const msgKey = msg.id || `${msg.role}-${idx}-${msg.timestamp || Date.now()}`;
                  
                  // 调试日志：记录每条消息的工具调用信息
                  if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
                    console.log(`消息 ${idx} (${msgKey})有${msg.toolCalls.length}个工具调用:`, msg.toolCalls);
                  }
                  
                  return (
                    <div 
                      key={msgKey} 
                      className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      <div className={`
                        relative rounded-3xl backdrop-blur-md border shadow-sm
                        ${msg.role === 'user' 
                          ? 'max-w-[80%] md:max-w-[70%] bg-slate-800/5 border-slate-200/50 text-slate-700 rounded-br-none p-6' 
                          : 'max-w-[95%] md:max-w-[90%] lg:max-w-[85%] bg-white/70 border-white/60 text-slate-600 rounded-tl-none shadow-indigo-100/50 p-6'
                        }
                      `}>
                        {/* Role Label */}
                        <span className={`absolute -top-6 text-[10px] font-bold tracking-widest uppercase opacity-40
                           ${msg.role === 'user' ? 'right-0' : 'left-0'}
                        `}>
                          {msg.role === 'user' ? 'user' : 'assistant'}
                        </span>

                        <div className="text-[15px]">
                          {msg.role === 'user' ? (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {msg.content || ''}
                              {msg.isStreaming && (
                                <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse" />
                              )}
                            </div>
                          ) : (
                            <>
                              {/* 工具调用列表 */}
                              {msg.toolCalls && msg.toolCalls.length > 0 && (
                                <div className="mb-4 space-y-2">
                                  {msg.toolCalls.map((toolCall, toolIdx) => {
                                    console.log(`渲染工具调用 ${toolIdx}:`, {
                                      id: toolCall.id,
                                      tool_name: toolCall.tool_name,
                                      isExecuting: toolCall.isExecuting,
                                      hasResult: !!toolCall.result
                                    });
                                    return (
                                      <ToolCallCard
                                        key={toolCall.id || toolIdx}
                                        toolCall={toolCall}
                                        toolResult={toolCall.result}
                                        isExecuting={toolCall.isExecuting}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                              
                              <MarkdownRenderer content={msg.content || ''} />
                              {msg.isStreaming && (
                                <span className="inline-block w-2 h-4 ml-1 bg-teal-500 animate-pulse" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* --- 悬浮控制胶囊 (输入区) --- */}
          <div className="absolute bottom-6 w-full max-w-2xl px-4 z-50 group">
            {/* 渐变光晕背景 */}
            <div className="
              absolute inset-x-8 -inset-y-2 rounded-[2.5rem]
              bg-gradient-to-r from-teal-200/0 via-teal-200/5 to-teal-200/0
              opacity-0 group-focus-within:opacity-100 
              transition-opacity duration-500
              -z-10
              blur-xl
            "></div>
            
            {/* 快捷按键 - 放在输入框上方 */}
            {messages.length === 0 && (
              <div className="mb-3">
                <QuickActions
                  actions={AGENT_QUICK_ACTIONS}
                  onActionClick={handleSendMessage}
                  disabled={isStreaming}
                  theme="agent"
                />
              </div>
            )}
            
            <div className="
              relative w-full p-3 bg-gradient-to-br from-white/90 via-white/85 to-white/80 
              backdrop-blur-xl rounded-[2.5rem] 
              border border-white/60 
              shadow-2xl shadow-teal-500/5
              hover:shadow-teal-500/15
              hover:border-white/80
              flex flex-col gap-2 
              transition-all duration-300 ease-out
              focus-within:shadow-2xl focus-within:shadow-teal-500/20 
              focus-within:scale-[1.02]
              focus-within:border-teal-200/50
            ">
              <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-teal-200/50 shadow-[0_0_18px_rgba(45,212,191,0.22)]" />
              <div className="pointer-events-none absolute inset-[2px] rounded-[2.4rem] border border-white/40 opacity-70" />

              <div className="relative z-10 flex flex-col gap-2">
                {/* 输入框 */}
                <div className="flex items-end gap-2 px-2">
                  {/* 模型选择器 - 放在输入框左侧 */}
                  <div className="flex-shrink-0">
                    <AgentModelSelector />
                  </div>
                  <button className="
                    p-3 rounded-full 
                    text-slate-400 hover:text-teal-500 
                    bg-transparent hover:bg-teal-50/80
                    transition-all duration-200
                    hover:scale-110
                    active:scale-95
                  ">
                    <Paperclip size={20} />
                  </button>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                    placeholder="Ask anything..."
                  className="
                    flex-1 bg-transparent border-none outline-none resize-none 
                    py-3 px-4 max-h-32 text-slate-700 placeholder:text-slate-400/70 
                    text-base font-medium rounded-[2.5rem]
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300/60
                    focus-visible:ring-offset-2 focus-visible:ring-offset-white/70
                    focus-visible:rounded-[2.5rem]
                    group-focus-within:text-slate-800
                  "
                    rows={1}
                    style={{ minHeight: '48px' }}
                    disabled={isStreaming}
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isStreaming || !inputValue.trim()}
                    className={`
                      p-3 rounded-full transition-all duration-300 shadow-md
                      hover:scale-110 active:scale-95
                      ${inputValue.trim() && !isStreaming
                        ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/40 hover:from-teal-600 hover:to-teal-700 hover:shadow-teal-500/60' 
                        : 'bg-slate-100 text-slate-300 shadow-transparent cursor-default'}
                    `}
                  >
                    <Send size={18} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* --- 右侧：灵感碎片 (上下文总结) --- */}
        <div className="hidden lg:flex w-72 flex-col gap-4 pt-12">
          {/* <div className="mb-4">
            <button
              onClick={handleGenerateCache}
              disabled={isGeneratingCache}
              className="w-full h-10 px-3 bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl flex items-center justify-center gap-2 shadow-sm border border-teal-300/50 cursor-pointer hover:scale-105 transition-transform hover:from-teal-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="立即生成RSS缓存"
            >
              <RefreshCw 
                className={`text-white ${isGeneratingCache ? 'animate-spin' : ''}`} 
                size={16} 
              />
              <span className="text-xs font-medium">
                {isGeneratingCache ? '生成中...' : 'get news'}
              </span>
            </button>
          </div> */}
          
          <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border border-white/50 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-6 text-slate-400">
              <AlignLeft size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Context Memory</span>
            </div>

            <div className="flex flex-col gap-4">
              {/* 显示当前会话的一些上下文信息 */}
              {messages.length > 0 ? (
                <div className="group">
                  <h5 className="text-[10px] text-slate-400 font-medium mb-1 pl-2 border-l-2 border-transparent group-hover:border-teal-300 transition-colors">
                    Conversation
                  </h5>
                  <div className="p-3 bg-white/60 rounded-xl text-sm text-slate-700 shadow-sm border border-transparent group-hover:border-white transition-all">
                    {messages.length} messages
                  </div>
                </div>
              ) : (
                <div className="group">
                  <h5 className="text-[10px] text-slate-400 font-medium mb-1 pl-2 border-l-2 border-transparent group-hover:border-teal-300 transition-colors">
                    Status
                  </h5>
                  <div className="p-3 bg-white/60 rounded-xl text-sm text-slate-700 shadow-sm border border-transparent group-hover:border-white transition-all">
                    Ready to chat
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 hover:text-slate-400 hover:border-slate-300 cursor-pointer transition-all">
                <span className="text-xs">+ Add context</span>
              </div>
            </div>
          </div>

          {/* 装饰性的小组件 */}
          <div className="bg-gradient-to-br from-teal-50 to-indigo-50 rounded-[2rem] p-6 border border-white/50 shadow-sm opacity-80 mt-auto mb-20">
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl">🌤</span>
              <span className="text-xs font-mono text-slate-400">STATUS</span>
            </div>
            <p className="text-sm text-slate-600 font-medium">All systems operational.</p>
            <p className="text-xs text-slate-400 mt-1">Agent engine running</p>
          </div>
        </div>

      </div>

      {/* Tailwind 自定义动画补充 */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .mask-gradient-b {
           mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
        }
        .mask-gradient-t-b {
           mask-image: linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%);
        }
      `}</style>
      </div>
    </ThemeProvider>
  );
}
