import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let messagingPromise: Promise<Messaging | null> = Promise.resolve(null);

// Only initialize if we have the config
if (firebaseConfig.apiKey) {
  try {
    app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
      messagingPromise = isSupported().then((supported) => {
        if (supported && app) {
          return getMessaging(app);
        }
        console.warn('Firebase Messaging is not supported in this browser.');
        return null;
      }).catch((err) => {
        console.warn('Failed to check Firebase Messaging support:', err);
        return null;
      });
    }
  } catch (error) {
    console.error('Firebase initialization error', error);
  }
}

export const requestNotificationPermission = async (): Promise<string | null> => {
  const messaging = await messagingPromise;
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    } else {
      console.log('Notification permission denied.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission or token:', error);
    return null;
  }
};

export const onForegroundMessage = async (callback: (payload: any) => void) => {
  const messaging = await messagingPromise;
  if (!messaging) return;
  return onMessage(messaging, callback);
};

export { app };
