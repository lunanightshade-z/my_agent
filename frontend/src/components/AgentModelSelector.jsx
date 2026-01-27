/**
 * Agent 模型选择器组件
 * 专门为 Agent 页面设计，支持工具调用的模型
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModelProvider } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ChevronDown, Brain, Rocket, Gem, Bot } from 'lucide-react';

const AgentModelSelector = () => {
  const dispatch = useDispatch();
  const { modelProvider, isStreaming } = useSelector((state) => state.chat);
  const [isOpen, setIsOpen] = useState(false);

  // Agent 支持工具调用的模型列表
  const models = [
    // Qwen 通义千问 (自建/本地部署) - 推荐，性能强大
    {
      id: 'qwen3-235b',
      name: 'Qwen 235B',
      provider: 'qwen',
      icon: Brain,
      description: 'Qwen3-235B (自建推荐)',
      color: 'from-indigo-500 to-purple-600',
      category: 'Qwen',
      supportsTools: true,
    },
    // 智谱模型 (支持工具调用)
    {
      id: 'zhipu',
      name: 'GLM-4 Flash',
      provider: 'zhipu',
      icon: Zap,
      description: '智谱 GLM-4-Flash',
      color: 'from-blue-500 to-cyan-500',
      category: '智谱',
      supportsTools: true,
    },
    // OpenRouter 模型 (支持工具调用)
    {
      id: 'deepseek/deepseek-v3.2',
      name: 'DeepSeek V3.2',
      provider: 'openrouter',
      icon: Brain,
      description: 'DeepSeek V3.2',
      color: 'from-green-500 to-emerald-500',
      category: 'OpenRouter',
      supportsTools: true,
    },
    {
      id: 'moonshotai/kimi-k2.5',
      name: 'Kimi K2.5',
      provider: 'openrouter',
      icon: Sparkles,
      description: 'Moonshot AI Kimi',
      color: 'from-purple-500 to-pink-500',
      category: 'OpenRouter',
      supportsTools: true,
    },
    {
      id: 'z-ai/glm-4.7-flash',
      name: 'GLM-4.7 Flash',
      provider: 'openrouter',
      icon: Zap,
      description: 'Z-AI GLM-4.7 Flash',
      color: 'from-blue-400 to-indigo-500',
      category: 'OpenRouter',
      supportsTools: true,
    },
    {
      id: 'bytedance-seed/seed-1.6-flash',
      name: 'Seed 1.6',
      provider: 'openrouter',
      icon: Rocket,
      description: 'ByteDance Seed 1.6 Flash',
      color: 'from-orange-500 to-red-500',
      category: 'OpenRouter',
      supportsTools: true,
    },
    {
      id: 'google/gemini-3-flash-preview',
      name: 'Gemini 3 Flash',
      provider: 'openrouter',
      icon: Gem,
      description: 'Google Gemini 3 Flash',
      color: 'from-yellow-500 to-amber-500',
      category: 'OpenRouter',
      supportsTools: true,
    },
  ];

  // 默认 Qwen 235B，自建模型性能强大
  const currentModel = models.find(m => m.id === modelProvider) || models[0];

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
