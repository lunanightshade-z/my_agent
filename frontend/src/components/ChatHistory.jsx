/**
 * 左侧聊天历史面板组件
 * 显示所有会话列表，支持切换和删除
 */
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, MessageSquare, Trash2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  setConversations,
  addConversation,
  removeConversation,
  setCurrentConversation,
  setMessages,
  setLoading,
} from '../store/store';
import {
  createConversation,
  getConversations,
  deleteConversation,
  getConversationMessages,
} from '../services/api';

const ChatHistory = () => {
  const dispatch = useDispatch();
  const { conversations, currentConversationId } = useSelector((state) => state.chat);

  // 加载会话列表
  const loadConversations = async () => {
    try {
      const convs = await getConversations('chat');
      dispatch(setConversations(convs));
    } catch (error) {
      console.error('加载会话列表失败:', error);
    }
  };

  // 切换会话
  const handleSelectConversation = useCallback(async (convId) => {
    if (convId === currentConversationId) return;
    
    try {
      dispatch(setLoading(true));
      
      // 验证会话是否属于 chat 类型
      const targetConv = conversations.find(c => c.id === convId);
      if (!targetConv) {
        console.warn('会话不存在于列表中');
        dispatch(setLoading(false));
        return;
      }
      if (targetConv.conversation_type !== 'chat') {
        console.warn('会话类型不匹配，期望: chat, 实际:', targetConv.conversation_type);
        dispatch(setLoading(false));
        return;
      }
      
      dispatch(setCurrentConversation(convId));
      const messages = await getConversationMessages(convId);
      dispatch(setMessages(messages));
      
      // 重新加载会话列表以获取最新信息（标题、更新时间等）
      const updatedConvs = await getConversations('chat');
      dispatch(setConversations(updatedConvs));
      
      // 再次验证当前会话是否还在列表中且类型正确
      const updatedConv = updatedConvs.find(c => c.id === convId);
      if (!updatedConv || updatedConv.conversation_type !== 'chat') {
        console.warn('会话类型验证失败，清空状态');
        dispatch(setCurrentConversation(null));
        dispatch(setMessages([]));
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      dispatch(setCurrentConversation(null));
      dispatch(setMessages([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [currentConversationId, conversations, dispatch]);

  // 加载会话列表
  useEffect(() => {
    const loadAndValidate = async () => {
      await loadConversations();
      
      // 如果当前选中的会话不在新的会话列表中，清空状态
      if (currentConversationId) {
        const convs = await getConversations('chat');
        const currentConv = convs.find(c => c.id === currentConversationId);
        if (!currentConv || currentConv.conversation_type !== 'chat') {
          console.log('当前会话不属于 chat 类型，清空状态');
          dispatch(setCurrentConversation(null));
          dispatch(setMessages([]));
        }
      }
    };
    loadAndValidate();
  }, []);

  // 当对话列表加载完成且没有当前对话时，自动选择第一个对话
  useEffect(() => {
    if (conversations.length > 0 && !currentConversationId) {
      handleSelectConversation(conversations[0].id);
    }
  }, [conversations.length, currentConversationId, handleSelectConversation]);

  // 创建新对话
  const handleNewChat = async () => {
    try {
      const newConv = await createConversation('新对话', 'chat');
      dispatch(addConversation(newConv));
      dispatch(setCurrentConversation(newConv.id));
      dispatch(setMessages([]));
      
      // 重新加载会话列表以获取最新信息
      const updatedConvs = await getConversations('chat');
      dispatch(setConversations(updatedConvs));
    } catch (error) {
      console.error('创建新对话失败:', error);
    }
  };

  // 删除会话
  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('确定要删除这个对话吗？')) {
      return;
    }
    
    try {
      await deleteConversation(convId);
      dispatch(removeConversation(convId));
    } catch (error) {
      console.error('删除会话失败:', error);
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    if (hours < 48) return '昨天';
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-full rounded-3xl flex flex-col overflow-hidden shadow-2xl relative z-10"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(212, 175, 55, 0.2)'
      }}
    >
      {/* 头部 - 新建对话按钮 */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-gray-200 font-light tracking-widest text-sm uppercase">Memory Stream</h2>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNewChat}
        className="mx-4 mt-4 py-3 rounded-xl border border-dashed border-white/20 text-gray-400 text-xs hover:border-elite-gold/50 hover:text-elite-gold transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} />
        <span className="font-medium">新对话</span>
      </motion.button>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent'
      }}>
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={() => handleSelectConversation(conv.id)}
              className="group p-4 rounded-xl bg-white/0 hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/10 relative overflow-hidden"
            >
              {/* 左侧强调线 - 始终显示,hover和选中时有不同效果 */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                currentConversationId === conv.id 
                  ? 'bg-elite-gold/50 translate-x-0' 
                  : 'bg-elite-gold/50 -translate-x-full group-hover:translate-x-0'
              }`} />
              
              <div className="text-xs mb-1 font-mono flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  currentConversationId === conv.id ? 'bg-elite-gold animate-pulse' : 'bg-gray-600'
                }`}></span>
                <span className={currentConversationId === conv.id ? 'text-elite-gold' : 'text-gray-600'}>
                  {currentConversationId === conv.id ? 'ACTIVE' : 'MEMORY'}
                </span>
              </div>
              
              <h3 className="text-gray-300 text-sm font-medium line-clamp-1 group-hover:text-white transition-colors">
                {conv.title}
              </h3>
              <p className="text-gray-600 text-xs mt-2 font-mono">
                {formatTime(conv.updated_at)}
              </p>
              
              {/* 删除按钮 */}
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
                onClick={(e) => handleDeleteConversation(conv.id, e)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-elite-rose/20 rounded-lg"
              >
                <Trash2 size={14} className="text-elite-rose" />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 空状态 */}
        {conversations.length === 0 && (
          <motion.div
            className="text-center py-12 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-mono">暂无对话历史</p>
            <p className="text-xs mt-1 text-gray-600">点击上方按钮创建新对话</p>
          </motion.div>
        )}
      </div>
      
      {/* 底部装饰 */}
      <div className="p-4 bg-gradient-to-t from-black/20 to-transparent">
        <div className="text-center text-[10px] text-gray-600 font-mono">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Activity size={10} className="text-elite-gold animate-pulse" />
            <span>NEURAL SYNC</span>
          </div>
          <span className="text-gray-700">{conversations.length} STREAMS ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;

