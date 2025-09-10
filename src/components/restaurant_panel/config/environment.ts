/* eslint-disable @typescript-eslint/no-explicit-any */
// Environment configuration with robust fallbacks
// Handles different build environments and missing environment variables

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  isFirebaseEnabled: boolean;
  firebase: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}

// Safely access environment variables
const getEnvVar = (key: string): string | undefined => {
  try {
    // Try different environment variable access methods
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key];
    }
    
    // Fallback for other environments
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
    
    // Fallback for window-based environments
    if (typeof window !== 'undefined' && (window as any).env) {
      return (window as any).env[key];
    }
    
    return undefined;
  } catch (error) {
    console.warn(`Failed to access environment variable ${key}:`, error);
    return undefined;
  }
};

// Determine environment
const isDevelopment = getEnvVar('NODE_ENV') === 'development' || 
                     getEnvVar('VITE_NODE_ENV') === 'development' ||
                     (!getEnvVar('NODE_ENV') && !getEnvVar('VITE_NODE_ENV')); // Default to development

const isProduction = getEnvVar('NODE_ENV') === 'production' || 
                    getEnvVar('VITE_NODE_ENV') === 'production';

// Firebase configuration
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID')
};

// Check if Firebase is properly configured
const isFirebaseEnabled = Object.values(firebaseConfig).every(
  value => value && value !== 'undefined' && value.trim() !== ''
);

// Export environment configuration
export const environment: EnvironmentConfig = {
  isDevelopment,
  isProduction,
  isFirebaseEnabled,
  firebase: firebaseConfig
};

// Log environment status
console.log('🌍 Environment Configuration:', {
  mode: isDevelopment ? 'development' : 'production',
  firebase: isFirebaseEnabled ? 'enabled' : 'mock mode',
  hasImportMeta: typeof import.meta !== 'undefined',
  hasProcess: typeof process !== 'undefined'
});

export default environment;