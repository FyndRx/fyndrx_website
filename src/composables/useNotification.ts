import { ref } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

// Per-type default lifetime, in ms — 0 means "don't auto-dismiss". Errors need
// deliberate acknowledgement (no timeout); warnings get more reading time than
// success/info, which are low-stakes and fine to disappear quickly.
const DEFAULT_DURATION: Record<Notification['type'], number> = {
  success: 5000,
  info: 5000,
  warning: 8000,
  error: 0,
};

export function useNotification() {
  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    duration?: number
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const resolvedDuration = duration ?? DEFAULT_DURATION[type];
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration: resolvedDuration
    };

    notifications.value.push(notification);

    if (resolvedDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, resolvedDuration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  };

  /** Dismiss every visible toast — used on route navigation. */
  const clearAll = () => {
    notifications.value = [];
  };

  const success = (title: string, message: string, duration?: number) => {
    return addNotification('success', title, message, duration);
  };

  const error = (title: string, message: string, duration?: number) => {
    return addNotification('error', title, message, duration);
  };

  const info = (title: string, message: string, duration?: number) => {
    return addNotification('info', title, message, duration);
  };

  const warning = (title: string, message: string, duration?: number) => {
    return addNotification('warning', title, message, duration);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    info,
    warning
  };
}

