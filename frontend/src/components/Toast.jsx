/**
 * Toast 通知组件
 * 支持 success、error、warning、info 四种类型
 * 使用 Framer Motion 实现滑入/滑出动画
 */
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../store/store';

const Toast = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state) => state.chat.toasts || []);

  // 自动移除 toast
  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (toast.duration !== 0) {
        return setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration || 4000);
      }
      return null;
    });

    return () => {
      timers.forEach((timer) => timer && clearTimeout(timer));
    };
  }, [toasts, dispatch]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-aurora-300/30 to-aurora-300/20 border-aurora-300/50 text-aurora-400 shadow-glow-aurora';
      case 'error':
        return 'bg-gradient-to-r from-pink-accent-400/30 to-pink-accent-400/20 border-pink-accent-400/50 text-pink-accent-400 shadow-glow-pink';
      case 'warning':
        return 'bg-gradient-to-r from-lavender-400/30 to-lavender-400/20 border-lavender-400/50 text-lavender-400 shadow-glow-purple';
      case 'info':
        return 'bg-gradient-to-r from-fresh-sky-400/30 to-fresh-sky-400/20 border-fresh-sky-400/50 text-fresh-sky-400 shadow-glow-blue';
      default:
        return 'bg-white/20 border-white/30 text-text-secondary';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-aurora-300';
      case 'error':
        return 'text-pink-accent-400';
      case 'warning':
        return 'text-lavender-400';
      case 'info':
        return 'text-fresh-sky-400';
      default:
        return 'text-text-secondary';
    }
  };

  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8, rotate: 10 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.8, rotate: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="pointer-events-auto"
          >
            <div
              className={`
                min-w-[360px] max-w-md px-5 py-4 rounded-2xl border backdrop-blur-sm
                flex items-start gap-3
                ${getStyles(toast.type)}
              `}
            >
              {/* 图标 */}
              <div className={`flex-shrink-0 mt-0.5 ${getIconColor(toast.type)}`}>
                {getIcon(toast.type)}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <div className="font-semibold text-sm mb-1">{toast.title}</div>
                )}
                <div className="text-sm break-words">{toast.message}</div>
              </div>

              {/* 关闭按钮 */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch(removeToast(toast.id))}
                className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
