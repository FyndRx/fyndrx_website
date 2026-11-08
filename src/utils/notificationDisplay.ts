// Notification-specific styling: icon SHAPE/color by notification type, used by
// both NotificationDropdown.vue (header bell) and NotificationsView.vue
// (/notifications). Status color itself now lives in statusColors.ts, the single
// shared map also used by Orders, Order detail, Prescriptions, and Transactions.

import { getStatusColor } from '@/utils/statusColors';

export type NotificationIconKey = 'order' | 'prescription' | 'pharmacy' | 'broadcast' | 'price_alert' | 'info';

interface TypeStyle {
  iconKey: NotificationIconKey;
  containerClass: string;
}

// Flat, single-hue fill — bg tint matches the icon's own text color.
const TYPE_CONTAINER_CLASS: Record<NotificationIconKey, string> = {
  // The icon shape already tells the types apart, so colour stays within the brand palette:
  // blue for account/clinical items, orange for order and announcement activity.
  order: 'bg-accent-500/15 text-accent-600 dark:text-accent-400',
  prescription: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  pharmacy: 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
  broadcast: 'bg-accent-500/15 text-accent-600 dark:text-accent-400',
  // Emerald, matching PriceAlertButton's "watching" color and the "completed/paid"
  // status family — reinforces "savings/good news" the same way everywhere it appears.
  price_alert: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  info: 'bg-gray-500/10 text-gray-600 dark:text-gray-300',
};

// Backend types seen today: ORDER_STATUS_UPDATE, NEW_ORDER, NEW_PRESCRIPTION,
// PRESCRIPTION_PRICED, NEW_PHARMACY_APPLICATION, BROADCAST (admin campaigns via
// BroadcastService), PRICE_ALERT (a watched medication's price dropped) —
// matched by substring so future ORDER_*/PRESCRIPTION_*/PHARMACY_* additions
// are covered without a code change.
export function getNotificationTypeStyle(type?: string | null): TypeStyle {
  const t = type || '';
  if (t.includes('ORDER')) return { iconKey: 'order', containerClass: TYPE_CONTAINER_CLASS.order };
  if (t.includes('PRESCRIPTION')) return { iconKey: 'prescription', containerClass: TYPE_CONTAINER_CLASS.prescription };
  if (t.includes('PHARMACY')) return { iconKey: 'pharmacy', containerClass: TYPE_CONTAINER_CLASS.pharmacy };
  if (t.includes('BROADCAST')) return { iconKey: 'broadcast', containerClass: TYPE_CONTAINER_CLASS.broadcast };
  if (t.includes('PRICE_ALERT')) return { iconKey: 'price_alert', containerClass: TYPE_CONTAINER_CLASS.price_alert };
  return { iconKey: 'info', containerClass: TYPE_CONTAINER_CLASS.info };
}

export interface NotificationStyle {
  iconKey: NotificationIconKey;
  containerClass: string;
  pillClass: string;
  dotClass: string;
  glowClass: string;
  statusLabel: string;
}

// Color is driven by STATUS first, TYPE as fallback. Almost every notification in
// practice is type ORDER_STATUS_UPDATE, so coloring by type alone made every icon
// the same amber/orange regardless of whether the order was pending, processing,
// or cancelled. Status carries the meaning worth coloring.
export function getNotificationStyle(type?: string | null, status?: string | null): NotificationStyle {
  const typeStyle = getNotificationTypeStyle(type);

  if (status) {
    const statusColor = getStatusColor(status);
    return {
      iconKey: typeStyle.iconKey,
      containerClass: statusColor.container,
      pillClass: statusColor.pill,
      dotClass: statusColor.dot,
      glowClass: statusColor.glow,
      statusLabel: statusColor.label,
    };
  }

  return {
    iconKey: typeStyle.iconKey,
    containerClass: typeStyle.containerClass,
    pillClass: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    dotClass: 'bg-gray-500',
    glowClass: '',
    statusLabel: '',
  };
}
