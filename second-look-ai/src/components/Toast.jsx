import React, { useEffect } from 'react';
import { CheckIcon, WarningIcon, CloseIcon } from './Icons';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-teal';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-indigo';
      default: return 'bg-coral';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5" />;
      case 'warning':
        return <WarningIcon className="w-5 h-5" />;
      default:
        return <CloseIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 ${getBackgroundColor()} text-white px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out z-50 max-w-sm`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose}
          className="ml-auto text-white/80 hover:text-white transition-colors duration-200"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;