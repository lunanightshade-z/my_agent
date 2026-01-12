/**
 * 全息导航舱 (Holographic Nav Pod)
 * 液态玻璃效果、动态光斑指示、磁吸交互
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Zap } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState(null);

  const navItems = [
    { path: '/', label: 'Home', icon: Sparkles },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/agent', label: 'Agent', icon: Zap },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* 背景模糊效果 */}
      <div className="absolute inset-0 h-20 glass-lg" />

      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-300 via-fresh-sky-400 to-lavender-500 flex items-center justify-center shadow-glow-aurora">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="gradient-text font-bold text-xl hidden sm:inline">
              MyAgent
            </span>
          </motion.div>
        </Link>

        {/* 导航菜单 - 中央胶囊 */}
        <motion.div
          className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-2"
          layoutId="navbar-pill"
        >
          {navItems.map(({ path, label, icon: Icon }) => (
            <motion.div
              key={path}
              className="relative"
              onMouseEnter={() => setHoveredNav(path)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              {/* 背景动画层 */}
              {isActive(path) && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-gradient-to-r from-aurora-300 via-fresh-sky-400 to-lavender-400 rounded-full opacity-30 blur-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Link to={path}>
                <motion.button
                  className={`relative px-6 py-2 rounded-full font-medium flex items-center gap-2 transition-all duration-300 ${
                    isActive(path)
                      ? 'text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>

                  {/* 流光效果 */}
                  {isActive(path) && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: [-100, 100] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{ pointerEvents: 'none' }}
                    />
                  )}
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* 右侧按钮 */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* GitHub 链接 */}
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon text-text-secondary hover:text-aurora-300 hover:bg-aurora-300/10"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </motion.a>

          {/* 移动端菜单按钮 (未来实现) */}
          <motion.button
            className="md:hidden btn-icon text-text-secondary hover:text-aurora-300 hover:bg-aurora-300/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
