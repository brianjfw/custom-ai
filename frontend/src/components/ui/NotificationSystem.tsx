"use client";

import { ReactNode, useState, useEffect, useRef, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: ReactNode;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  enableAnimations?: boolean;
}

export function NotificationProvider({
  children,
  maxNotifications = 5,
  position = 'top-right',
  enableAnimations = true,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addNotification = (notification: Omit<Notification, 'id'>): string => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
      dismissible: notification.dismissible ?? true,
      priority: notification.priority ?? 'medium',
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Remove excess notifications based on maxNotifications limit
      if (updated.length > maxNotifications) {
        const toRemove = updated.slice(maxNotifications);
        toRemove.forEach(n => {
          const timeout = timeoutsRef.current.get(n.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(n.id);
          }
        });
        return updated.slice(0, maxNotifications);
      }
      return updated;
    });

    // Auto-dismiss if duration is set and not a loading notification
    if (newNotification.duration && newNotification.duration > 0 && newNotification.type !== 'loading') {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setNotifications([]);
  };

  const getPositionClasses = () => {
    const baseClasses = "fixed z-notification pointer-events-none";
    switch (position) {
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'top-center':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom-center':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
    }}>
      {children}
      
      {/* Notification Container */}
      <div className={getPositionClasses()}>
        <div className="flex flex-col gap-3 w-96 max-w-[calc(100vw-2rem)]">
          {notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClose={() => removeNotification(notification.id)}
              enableAnimations={enableAnimations}
              index={index}
            />
          ))}
        </div>
      </div>
    </NotificationContext.Provider>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
  enableAnimations: boolean;
  index: number;
}

function NotificationItem({ notification, onClose, enableAnimations, index }: NotificationItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (enableAnimations) {
      const timer = setTimeout(() => setIsVisible(true), index * 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [enableAnimations, index]);

  const handleClose = () => {
    if (enableAnimations) {
      setIsExiting(true);
      setTimeout(onClose, 300);
    } else {
      onClose();
    }
  };

  const getTypeStyles = (type: NotificationType) => {
    const baseStyles = "glass-card relative overflow-hidden";
    switch (type) {
      case 'success':
        return `${baseStyles} border-l-4 border-accent-sage bg-gradient-to-r from-accent-sage/10 to-transparent`;
      case 'error':
        return `${baseStyles} border-l-4 border-accent-coral bg-gradient-to-r from-accent-coral/10 to-transparent`;
      case 'warning':
        return `${baseStyles} border-l-4 border-accent-amber bg-gradient-to-r from-accent-amber/10 to-transparent`;
      case 'info':
        return `${baseStyles} border-l-4 border-accent-blue bg-gradient-to-r from-accent-blue/10 to-transparent`;
      case 'loading':
        return `${baseStyles} border-l-4 border-accent-blue bg-gradient-to-r from-accent-blue/10 to-transparent`;
      default:
        return `${baseStyles} border-l-4 border-accent-blue bg-gradient-to-r from-accent-blue/10 to-transparent`;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    if (notification.icon) return notification.icon;
    
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-accent-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-accent-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'loading':
        return (
          <div className="glass-loading-dots">
            <div className="glass-loading-dot bg-accent-blue"></div>
            <div className="glass-loading-dot bg-accent-blue"></div>
            <div className="glass-loading-dot bg-accent-blue"></div>
          </div>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getPriorityIndicator = (priority: string = 'medium') => {
    const priorityMap = {
      low: 'bg-accent-sage/40',
      medium: 'bg-accent-blue/40',
      high: 'bg-accent-amber/40',
      critical: 'bg-accent-coral/40',
    };
    return priorityMap[priority as keyof typeof priorityMap] || priorityMap.medium;
  };

  return (
    <div
      className={cn(
        getTypeStyles(notification.type),
        "pointer-events-auto min-h-[80px] transition-all duration-glass-normal",
        enableAnimations && !isVisible && "opacity-0 translate-x-full scale-95",
        enableAnimations && isVisible && !isExiting && "opacity-100 translate-x-0 scale-100 animate-glass-fade-in",
        enableAnimations && isExiting && "opacity-0 translate-x-full scale-95",
        "hover:shadow-glass-xl hover:scale-[1.02] cursor-pointer group"
      )}
      onClick={notification.action?.onClick}
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-glass-gradient-soft opacity-0 group-hover:opacity-100 transition-opacity duration-glass-normal pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      {/* Priority indicator */}
      <div className={cn(
        "absolute top-0 right-0 w-2 h-2 rounded-full",
        getPriorityIndicator(notification.priority)
      )} />
      
      <div className="relative z-10 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {getTypeIcon(notification.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-glass font-semibold text-sm mb-1 leading-tight">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="text-glass-secondary text-xs leading-relaxed">
                {notification.message}
              </p>
            )}
            
            {/* Action button */}
            {notification.action && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  notification.action!.onClick();
                }}
                className="glass-button-secondary text-xs px-3 py-1 mt-3 hover:scale-105 transition-transform duration-glass-normal"
              >
                {notification.action.label}
              </button>
            )}
          </div>
          
          {/* Close button */}
          {notification.dismissible && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="flex-shrink-0 glass-button p-1 text-glass-secondary hover:text-glass transition-colors duration-glass-normal"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Convenience hooks for different notification types
export function useNotificationHelpers() {
  const { addNotification, removeNotification, clearAll } = useNotifications();

  return {
    success: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'info', title, message, ...options }),
    
    loading: (title: string, message?: string, options?: Partial<Notification>) =>
      addNotification({ type: 'loading', title, message, duration: 0, dismissible: false, ...options }),
    
    remove: removeNotification,
    clearAll,
  };
}