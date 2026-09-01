/* eslint-env serviceworker */
/* global firebase */
// Scripts for firebase and firebase messaging
// Note: We use the compat builds for the service worker
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// This config mirrors src/services/firebase.ts. Vite doesn't inject env vars into
// static public/ files, and this config isn't secret (Firebase web config is a
// public client identifier, protected by Firebase security rules, not secrecy),
// so it's hardcoded here to match the app's Firebase project.
const firebaseConfig = {
  apiKey: "AIzaSyB_N2Fq5Z72qJEnJGraWzqiiJqTnt2Msjc",
  authDomain: "fyndrx-75517.firebaseapp.com",
  projectId: "fyndrx-75517",
  storageBucket: "fyndrx-75517.firebasestorage.app",
  messagingSenderId: "322076743399",
  appId: "1:322076743399:web:3d09bc0a19f2f86ae17442"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Custom background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.data?.title || payload.notification?.title || 'New Notification';
    const notificationOptions = {
      body: payload.data?.body || payload.notification?.body || 'You have a new update.',
      icon: payload.notification?.icon || '/notification-icon.png',
      badge: '/notification-badge.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.log("Firebase background SW error:", e);
}
