import React, { useEffect } from 'react';
import { Bell, Sparkles, X } from 'lucide-react';

interface NotificationToastProps {
  notification: { title: string; body: string } | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-bounce-short">
      <div className="glass-panel-glow p-3.5 rounded-2xl flex items-start space-x-3 border-purple-400/40 text-slate-100 shadow-2xl">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 pr-1">
          <h4 className="text-xs font-bold text-purple-200 tracking-wide uppercase flex items-center gap-1.5">
            <Bell className="w-3 h-3 text-sky-400" />
            {notification.title}
          </h4>
          <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
            {notification.body}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Chiudi notifica"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
