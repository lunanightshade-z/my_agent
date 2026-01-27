/**
 * 模型选择器组件
 * 支持多个模型选择
 * 使用配置文件管理模型列表
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setModelProvider } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CHAT_MODELS, getChatDefaultModel, findModelById } from '../config/models';

const ModelSelector = () => {
  const dispatch = useDispatch();
  const { modelProvider, isStreaming } = useSelector((state) => state.chat);
  const [isOpen, setIsOpen] = useState(false);

  // 从配置文件获取模型列表
  const models = CHAT_MODELS;

  // 查找当前模型，如果找不到则使用默认模型
  const currentModel = findModelById(modelProvider, models) || getChatDefaultModel();

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
      {/* 当前选中的模型按钮 */}
      <motion.button
        onClick={() => !isStreaming && setIsOpen(!isOpen)}
        disabled={isStreaming}
        whileHover={{ scale: isStreaming ? 1 : 1.02 }}
        whileTap={{ scale: isStreaming ? 1 : 0.98 }}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm font-tech
          transition-all duration-200
          bg-gradient-to-r ${currentModel.color} text-white shadow-lg shadow-amber-900/30
          ${isStreaming ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <currentModel.icon size={16} />
        <span>{currentModel.name}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {isOpen && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-[#0a0c10]/95 border border-amber-500/30 rounded-lg shadow-2xl z-[9999] max-h-96 overflow-y-auto"
            style={{ backdropFilter: 'blur(20px)' }}
          >
            {Object.entries(modelsByCategory).map(([category, categoryModels]) => (
              <div key={category} className="p-2">
                <div className="px-3 py-1 text-xs font-tech text-amber-500/60 uppercase tracking-wider">
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
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-tech
                        transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r ' + model.color + ' text-white'
                          : 'text-slate-300 hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon size={16} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs opacity-70">{model.description}</div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-white" />
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
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ModelSelector;
