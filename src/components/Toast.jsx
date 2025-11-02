// src/components/Toast.jsx
import React, { useEffect } from 'react';
import { Check, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type, onClose }) => {
  // This effect will automatically close the toast after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer); // Clean up the timer
  }, [onClose]);

  const bgColor =
    type === 'success' ? 'bg-emerald-500' :
    type === 'error' ? 'bg-red-500' :
    'bg-blue-500';

  const Icon =
    type === 'success' ? Check :
    type === 'error' ? AlertCircle :
    AlertCircle; // Default to AlertCircle

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 z-50 max-w-md`}
    >
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X size={18} />
      </button>
    </div>
  );
};
