 
/* eslint-disable @typescript-eslint/no-explicit-any */
// Firebase client configuration with mock fallback
// Supports both real Firebase and mock mode for development
// REFACTORED: This version initializes online Firebase services only — no emulator connections.

import { environment } from './config/environment';

let auth: any = null;
let firestore: any = null;
let storage: any = null;
let firebase: any = null;

if (environment.isFirebaseEnabled) {
  try {
    // Initialize Firebase (dynamic import to keep bundlers/build setups flexible)
    import('firebase/app').then(async ({ initializeApp }) => {
      const app = initializeApp(environment.firebase);

      // Initialize Firebase services (modular SDK)
      const { getAuth } = await import('firebase/auth');
      const { getFirestore } = await import('firebase/firestore');
      const { getStorage } = await import('firebase/storage');

      auth = getAuth(app);
      firestore = getFirestore(app);
      storage = getStorage(app);

      firebase = app;
      console.log('🔥 Firebase initialized (online services).');
    }).catch((error) => {
      console.warn('⚠️  Firebase initialization failed, falling back to mock mode:', error);
    });
  } catch (error) {
    console.warn('⚠️  Firebase modules not available, falling back to mock mode:', error);
  }
} else {
  console.log('🔄 Firebase client running in mock mode');
  console.log('💡 To enable real Firebase, add environment variables:');
  console.log('   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.');
}

// Export services (will be null in mock mode or until initialization finishes)
export { auth, firestore, storage };
export default firebase;

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => firebase !== null;

// Mock mode indicator
export const isMockMode = () => !environment.isFirebaseEnabled;
