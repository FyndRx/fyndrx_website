// Single source of truth for the authenticated dashboard's sidebar navigation.
// Kept separate from the router so DashboardSidebar.vue stays presentation-only —
// add a destination here, not by hand-writing markup in the sidebar component.

export interface DashboardNavItem {
  label: string;
  to: string;
  /** route names that should highlight this item as active, beyond an exact path match
   * (e.g. viewing a single order should still highlight "Orders"). */
  matchNames: string[];
  icon: string[];
  /** shows a live badge (e.g. unread notification count) next to the label. */
  badge?: 'unreadNotifications';
}

export interface DashboardNavGroup {
  label?: string;
  items: DashboardNavItem[];
}

const ICONS = {
  dashboard: ['M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'],
  orders: ['M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'],
  prescriptions: ['M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'],
  consultations: ['M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'],
  transactions: ['M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'],
  notifications: ['M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'],
  favorites: ['M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'],
  priceAlerts: ['M13 17h8m0 0V9m0 8L11 5l-4 4-6-6'],
  medications: ['M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'],
  pharmacies: ['M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'],
  profile: ['M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
  settings: [
    'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  ],
  upload: ['M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'],
  security: ['M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'],
};

export const DASHBOARD_UPLOAD_CTA: DashboardNavItem = {
  label: 'Upload Prescription',
  to: '/upload-prescription',
  matchNames: ['upload-prescription'],
  icon: ICONS.upload,
};

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    items: [
      { label: 'Dashboard', to: '/dashboard', matchNames: ['dashboard'], icon: ICONS.dashboard },
      { label: 'Orders', to: '/orders', matchNames: ['orders', 'order-detail'], icon: ICONS.orders },
      { label: 'Prescriptions', to: '/prescriptions', matchNames: ['prescriptions'], icon: ICONS.prescriptions },
      {
        label: 'Consultations',
        to: '/consultations',
        matchNames: ['consultations', 'create-consultation', 'consultation-detail', 'consultation-print'],
        icon: ICONS.consultations,
      },
      { label: 'Transactions', to: '/transactions', matchNames: ['transactions'], icon: ICONS.transactions },
      {
        label: 'Notifications',
        to: '/notifications',
        matchNames: ['notifications'],
        icon: ICONS.notifications,
        badge: 'unreadNotifications',
      },
      { label: 'Favorites', to: '/favorites', matchNames: ['favorites'], icon: ICONS.favorites },
      { label: 'Price Alerts', to: '/price-alerts', matchNames: ['price-alerts'], icon: ICONS.priceAlerts },
    ],
  },
  {
    label: 'Shop',
    items: [
      { label: 'Browse Medications', to: '/medications', matchNames: ['medications', 'MedicationDetail'], icon: ICONS.medications },
      { label: 'Find Pharmacies', to: '/pharmacies', matchNames: ['pharmacies', 'pharmacy', 'pharmacy-branch'], icon: ICONS.pharmacies },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', to: '/profile', matchNames: ['profile', 'edit-profile', 'delete-account'], icon: ICONS.profile },
      { label: 'Notifications Settings', to: '/profile/notification-settings', matchNames: ['notification-settings'], icon: ICONS.settings },
      { label: 'Security', to: '/profile/security', matchNames: ['security-settings'], icon: ICONS.security },
    ],
  },
];
