import { Platform } from 'react-native';

let app: any = null;
let auth: any = null;
let firebaseReady = false;

function initFirebase() {
  try {
    const firebaseApp = require('firebase/app');
    const firebaseAuthModule = require('firebase/auth');

    if (!firebaseApp || !firebaseAuthModule) {
      console.log('[Firebase] Modules not available');
      return;
    }

    const { initializeApp, getApps, getApp } = firebaseApp;
    const { getAuth, initializeAuth } = firebaseAuthModule;

    const firebaseConfig = {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
    };

    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.log('[Firebase] Missing config, skipping initialization');
      return;
    }

    console.log('[Firebase] Initializing with project:', firebaseConfig.projectId);

    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
    } catch (appError: any) {
      console.log('[Firebase] App init error:', appError?.message);
      return;
    }

    try {
      if (Platform.OS === 'web') {
        auth = getAuth(app);
      } else {
        try {
          auth = initializeAuth(app);
        } catch (e: any) {
          auth = getAuth(app);
        }
      }
    } catch (authError: any) {
      console.log('[Firebase] Auth init error:', authError?.message);
      return;
    }

    firebaseReady = true;
    console.log('[Firebase] Initialized successfully');
  } catch (error: any) {
    console.log('[Firebase] Init error:', error?.message || error);
    firebaseReady = false;
  }
}

try {
  initFirebase();
} catch (e: any) {
  console.log('[Firebase] Top-level init failed:', e?.message || e);
}

export { app, auth, firebaseReady };
