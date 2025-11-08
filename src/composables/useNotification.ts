import { ref } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

const notifications = ref<Notification[]>([]);

export function useNotification() {
  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    notifications.value.push(notification);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
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
    success,
    error,
    info,
    warning
  };
}

