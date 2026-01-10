import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
};

// ToastProvider component
export const ToastProvider = ({ children }) => {
  const { toasts, showToast, removeToast } = useToast();
  
  return (
    <>
      {children}
      {/* Toast container will be rendered by individual Toast components */}
    </>
  );
};