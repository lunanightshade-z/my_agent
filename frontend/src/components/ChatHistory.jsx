/**
 * 左侧聊天历史面板组件
 * 显示所有会话列表，支持切换和删除
 */
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
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
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const convs = await getConversations();
      dispatch(setConversations(convs));
    } catch (error) {
      console.error('加载会话列表失败:', error);
    }
  };

  // 创建新会话
  const handleNewChat = async () => {
    try {
      const newConv = await createConversation();
      dispatch(addConversation(newConv));
      dispatch(setCurrentConversation(newConv.id));
      dispatch(setMessages([]));
    } catch (error) {
      console.error('创建会话失败:', error);
    }
  };

  // 切换会话
  const handleSelectConversation = async (convId) => {
    if (convId === currentConversationId) return;
    
    try {
      dispatch(setLoading(true));
      dispatch(setCurrentConversation(convId));
      const messages = await getConversationMessages(convId);
      dispatch(setMessages(messages));
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      dispatch(setLoading(false));
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
    <div className="h-full bg-gradient-to-br from-mint-50 to-sky-fresh-50 border-r border-mint-200 flex flex-col">
      {/* 头部 - 新建对话按钮 */}
      <div className="p-4 border-b border-mint-200">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNewChat}
          className="w-full bg-gradient-to-r from-mint-400 to-sky-fresh-400 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          <span className="font-medium">新建对话</span>
        </motion.button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleSelectConversation(conv.id)}
              className={`
                group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                ${currentConversationId === conv.id
                  ? 'bg-white shadow-md border-2 border-mint-300'
                  : 'bg-white/50 hover:bg-white hover:shadow-sm'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <MessageSquare 
                  size={18} 
                  className={currentConversationId === conv.id ? 'text-mint-500' : 'text-gray-400'}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 truncate">
                    {conv.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(conv.updated_at)}
                  </p>
                </div>
                
                {/* 删除按钮 */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                >
                  <Trash2 size={16} className="text-red-500" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 空状态 */}
        {conversations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无对话历史</p>
            <p className="text-xs mt-1">点击上方按钮创建新对话</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;

