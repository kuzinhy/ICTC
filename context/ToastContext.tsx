import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'vip';

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends ToastOptions {
  id: string;
  createdAt: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ToastOptions | string, type?: ToastType) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  vip: (message: string, title?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global custom event name for firing toasts outside React context
const TOAST_EVENT_NAME = 'ictc_global_toast_event';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options: ToastOptions | string, type: ToastType = 'info'): string => {
    const id = typeof options === 'object' && options.id ? options.id : `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const toastItem: ToastItem = typeof options === 'string'
      ? {
          id,
          message: options,
          type,
          duration: 3500,
          createdAt: Date.now(),
        }
      : {
          ...options,
          id,
          type: options.type || type,
          duration: options.duration ?? 3500,
          createdAt: Date.now(),
        };

    setToasts((prev) => {
      // Keep at most 4 toasts visible at a time
      const filtered = prev.filter((t) => t.id !== id);
      return [...filtered.slice(-3), toastItem];
    });

    return id;
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'success' });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'error' });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'info' });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'warning' });
  }, [showToast]);

  const vip = useCallback((message: string, title?: string) => {
    return showToast({ message, title, type: 'vip', duration: 4500 });
  }, [showToast]);

  // Listen to global window custom events
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastOptions>;
      if (customEvent.detail) {
        showToast(customEvent.detail);
      }
    };

    window.addEventListener(TOAST_EVENT_NAME, handleCustomToast);
    return () => {
      window.removeEventListener(TOAST_EVENT_NAME, handleCustomToast);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        clearToasts,
        success,
        error,
        info,
        warning,
        vip,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global helper for firing toasts from anywhere (even outside components)
export const globalToast = {
  show: (options: ToastOptions | string, type: ToastType = 'info') => {
    const payload: ToastOptions = typeof options === 'string' 
      ? { message: options, type } 
      : { ...options, type: options.type || type };
    window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail: payload }));
  },
  success: (message: string, title?: string) => {
    globalToast.show({ message, title, type: 'success' });
  },
  error: (message: string, title?: string) => {
    globalToast.show({ message, title, type: 'error' });
  },
  info: (message: string, title?: string) => {
    globalToast.show({ message, title, type: 'info' });
  },
  warning: (message: string, title?: string) => {
    globalToast.show({ message, title, type: 'warning' });
  },
  vip: (message: string, title?: string) => {
    globalToast.show({ message, title, type: 'vip', duration: 4500 });
  },
};
