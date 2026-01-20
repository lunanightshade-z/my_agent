/**
 * 魔法主题导航栏 (Magic Navigation Bar)
 * 液态玻璃效果 + 金色主题 + 魔法字体
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles, MessageSquare, Wand2 } from 'lucide-react';

const MagicNavbar = () => {
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState(null);

  const navItems = [
    { path: '/', label: '首页', icon: Sparkles },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/agent', label: 'Agent', icon: Wand2 },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-gradient-to-b from-[#0a0e17] to-transparent"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <motion.div
            className="flex items-center gap-3 group cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-2 border border-amber-500/30 rounded-full group-hover:rotate-180 transition-transform duration-700 bg-black/40 backdrop-blur-md">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <span className="font-magic-title text-xl text-amber-100 tracking-widest group-hover:text-amber-400 transition-colors">
              POWERFUL
            </span>
          </motion.div>
        </Link>

        {/* 导航菜单 */}
        <div className="hidden md:flex gap-8 text-sm tracking-widest font-bold text-amber-200/60 uppercase">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path}>
              <motion.div
                className={`relative group cursor-pointer flex items-center gap-2 ${
                  isActive(path) ? 'text-amber-400' : 'hover:text-amber-400'
                } transition-all duration-300`}
                onMouseEnter={() => setHoveredNav(path)}
                onMouseLeave={() => setHoveredNav(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-amber-400 transition-all duration-300 group-hover:w-full"></span>
                {isActive(path) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-2 left-0 right-0 h-[2px] bg-amber-400"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>

        {/* 登录按钮 */}
        <motion.button
          className="px-6 py-2 border border-amber-500/50 rounded-sm font-magic-title text-xs text-amber-300 hover:bg-amber-900/40 hover:border-amber-400 transition-all tracking-widest uppercase backdrop-blur-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>

        {/* 移动端菜单按钮 */}
        <motion.button
          className="md:hidden p-2 text-amber-400 hover:text-amber-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default MagicNavbar;
