import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Heart, MessageSquare, User, AlertCircle, X } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  showPanel: boolean;
  onClose: () => void;
  onClear: () => void;
  isAdmin: boolean;
}

export default function NotificationCenter({
  notifications,
  showPanel,
  onClose,
  onClear,
  isAdmin
}: NotificationCenterProps) {
  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'memory':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'guestbook':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-emerald-500" />;
      case 'profile':
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gold-classic" />;
    }
  };

  const getTimeString = (createdAt: any) => {
    if (!createdAt) return 'Baru saja';
    try {
      const d = createdAt.seconds ? new Date(createdAt.seconds * 1000) : new Date(createdAt);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed right-4 top-20 z-50 w-80 max-h-[80vh] overflow-y-auto glass-strong p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between border-b border-white/10 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gold-classic animate-pulse-soft" />
              <h3 className="font-display font-bold text-emerald-deep dark:text-gold-soft">Aktivitas Terbaru</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-full transition-colors text-emerald-medium dark:text-zinc-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto max-h-[55vh] pr-1">
            {notifications.length === 0 ? (
              <p className="text-xs text-center text-zinc-400 py-8">Belum ada aktivitas baru.</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex gap-3 p-2.5 rounded-lg bg-emerald-medium/5 dark:bg-emerald-light/5 hover:bg-emerald-medium/10 transition-colors border border-white/5"
                >
                  <div className="mt-1 p-1 bg-white/50 dark:bg-black/20 rounded-full flex-shrink-0 self-start">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-display font-semibold text-xs text-emerald-deep dark:text-zinc-200 leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
                      {notif.description}
                    </p>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-1">
                      {getTimeString(notif.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && isAdmin && (
            <button
              onClick={onClear}
              className="mt-2 text-center text-[11px] text-rose-500 hover:text-rose-600 hover:underline cursor-pointer"
            >
              Bersihkan semua riwayat (Admin)
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple Toast Notification for instant updates
interface ToastProps {
  message: string;
  onClose: () => void;
}

export function ToastNotification({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 glass-strong p-4 flex items-center gap-3 border-l-4 border-l-gold-classic max-w-sm"
    >
      <Bell className="w-5 h-5 text-gold-classic fill-gold-classic/20 flex-shrink-0 animate-bounce" />
      <div className="flex-1">
        <p className="font-display font-bold text-xs text-emerald-deep dark:text-gold-soft">Aktivitas Baru!</p>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 ml-0.5 leading-snug">{message}</p>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded">
        <X className="w-3.5 h-3.5 text-zinc-400" />
      </button>
    </motion.div>
  );
}
