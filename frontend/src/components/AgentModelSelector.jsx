/**
 * Agent 模型选择器组件
 * 专门为 Agent 页面设计，支持工具调用的模型
 * 使用配置文件管理模型列表
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModelProvider } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Bot } from 'lucide-react';
import { AGENT_MODELS, getAgentDefaultModel, findModelById } from '../config/models';

const AgentModelSelector = () => {
  const dispatch = useDispatch();
  const { modelProvider, isStreaming } = useSelector((state) => state.chat);
  const [isOpen, setIsOpen] = useState(false);

  // 从配置文件获取模型列表
  const models = AGENT_MODELS;

  // 查找当前模型，如果找不到则使用默认模型
  const currentModel = findModelById(modelProvider, models) || getAgentDefaultModel();

  const handleModelChange = (modelId) => {
    if (!isStreaming) {
      dispatch(setModelProvider(modelId));
      setIsOpen(false);
    }
  };

  // 按分类分组
  const modelsByCategory = models.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {});

  return (
    <div className="relative">
      {/* 当前选中的模型按钮 - Agent 风格 */}
      <motion.button
        onClick={() => !isStreaming && setIsOpen(!isOpen)}
        disabled={isStreaming}
        whileHover={{ scale: isStreaming ? 1 : 1.02 }}
        whileTap={{ scale: isStreaming ? 1 : 0.98 }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm
          transition-all duration-200
          bg-white/60 hover:bg-white/80
          border border-slate-200/50 hover:border-teal-300/50
          text-slate-700 shadow-sm
          backdrop-blur-sm
          ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <Bot size={16} className="text-teal-500" />
        <span>{currentModel.name}</span>
        <ChevronDown 
          size={14} 
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* 下拉菜单 - Agent 风格 */}
      <AnimatePresence>
        {isOpen && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full right-0 mb-2 w-72 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {/* 标题 */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Bot size={16} className="text-teal-500" />
                <span>选择 Agent 模型</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">所有模型均支持工具调用</p>
            </div>
            
            {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
              <div key={category} className="p-2">
                <div className="px-3 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {category}
                </div>
                {categoryModels.map((model) => {
                  const Icon = model.icon;
                  const isActive = modelProvider === model.id;
                  
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => handleModelChange(model.id)}
                      whileHover={{ x: 2 }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                        transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border border-teal-200/50'
                          : 'text-slate-600 hover:bg-slate-50'
                        }
                      `}
                    >
                      <div className={`
                        p-1.5 rounded-lg
                        ${isActive 
                          ? 'bg-gradient-to-r ' + model.color + ' text-white' 
                          : 'bg-slate-100 text-slate-500'
                        }
                      `}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-slate-400">{model.description}</div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击外部关闭菜单 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default AgentModelSelector;
