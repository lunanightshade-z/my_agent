/**
 * 模型选择器组件
 * 允许用户选择聊天模型（Kimi 或智谱）
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModelProvider } from '../store/store';
import { motion } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';

const ModelSelector = () => {
  const dispatch = useDispatch();
  const { modelProvider, isStreaming } = useSelector((state) => state.chat);

  const models = [
    {
      id: 'kimi',
      name: 'Kimi',
      icon: Sparkles,
      description: '智能推理模型',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'zhipu',
      name: '智谱',
      icon: Zap,
      description: 'GLM-4 Flash',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const handleModelChange = (modelId) => {
    if (!isStreaming) {
      dispatch(setModelProvider(modelId));
    }
  };

  return (
    <div className="flex items-center gap-2">
      {models.map((model) => {
        const Icon = model.icon;
        const isActive = modelProvider === model.id;
        
        return (
          <motion.button
            key={model.id}
            onClick={() => handleModelChange(model.id)}
            disabled={isStreaming}
            whileHover={{ scale: isStreaming ? 1 : 1.05 }}
            whileTap={{ scale: isStreaming ? 1 : 0.95 }}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-sm font-tech
              transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r ' + model.color + ' text-white shadow-lg shadow-amber-900/30'
                : 'bg-white/10 text-slate-300 border border-amber-500/20 hover:border-amber-500/40 hover:bg-white/15'
              }
              ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-2">
              <Icon size={16} />
              <span>{model.name}</span>
            </div>
            
            {/* 工具提示 */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
              <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {model.description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ModelSelector;
