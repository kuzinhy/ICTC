import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertCircle, Info, AlertTriangle, 
  Crown, X, Sparkles, ExternalLink 
} from 'lucide-react';
import { useToast, ToastItem, ToastType } from '../context/ToastContext';

interface ToastCardProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onRemove }) => {
  const duration = toast.duration ?? 3500;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onRemove(toast.id);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [duration, onRemove, toast.id]);

  const getToastConfig = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
          bgColor: 'bg-white border-emerald-200/80 shadow-emerald-500/10',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          progressBar: 'bg-emerald-500',
          defaultTitle: 'Thành công',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
          bgColor: 'bg-white border-rose-200/80 shadow-rose-500/10',
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
          progressBar: 'bg-rose-500',
          defaultTitle: 'Đã xảy ra lỗi',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
          bgColor: 'bg-white border-amber-200/80 shadow-amber-500/10',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
          progressBar: 'bg-amber-500',
          defaultTitle: 'Lưu ý',
        };
      case 'vip':
        return {
          icon: <Crown className="w-5 h-5 text-amber-500 fill-amber-400 shrink-0 mt-0.5 animate-pulse" />,
          bgColor: 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 border-amber-300 shadow-amber-500/15',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-amber-400 font-black',
          progressBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          defaultTitle: 'Đặc quyền VIP',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
          bgColor: 'bg-white border-blue-200/80 shadow-blue-500/10',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-100',
          progressBar: 'bg-blue-500',
          defaultTitle: 'Thông báo',
        };
    }
  };

  const config = getToastConfig(toast.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={`relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md transition-all ${config.bgColor}`}
      role="alert"
    >
      <div className="p-4 flex items-start space-x-3.5">
        {config.icon}

        <div className="flex-1 min-w-0 pr-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-xs font-black text-slate-900 tracking-tight flex items-center space-x-1.5">
              <span>{toast.title || config.defaultTitle}</span>
              {toast.type === 'vip' && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] rounded font-bold uppercase">
                  VIP
                </span>
              )}
            </h5>
          </div>

          <p className="text-xs text-slate-600 font-medium leading-relaxed break-words">
            {toast.message}
          </p>

          {toast.action && (
            <div className="pt-2">
              <button
                onClick={() => {
                  toast.action?.onClick();
                  onRemove(toast.id);
                }}
                className="inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200/60 transition-all active:scale-95"
              >
                <span>{toast.action.label}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onRemove(toast.id)}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 -mr-1 -mt-1"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      {duration > 0 && (
        <div className="w-full h-1 bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${config.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <aside
      aria-label="Thông báo hệ thống"
      className="fixed bottom-5 right-5 z-[99999] flex flex-col space-y-3 pointer-events-none max-w-[calc(100vw-2.5rem)]"
    >
      <div className="pointer-events-auto flex flex-col space-y-3">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </aside>
  );
};
