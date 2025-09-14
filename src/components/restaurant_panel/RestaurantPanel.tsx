import React, { useState, useEffect } from 'react';
import { RestaurantAuthScreen } from './auth/RestaurantAuthScreen';
import { RestaurantDashboard } from './dashboard/RestaurantDashboard';
import { RestaurantProvider } from './context/RestaurantContext';
import { RoleProvider } from './context/RoleContext';
import type { User, UserRole, CreateUserData } from './types/user';
import { signInUser, signUpUser, signOutUser, getCurrentUser, updateUser } from './services/auth';
import { createRestaurant } from './services/restaurant';
import { uploadImage } from './services/storage';
import type { RegistrationData } from './auth/types';
import type { RestaurantFormData } from './types/restaurant';


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

  // Handle owner registration with restaurant creation
  const handleOwnerRegistration = async (data: RegistrationData) => {
    setIsLoading(true);
    setError('');

    try {
      // Create owner account first
      const ownerData: CreateUserData = {
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phone,
        role: 'owner'
      };

      const newOwner = await signUpUser(data.email, data.password, ownerData);

      // Upload restaurant image if provided
      let imageUrls: string[] = [];
      if (data.restaurantImage) {
        try {
          const imageUrl = await uploadImage(data.restaurantImage, `restaurants/${newOwner.id}`);
          imageUrls = [imageUrl];
        } catch (uploadError) {
          console.warn('⚠️ Image upload failed, proceeding without image:', uploadError);
        }
      }

      // Create restaurant data
      const restaurantData: RestaurantFormData = {
        name: data.restaurantName,
        description: data.description,
        cuisine: data.restaurantType,
        address: `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`,
        phone: data.phone,
        email: data.email,
        website: '',
        priceRange: '$$$',
        waitTime: '15-25 minutes',
        isOpen: true,
        amenities: [],
        hours: {
          'Monday': '9:00 AM - 10:00 PM',
          'Tuesday': '9:00 AM - 10:00 PM',
          'Wednesday': '9:00 AM - 10:00 PM',
          'Thursday': '9:00 AM - 10:00 PM',
          'Friday': '9:00 AM - 11:00 PM',
          'Saturday': '9:00 AM - 11:00 PM',
          'Sunday': '9:00 AM - 9:00 PM'
        },
        latitude: 0,
        longitude: 0,
        specialOffers: [],
        imageUrls: imageUrls, // Include the uploaded image URLs
        menuHighlights: {
          signature_dishes: [],
          popular_items: []
        }
      };

      // Create the restaurant (imageUrls are passed separately to the service)
      const restaurant = await createRestaurant(restaurantData, imageUrls, newOwner.id);
      
      // Update user with restaurant ID in Firebase
      const updatedOwner = await updateUser(newOwner.id, { restaurantId: restaurant.id });

      setUser(updatedOwner);
      console.log('✅ Owner registration and restaurant creation successful');
    } catch (error: unknown) {
      console.error('❌ Owner registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account and restaurant');
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
      <RestaurantProvider key={user.id + (user.restaurantId || '')}>
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
      onOwnerRegistration={handleOwnerRegistration}
      onBackToDashboard={onBackToDashboard}
    />
  );
};

export default RestaurantPanel;