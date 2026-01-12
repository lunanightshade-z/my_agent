/**
 * Agent 页面
 * 展示可用的智能体卡片网格
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, MessageSquare, Plus } from 'lucide-react';

const Agent = () => {
  const navigate = useNavigate();

  const agents = [
    {
      id: 1,
      name: 'Chat Assistant',
      desc: '通用对话助手，擅长问答、写作、分析。',
      icon: MessageSquare,
      status: 'online',
      color: 'aurora',
    },
    {
      id: 2,
      name: 'Code Expert',
      desc: '编程专家，帮助调试、优化和学习代码。',
      icon: Zap,
      status: 'online',
      color: 'fresh-sky',
    },
    {
      id: 3,
      name: 'Creative Writer',
      desc: '创意写手，适合故事、文案、诗歌创作。',
      icon: MessageSquare,
      status: 'online',
      color: 'lavender',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  };

  const colorMap = {
    aurora: {
      bg: 'from-aurora-300/20 to-aurora-300/5',
      border: 'border-aurora-300/30',
      text: 'text-aurora-400',
      dot: 'bg-aurora-400',
      glow: 'glow-aurora',
    },
    'fresh-sky': {
      bg: 'from-fresh-sky-400/20 to-fresh-sky-400/5',
      border: 'border-fresh-sky-400/30',
      text: 'text-fresh-sky-400',
      dot: 'bg-fresh-sky-400',
      glow: 'glow-blue',
    },
    lavender: {
      bg: 'from-lavender-400/20 to-lavender-400/5',
      border: 'border-lavender-400/30',
      text: 'text-lavender-400',
      dot: 'bg-lavender-400',
      glow: 'glow-purple',
    },
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] pb-12">
      {/* 标题区 */}
      <motion.div
        className="max-w-4xl mx-auto mb-16 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold mb-4 gradient-text">
          Intelligent Agents
        </h1>
        <p className="text-xl text-text-secondary">
          选择一个智能体开始对话，或创建属于您的自定义代理。
        </p>
      </motion.div>

      {/* Agent Grid */}
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agents.map((agent) => {
          const Icon = agent.icon;
          const colors = colorMap[agent.color];

          return (
            <motion.div
              key={agent.id}
              className={`glass-card group cursor-pointer border ${colors.border}`}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                rotateX: 8,
                rotateY: 8,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              onClick={() => navigate('/chat')}
            >
              {/* 背景渐变 */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${colors.bg} -z-10`} />

              {/* 顶部区域 */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center ${colors.glow}`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                {/* 状态指示 */}
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <span className="text-xs font-medium text-text-secondary capitalize">
                    {agent.status}
                  </span>
                </motion.div>
              </div>

              {/* 文本内容 */}
              <h3 className="text-xl font-bold mb-2 text-text-primary">
                {agent.name}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {agent.desc}
              </p>

              {/* 操作按钮 */}
              <motion.button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${colors.text} hover:bg-white/20`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Chat →
              </motion.button>

              {/* 浮动装饰 */}
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `radial-gradient(circle, ${
                    agent.color === 'aurora'
                      ? 'rgba(110, 231, 183, 0.3)'
                      : agent.color === 'fresh-sky'
                      ? 'rgba(59, 130, 246, 0.3)'
                      : 'rgba(147, 51, 234, 0.3)'
                  }, transparent)`,
                }}
              />
            </motion.div>
          );
        })}

        {/* 创建自定义 Agent 卡片 */}
        <motion.div
          className="glass-card group cursor-pointer border border-dashed border-text-tertiary hover:border-aurora-300"
          variants={itemVariants}
          whileHover={{
            scale: 1.05,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 20,
          }}
        >
          <div className="h-full flex flex-col items-center justify-center text-center">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-300/20 to-aurora-300/5 flex items-center justify-center mb-4 group-hover:shadow-glow-aurora transition-shadow duration-300"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.5 }}
            >
              <Plus className="w-8 h-8 text-aurora-300" />
            </motion.div>

            <h3 className="text-xl font-bold mb-2 text-text-primary">
              Create Custom Agent
            </h3>
            <p className="text-text-secondary text-sm">
              构建您自己的智能体，专属您的需求。
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Agent;
