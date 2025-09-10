import React, { useState, useEffect } from 'react';
import { RestaurantAuthScreen } from './auth/RestaurantAuthScreen';
import { RestaurantDashboard } from './dashboard/RestaurantDashboard';
import { RestaurantProvider } from './context/RestaurantContext';
import { RoleProvider } from './context/RoleContext';
import type { User, UserRole, CreateUserData } from './types/user';
import { signInUser, signUpUser, signOutUser, getCurrentUser } from './services/auth';
import environment from './config/environment';
console.log(environment.isFirebaseEnabled); // true


interface RestaurantPanelProps {
  onBackToDashboard: () => void;
}

type AuthMode = 'login' | 'signup';

const RestaurantPanel: React.FC<RestaurantPanelProps> = ({ onBackToDashboard }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState('');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          console.log('✅ User already authenticated:', currentUser.email);
        }
      } catch (error) {
        console.error('❌ Failed to get current user:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const authenticatedUser = await signInUser(email, password);
      
      // Check if user has appropriate role for restaurant access
      const restaurantRoles: UserRole[] = ['owner', 'manager', 'host', 'server'];
      if (!restaurantRoles.includes(authenticatedUser.role)) {
        throw new Error('This account does not have restaurant access permissions');
      }

      setUser(authenticatedUser);
      console.log('✅ User logged in successfully');
    } catch (error: unknown) {
      console.error('❌ Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (userData: CreateUserData, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      const newUser = await signUpUser(userData.email, password, userData);
      setUser(newUser);
      console.log('✅ User signed up successfully');
    } catch (error: unknown) {
      console.error('❌ Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setEmail('');
      setPassword('');
      setSelectedRole('owner');
      setError('');
      console.log('✅ User logged out successfully');
    } catch (error: unknown) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    }
  };

  // Show loading spinner during initialization
  if (isInitializing) {
    return (
      <div className="dark">
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard if user is authenticated
  if (user) {
    return (
      <RestaurantProvider>
        <RoleProvider initialRole={user.role}>
          <RestaurantDashboard
            onLogout={handleLogout}
            onBackToDashboard={onBackToDashboard}
          />
        </RoleProvider>
      </RestaurantProvider>
    );
  }

  // Show authentication screen
  return (
    <RestaurantAuthScreen
      email={email}
      password={password}
      role={selectedRole}
      authMode={authMode}
      isLoading={isLoading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onRoleChange={setSelectedRole}
      onAuthModeChange={setAuthMode}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onBackToDashboard={onBackToDashboard}
    />
  );
};

export default RestaurantPanel;