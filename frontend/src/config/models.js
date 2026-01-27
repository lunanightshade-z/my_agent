/**
 * 模型配置文件
 * 统一管理 Chat 和 Agent 页面的模型列表和默认模型
 */
import { Sparkles, Zap, ChevronDown, Brain, Rocket, Gem, Bot } from 'lucide-react';

// ==================== Chat 页面模型配置 ====================

/**
 * Chat 页面可用模型列表
 * 用于普通对话场景
 */
export const CHAT_MODELS = [
  // 智谱模型
  {
    id: 'zhipu',
    name: 'GLM-4.7',
    provider: 'zhipu',
    icon: Zap,
    description: '智谱 GLM-4.7',
    color: 'from-blue-500 to-cyan-500',
    category: '智谱',
  },
  // OpenRouter 模型
  {
    id: 'moonshotai/kimi-k2.5',
    name: 'Kimi K2.5',
    provider: 'openrouter',
    icon: Sparkles,
    description: 'Moonshot AI Kimi',
    color: 'from-purple-500 to-pink-500',
    category: 'OpenRouter',
  },
  {
    id: 'z-ai/glm-4.7-flash',
    name: 'GLM-4.7 Flash',
    provider: 'openrouter',
    icon: Zap,
    description: 'Z-AI GLM-4.7 Flash',
    color: 'from-blue-400 to-indigo-500',
    category: 'OpenRouter',
  },
  {
    id: 'bytedance-seed/seed-1.6-flash',
    name: 'Seed 1.6',
    provider: 'openrouter',
    icon: Rocket,
    description: 'ByteDance Seed 1.6 Flash',
    color: 'from-orange-500 to-red-500',
    category: 'OpenRouter',
  },
  {
    id: 'deepseek/deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'openrouter',
    icon: Brain,
    description: 'DeepSeek V3.2',
    color: 'from-green-500 to-emerald-500',
    category: 'OpenRouter',
  },
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash',
    provider: 'openrouter',
    icon: Gem,
    description: 'Google Gemini 3 Flash',
    color: 'from-yellow-500 to-amber-500',
    category: 'OpenRouter',
  },
];

/**
 * Chat 页面默认模型 ID
 */
export const CHAT_DEFAULT_MODEL = 'bytedance-seed/seed-1.6-flash';

// ==================== Agent 页面模型配置 ====================

/**
 * Agent 页面可用模型列表
 * 所有模型均支持工具调用
 */
export const AGENT_MODELS = [
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

/**
 * Agent 页面默认模型 ID
 * 注意：用户未指定 Agent 默认模型，暂时保持 qwen3-235b
 * 如需修改，请更新此常量
 */
export const AGENT_DEFAULT_MODEL = 'z-ai/glm-4.7-flash';

// ==================== 工具函数 ====================

/**
 * 根据模型 ID 查找模型配置
 * @param {string} modelId - 模型 ID
 * @param {Array} models - 模型列表
 * @returns {Object|null} 模型配置对象
 */
export const findModelById = (modelId, models) => {
  return models.find(m => m.id === modelId) || null;
};

/**
 * 获取 Chat 默认模型配置
 * @returns {Object} 默认模型配置
 */
export const getChatDefaultModel = () => {
  return findModelById(CHAT_DEFAULT_MODEL, CHAT_MODELS) || CHAT_MODELS[0];
};

/**
 * 获取 Agent 默认模型配置
 * @returns {Object} 默认模型配置
 */
export const getAgentDefaultModel = () => {
  return findModelById(AGENT_DEFAULT_MODEL, AGENT_MODELS) || AGENT_MODELS[0];
};
