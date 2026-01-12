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
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
            className="pointer-events-auto"
          >
            <div
              className={`
                min-w-[320px] max-w-md px-4 py-3 rounded-lg border shadow-lg
                flex items-start gap-3
                ${getStyles(toast.type)}
              `}
            >
              {/* 图标 */}
              <div className={`flex-shrink-0 ${getIconColor(toast.type)}`}>
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
              <button
                onClick={() => dispatch(removeToast(toast.id))}
                className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
