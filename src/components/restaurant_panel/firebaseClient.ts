// Firebase client configuration with demo fallback
// Supports both real Firebase and demo mode for development

import { environment } from './config/environment';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { FirebaseStorage } from 'firebase/storage';
import type { FirebaseApp } from 'firebase/app';

let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let firebase: FirebaseApp | null = null;
let firebaseInitialized = false;
let firebaseInitializing = false;

// Data mode management
type DataMode = 'mock' | 'firebase';
let currentDataMode: DataMode = 'mock';

// Helper function to check if Firebase is available
export const isFirebaseAvailable = () => firebase !== null && firebaseInitialized;

// Firebase availability check
export const isFirebaseConfigured = () => environment.isFirebaseEnabled;

// Data mode management functions
export const getDataMode = (): DataMode => {
  const savedMode = localStorage.getItem('restaurant-panel-data-mode') as DataMode;
  if (savedMode && (savedMode === 'mock' || savedMode === 'firebase')) {
    currentDataMode = savedMode;
  }
  return currentDataMode;
};

export const setDataMode = (mode: DataMode): void => {
  currentDataMode = mode;
  localStorage.setItem('restaurant-panel-data-mode', mode);
  console.log(`🔄 Data mode switched to: ${mode.toUpperCase()}`);
};

export const toggleDataMode = (): DataMode => {
  const newMode = currentDataMode === 'mock' ? 'firebase' : 'mock';
  setDataMode(newMode);
  return newMode;
};

// Check if we're in mock mode (updated to use data mode)
export const isMockMode = () => {
  const mode = getDataMode();
  return mode === 'mock' || !environment.isFirebaseEnabled;
};

// Initialize Firebase if enabled
const initializeFirebase = async (): Promise<boolean> => {
  if (firebaseInitializing || firebaseInitialized) {
    return firebaseInitialized;
  }

  if (!environment.isFirebaseEnabled) {
    console.log('🔄 Firebase client running in demo mode');
    console.log('💡 To enable real Firebase, add environment variables:');
    console.log('   REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_AUTH_DOMAIN, etc.');
    console.log('📋 Demo mode allows full application functionality with local data');
    return false;
  }

  firebaseInitializing = true;

  try {
    // Try to initialize Firebase only if config is available
    const { initializeApp } = await import('firebase/app');
    const app = initializeApp(environment.firebase);
    
    // Initialize Firebase services
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');
    
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
    
    firebase = app;
    firebaseInitialized = true;
    console.log('🔥 Firebase initialized successfully');
    return true;
  } catch (error) {
    console.warn('⚠️  Firebase initialization failed, falling back to mock mode:', error);
    firebaseInitialized = false;
    return false;
  } finally {
    firebaseInitializing = false;
  }
};

// Initialize data mode from localStorage
getDataMode();

// Auto-initialize Firebase if enabled
if (environment.isFirebaseEnabled) {
  initializeFirebase();
} else {
  console.log('🔄 Firebase client running in demo mode');
  console.log('💡 To enable real Firebase, add environment variables:');
  console.log('   REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_AUTH_DOMAIN, etc.');
  console.log('📋 Demo mode allows full application functionality with local data');
}

// Export services (will be null in mock mode)
export { auth, firestore, storage };
export default firebase;

// Async function to ensure Firebase is initialized before use
export const waitForFirebaseInit = async (): Promise<boolean> => {
  if (!environment.isFirebaseEnabled) {
    return false;
  }
  
  if (firebaseInitialized) {
    return true;
  }
  
  if (!firebaseInitializing) {
    return await initializeFirebase();
  }
  
  // Wait for initialization to complete
  let attempts = 0;
  while (firebaseInitializing && attempts < 50) { // Max 5 seconds
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  return firebaseInitialized;
};