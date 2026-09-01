// Single source of truth for status color across the app: order status
// (OrdersView, OrderDetailView), prescription status (PrescriptionsView),
// payment/transaction status (TransactionsView, OrderDetailView), and
// notification status badges (NotificationDropdown, NotificationsView).
//
// Before this module existed, five different views each hand-rolled their own
// status -> color mapping, and they'd already drifted (e.g. order "completed"
// was gray in one place, indigo in another). One map means one place to update,
// and a status always means the same color no matter which page shows it.

export interface StatusColor {
  container: string;
  pill: string;
  dot: string;
  glow: string;
}

// Flat, single-hue fill for icon containers (bg tint matches the icon's own text
// color) — pills/dots were already flat, only `container` used to be a gradient.
const STATUS_COLORS: Record<string, StatusColor> = {
  pending: {
    container: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    pill: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    glow: 'shadow-[0_0_8px_#f59e0b]',
  },
  confirmed: {
    container: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
    pill: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
    glow: 'shadow-[0_0_8px_#0ea5e9]',
  },
  active: {
    container: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400',
    pill: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500',
    glow: 'shadow-[0_0_8px_#0ea5e9]',
  },
  processing: {
    container: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
    pill: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dot: 'bg-indigo-500',
    glow: 'shadow-[0_0_8px_#6366f1]',
  },
  ready: {
    container: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400',
    pill: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    dot: 'bg-cyan-500',
    glow: 'shadow-[0_0_8px_#06b6d4]',
  },
  out_for_delivery: {
    container: 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400',
    pill: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    dot: 'bg-orange-500',
    glow: 'shadow-[0_0_8px_#f97316]',
  },
  completed: {
    container: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_#10b981]',
  },
  dispensed: {
    container: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_#10b981]',
  },
  // Payment/transaction success states share the completed/dispensed hue —
  // "money settled" and "order fulfilled" are both a green end-state.
  paid: {
    container: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_#10b981]',
  },
  success: {
    container: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_0_8px_#10b981]',
  },
  cancelled: {
    container: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    pill: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    glow: 'shadow-[0_0_8px_#f43f5e]',
  },
  // Payment failure is the same "stopped/danger" signal as a cancelled order.
  failed: {
    container: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    pill: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dot: 'bg-rose-500',
    glow: 'shadow-[0_0_8px_#f43f5e]',
  },
  expired: {
    container: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
    pill: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400',
    glow: 'shadow-[0_0_8px_#9ca3af]',
  },
  // Refunded is a deliberate reversal, not a lapse — distinct violet keeps it
  // from reading as "the same gray nothing" as expired.
  refunded: {
    container: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
    pill: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    dot: 'bg-violet-500',
    glow: 'shadow-[0_0_8px_#8b5cf6]',
  },
};

const DEFAULT_STATUS_COLOR: StatusColor = {
  container: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
  pill: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  dot: 'bg-gray-500',
  glow: '',
};

export interface ResolvedStatus extends StatusColor {
  label: string;
}

export function getStatusColor(status?: string | null): ResolvedStatus {
  const key = (status || '').toLowerCase().trim();
  const color = (key && STATUS_COLORS[key]) || DEFAULT_STATUS_COLOR;
  const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return { ...color, label };
}
