/**
 * 落地页 (Landing Page / Home)
 * 3D 效果、吸引眼球的 Hero、特性展示
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Zap, MessageSquare, Brain } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  // 容器动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const floatingVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-[calc(100vh-6rem)]">
      {/* Hero Section */}
      <motion.section
        className="max-w-6xl mx-auto mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 左侧文案 */}
        <motion.div className="space-y-8" variants={itemVariants}>
          {/* 标签 */}
          <motion.div
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 w-fit"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-4 h-4 text-aurora-300" />
            <span className="text-sm font-medium text-text-secondary">
              AI-Powered Intelligence Platform
            </span>
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight"
            variants={itemVariants}
          >
            <span className="gradient-text">
              Ethereal
            </span>
            <br />
            <span className="gradient-text-pink">
              Intelligence
            </span>
          </motion.h1>

          {/* 副标题 */}
          <motion.p
            className="text-xl text-text-secondary leading-relaxed"
            variants={itemVariants}
          >
            与智能体交互，探索无限可能。我们提供流畅、直观的体验，让您轻松驾驭 AI 的力量。
          </motion.p>

          {/* CTA 按钮组 */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 pt-4"
            variants={itemVariants}
          >
            <motion.button
              onClick={() => navigate('/chat')}
              className="btn-primary flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Chatting
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              onClick={() => navigate('/agent')}
              className="btn-secondary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Agents
            </motion.button>
          </motion.div>
        </motion.div>

        {/* 右侧 3D 元素 */}
        <motion.div
          className="relative h-96 lg:h-full flex items-center justify-center"
          variants={floatingVariants}
        >
          {/* 背景光点 */}
          <div className="absolute w-96 h-96 bg-gradient-to-br from-aurora-300/30 via-fresh-sky-400/30 to-lavender-400/30 rounded-full blur-3xl animate-pulse" />

          {/* 悬浮球体 */}
          <motion.div
            className="relative w-64 h-64 rounded-full"
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {/* 外层球体 */}
            <div className="absolute inset-0 rounded-full glass border-2 border-white/50 shadow-glass-lg" />

            {/* 内层渐变 */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-aurora-300/40 via-fresh-sky-400/40 to-lavender-400/40" />

            {/* 中心光点 */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-aurora-300 to-fresh-sky-400 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              style={{ transform: 'translate(-50%, -50%)' }}
            />

            {/* 环绕圆环 */}
            <motion.div
              className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-aurora-300 via-transparent to-lavender-400 opacity-50"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="max-w-6xl mx-auto mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.h2
          className="text-4xl font-bold mb-16 text-center gradient-text"
          variants={itemVariants}
        >
          Why Choose MyAgent?
        </motion.h2>

        {/* 3 列网格 */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {[
            {
              icon: MessageSquare,
              title: 'Seamless Chat',
              desc: '流畅的对话体验，实时回应，感受 AI 的思想碰撞。',
              color: 'aurora',
            },
            {
              icon: Zap,
              title: 'Smart Agents',
              desc: '智能体系统，自动化繁琐任务，专注创意工作。',
              color: 'fresh-sky',
            },
            {
              icon: Brain,
              title: 'Deep Learning',
              desc: '基于最新 AI 技术，不断学习优化，赋能每一次交互。',
              color: 'lavender',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            const colorMap = {
              aurora: { bg: 'bg-aurora-300/20', text: 'text-aurora-400', glow: 'glow-aurora' },
              'fresh-sky': { bg: 'bg-fresh-sky-400/20', text: 'text-fresh-sky-400', glow: 'glow-blue' },
              lavender: { bg: 'bg-lavender-400/20', text: 'text-lavender-400', glow: 'glow-purple' },
            };
            const colors = colorMap[feature.color];

            return (
              <motion.div
                key={index}
                className="glass-card group cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  rotateX: 5,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                variants={itemVariants}
              >
                {/* 图标容器 */}
                <div className={`w-16 h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-6 group-hover:shadow-${colors.glow} transition-shadow duration-300`}>
                  <Icon className={`w-8 h-8 ${colors.text}`} />
                </div>

                {/* 文本 */}
                <h3 className="text-xl font-bold mb-3 text-text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {feature.desc}
                </p>

                {/* 角落装饰 */}
                <motion.div
                  className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle, ${
                      feature.color === 'aurora'
                        ? 'rgba(110, 231, 183, 0.4)'
                        : feature.color === 'fresh-sky'
                        ? 'rgba(59, 130, 246, 0.4)'
                        : 'rgba(147, 51, 234, 0.4)'
                    }, transparent)`,
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="max-w-2xl mx-auto text-center mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <motion.div className="glass-lg rounded-3xl p-12" variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-6">准备好了吗？</h2>
          <p className="text-text-secondary mb-8 text-lg">
            立即开启您的 AI 智能体之旅，体验未来的交互方式。
          </p>
          <motion.button
            onClick={() => navigate('/chat')}
            className="btn-primary mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            进入 Chat →
          </motion.button>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default Home;
