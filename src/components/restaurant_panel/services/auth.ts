/* eslint-disable @typescript-eslint/no-explicit-any */
 
import type { User, CreateUserData, UserRole } from '../types/user';
import { auth, firestore, isMockMode } from '../firebaseClient';

// Mock user for development
const mockUser: User = {
  id: 'mock-user-id',
  email: 'owner@restaurant.com',
  name: 'Demo Owner',
  role: 'owner',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date()
};

// Mock credentials for different roles
const mockCredentials = {
  'owner@restaurant.com': { password: 'owner123', user: { ...mockUser, role: 'owner' as UserRole } },
  'manager@restaurant.com': { password: 'manager123', user: { ...mockUser, email: 'manager@restaurant.com', name: 'Demo Manager', role: 'manager' as UserRole } },
  'host@restaurant.com': { password: 'host123', user: { ...mockUser, email: 'host@restaurant.com', name: 'Demo Host', role: 'host' as UserRole } },
  'server@restaurant.com': { password: 'server123', user: { ...mockUser, email: 'server@restaurant.com', name: 'Demo Server', role: 'server' as UserRole } }
};

// helper: remove undefined values before writing to Firestore
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// Sign up new user with role metadata
export const signUpUser = async (
  email: string, 
  password: string, 
  userData: CreateUserData
): Promise<User> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock signup:', { email, userData });
    return { 
      ...mockUser, 
      id: `mock-${Date.now()}`,
      email, 
      name: userData.name, 
      role: userData.role,
      restaurantId: userData.restaurantId
    };
  }

  // Real Firebase implementation
  if (!auth || !firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { doc, setDoc } = await import('firebase/firestore');
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, {
      displayName: userData.name
    });

    // Create user document in Firestore
    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      restaurantId: userData.restaurantId,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date()
    };

    // Build payload and sanitize undefined fields (prevents Firestore error)
    const payload = {
      ...newUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    const sanitizedPayload = sanitizeForFirestore(payload);

    await setDoc(doc(firestore, 'users', firebaseUser.uid), sanitizedPayload);

    console.log('✅ User created successfully:', newUser.email);
    return newUser;
  } catch (error: unknown) {
    console.error('❌ Signup error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create account');
  }
};

// Sign in existing user
export const signInUser = async (email: string, password: string): Promise<User> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock signin:', email);
    
    // Check mock credentials
    const credentials = mockCredentials[email as keyof typeof mockCredentials];
    if (credentials && credentials.password === password) {
      console.log('✅ Mock user signed in successfully:', { email, role: credentials.user.role });
      return credentials.user;
    } else {
      throw new Error('Invalid email or password. Use demo credentials from the login screen.');
    }
  }

  // Real Firebase implementation
  if (!auth || !firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { doc, getDoc, updateDoc } = await import('firebase/firestore');
    
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user document from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data();
    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      restaurantId: userData.restaurantId,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: new Date()
    };

    // Update last login time
    await updateDoc(doc(firestore, 'users', firebaseUser.uid), {
      lastLoginAt: new Date().toISOString()
    });

    console.log('✅ User signed in successfully:', user.email);
    return user;
  } catch (error: unknown) {
    console.error('❌ Signin error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to sign in');
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  if (isMockMode()) {
    console.log('Mock signout');
    return Promise.resolve();
  }

  // Real Firebase implementation
  if (!auth) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    console.log('✅ User signed out successfully');
  } catch (error: unknown) {
    console.error('❌ Signout error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to sign out');
  }
};

// Get current authenticated user
export const getCurrentUser = async (): Promise<User | null> => {
  if (isMockMode()) {
    return Promise.resolve(null);
  }

  // Real Firebase implementation
  if (!auth || !firestore) {
    return null;
  }

  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || userData.email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      restaurantId: userData.restaurantId,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined
    };
  } catch (error: unknown) {
    console.error('❌ Get current user error:', error);
    return null;
  }
};

// Check if user has required role for access control
export const hasRole = (user: User | null, requiredRoles: UserRole[]): boolean => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void): (() => void) => {
  if (isMockMode()) {
    callback(null);
    return () => {};
  }

  // Real Firebase implementation
  if (!auth || !firestore) {
    callback(null);
    return () => {};
  }

  let unsubscribe: (() => void) | null = null;

  const setupListener = async () => {
    try {
      const { onAuthStateChanged } = await import('firebase/auth');
      
      // We've already checked that auth is not null above
      const authInstance = auth!;
      
      unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
        if (firebaseUser && firestore) {
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const user: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || userData.email,
                name: userData.name,
                phoneNumber: userData.phoneNumber,
                role: userData.role,
                restaurantId: userData.restaurantId,
                createdAt: new Date(userData.createdAt),
                updatedAt: new Date(userData.updatedAt),
                lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined
              };
              callback(user);
            } else {
              callback(null);
            }
          } catch (error) {
            console.error('❌ Auth state change error:', error);
            callback(null);
          }
        } else {
          callback(null);
        }
      });
    } catch (error) {
      console.error('❌ Auth state listener setup error:', error);
      callback(null);
    }
  };

  setupListener();

  // Return cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
};

// Update user data
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Mock user update:', { userId, updates });
    return { ...mockUser, ...updates, id: userId, updatedAt: new Date() };
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    
    const userRef = doc(firestore, 'users', userId);
    
    // Prepare update data
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Sanitize undefined values
    const sanitizedUpdate = sanitizeForFirestore(updateData);
    
    await updateDoc(userRef, sanitizedUpdate);
    
    // Get updated user data
    const updatedDoc = await getDoc(userRef);
    if (!updatedDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = updatedDoc.data();
    const updatedUser: User = {
      id: userId,
      email: userData.email,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      role: userData.role,
      restaurantId: userData.restaurantId,
      createdAt: new Date(userData.createdAt),
      updatedAt: new Date(userData.updatedAt),
      lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : undefined
    };

    console.log('✅ User updated successfully:', updatedUser.email);
    return updatedUser;
  } catch (error: unknown) {
    console.error('❌ Update user error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update user');
  }
};

// Debug auth information
export const debugAuth = () => ({
  isMockMode: isMockMode(),
  hasAuth: !!auth,
  hasFirestore: !!firestore,
  availableCredentials: Object.keys(mockCredentials)
});
