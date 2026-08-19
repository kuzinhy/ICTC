
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastProvider } from './context/ToastContext';

// Catch global unhandled promise rejections & runtime errors
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection captured:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.warn('Unhandled global error captured:', event.error || event.message);
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Component Tree:', error, errorInfo);
  }

  public render() {
    const { hasError } = (this as any).state || {};
    if (hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold">Hệ thống đã tự động phục hồi</h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ứng dụng vừa ghi nhận một phát sinh tạm thời và đã được khôi phục trạng thái an toàn. Bạn có thể nhấp bên dưới để tiếp tục.
            </p>
            <button
              onClick={() => {
                (this as any).setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Làm mới trang
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

