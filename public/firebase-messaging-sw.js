/* eslint-env serviceworker */
/* global firebase */
// Scripts for firebase and firebase messaging
// Note: We use the compat builds for the service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// To receive background messages we must initialize the app here as well.
// We get the config via URL query parameters (or you can hardcode them here if needed,
// but they must match the main app's config).
// Wait, environment variables aren't natively injected here by Vite in public/.
// We will use a placeholder config that the user should fill, OR just accept that
// they need to manually insert it if they want background notifications.

// Initialize the Firebase app in the service worker by passing in
// the messagingSenderId.
// For background notifications, Firebase technically only needs the messagingSenderId
// but providing the full config is safer.
const firebaseConfig = {
  // USER_TODO: Fill this with your Firebase Config for background notifications to work
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

try {
  if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Custom background message handler
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.data?.title || payload.notification?.title || 'New Notification';
      const notificationOptions = {
        body: payload.data?.body || payload.notification?.body || 'You have a new update.',
        icon: '/favicon.ico'
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (e) {
  console.log("Firebase background SW error:", e);
}
