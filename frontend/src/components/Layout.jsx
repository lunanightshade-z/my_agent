/**
 * 主布局组件
 * 包含 Navbar 和页面路由区域
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* 液态背景 */}
      <div className="fixed inset-0 -z-10">
        {/* 彩色光点 */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-aurora-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-fresh-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-slow" />
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-lavender-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '-5s' }} />
      </div>

      {/* 导航栏 */}
      <Navbar />

      {/* 主内容区 - 添加顶部间距以避免被导航栏遮挡 */}
      <motion.main
        className="relative pt-24 px-4 sm:px-6 lg:px-8 pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Outlet />
      </motion.main>
    </div>
  );
};

export default Layout;
