/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Restaurant } from '../types/restaurant';
import type { Table } from '../types/table';
import type { User } from '../types/user';
import { getCurrentUser } from '../services/auth';
import { getOwnerRestaurants } from '../services/restaurant';
import { getDataMode } from '../firebaseClient';

// Using imported types instead of local interfaces

interface RestaurantContextType {
  restaurant: Restaurant | null;
  setRestaurant: (restaurant: Restaurant | null) => void;
  tables: Table[];
  setTables: (tables: Table[]) => void;
  staff: User[];
  setStaff: (staff: User[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadRestaurantData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

interface RestaurantProviderProps {
  children: ReactNode;
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [tables, setTables] = useState<Table[]>([
    { 
      id: '1', 
      restaurantId: '1',
      tableNumber: 'T1', 
      capacity: 2, 
      status: 'available', 
      location: 'Main Dining',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    { 
      id: '2', 
      restaurantId: '1',
      tableNumber: 'T2', 
      capacity: 4, 
      status: 'occupied', 
      location: 'Main Dining',
      currentReservationId: 'res-123',
      estimatedTurnTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    { 
      id: '3', 
      restaurantId: '1',
      tableNumber: 'T3', 
      capacity: 6, 
      status: 'reserved', 
      location: 'Main Dining',
      currentReservationId: 'res-456',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    { 
      id: '4', 
      restaurantId: '1',
      tableNumber: 'T4', 
      capacity: 2, 
      status: 'cleaning', 
      location: 'Patio',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    { 
      id: '5', 
      restaurantId: '1',
      tableNumber: 'T5', 
      capacity: 4, 
      status: 'available', 
      location: 'Patio',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15')
    },
  ]);

  const [staff, setStaff] = useState<User[]>([
    {
      id: '1',
      name: 'Marco Pellegrini',
      email: 'marco@bellavista.com',
      role: 'owner',
      phoneNumber: '(555) 100-0001',
      restaurantId: '1',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@bellavista.com',
      role: 'manager',
      phoneNumber: '(555) 100-0002',
      restaurantId: '1',
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date('2024-01-15'),
      lastLoginAt: new Date('2024-01-14')
    },
    {
      id: '3',
      name: 'David Chen',
      email: 'david@bellavista.com',
      role: 'host',
      phoneNumber: '(555) 100-0003',
      restaurantId: '1',
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2024-01-10'),
      lastLoginAt: new Date('2024-01-13')
    },
    {
      id: '4',
      name: 'Alice Thompson',
      email: 'alice@bellavista.com',
      role: 'server',
      phoneNumber: '(555) 100-0004',
      restaurantId: '1',
      createdAt: new Date('2023-04-05'),
      updatedAt: new Date('2024-01-12'),
      lastLoginAt: new Date('2024-01-12')
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Load restaurant data based on authenticated user and data mode
  const loadRestaurantData = async () => {
    try {
      setIsLoading(true);
      const currentDataMode = getDataMode();
      
      console.log(`🔄 Loading restaurant data in ${currentDataMode.toUpperCase()} mode`);
      
      if (currentDataMode === 'mock') {
        // Load mock data
        const mockRestaurant = {
          id: 'mock-restaurant-1',
          name: 'Bella Vista',
          address: '123 Main Street, Downtown',
          phone: '(555) 123-4567',
          email: 'info@bellavista.com',
          cuisine: 'Italian',
          description: 'Authentic Italian dining experience with a modern twist',
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
          imageUrls: [
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=800&h=600&fit=crop'
          ],
          rating: 4.5,
          reviewCount: 127,
          priceRange: '$$$',
          website: 'https://www.bellavista.com',
          distance: '0.5 miles',
          waitTime: '15-25 min',
          isOpen: true,
          isFavorite: false,
          hasDeals: true,
          isTrending: true,
          isNew: false,
          amenities: ['Outdoor Seating', 'Full Bar', 'Parking Available', 'WiFi Available'],
          hours: {
            'Monday': '5:00 PM - 11:00 PM',
            'Tuesday': '5:00 PM - 11:00 PM',
            'Wednesday': '5:00 PM - 11:00 PM',
            'Thursday': '5:00 PM - 11:00 PM',
            'Friday': '5:00 PM - 12:00 AM',
            'Saturday': '5:00 PM - 12:00 AM',
            'Sunday': '5:00 PM - 10:00 PM'
          },
          latitude: 40.7589,
          longitude: -73.9851,
          specialOffers: ['Happy Hour 5-7 PM', '20% off wine bottles on Wednesdays'],
          menuHighlights: {
            'Signature Dishes': ['Truffle Risotto', 'Osso Buco', 'Tiramisu'],
            'Popular Items': ['Margherita Pizza', 'Caesar Salad', 'Panna Cotta']
          },
          ownerId: 'owner-123',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2024-01-15')
        };
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRestaurant(mockRestaurant);
        console.log('✅ Mock restaurant data loaded successfully');
        return;
      }
      
      // Firebase mode - load real data
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        // If user has a restaurantId, get that specific restaurant
        if (currentUser.restaurantId) {
          const { getRestaurant } = await import('../services/restaurant');
          const userRestaurant = await getRestaurant(currentUser.restaurantId);
          if (userRestaurant) {
            setRestaurant(userRestaurant);
            console.log('✅ Firebase restaurant data loaded successfully');
            return;
          }
        }
        
        // If user is an owner, get their restaurants
        if (currentUser.role === 'owner') {
          const restaurants = await getOwnerRestaurants(currentUser.id);
          if (restaurants.length > 0) {
            setRestaurant(restaurants[0]); // Set first restaurant as default
            console.log('✅ Firebase owner restaurant data loaded successfully');
            return;
          }
        }
      }
      
      // No restaurant found
      setRestaurant(null);
      console.log('ℹ️ No restaurant data found');
      
    } catch (error) {
      console.error('❌ Failed to load restaurant data:', error);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load restaurant data on mount and when data mode changes
  useEffect(() => {
    loadRestaurantData();
  }, []);

  // Listen for data mode changes and reload data
  useEffect(() => {
    const handleDataModeChange = () => {
      loadRestaurantData();
    };

    // Listen for storage changes to detect data mode changes
    window.addEventListener('storage', handleDataModeChange);
    
    // Custom event for data mode changes
    window.addEventListener('datamode-changed', handleDataModeChange);

    return () => {
      window.removeEventListener('storage', handleDataModeChange);
      window.removeEventListener('datamode-changed', handleDataModeChange);
    };
  }, []);

  const value: RestaurantContextType = {
    restaurant,
    setRestaurant,
    tables,
    setTables,
    staff,
    setStaff,
    isLoading,
    setIsLoading,
    loadRestaurantData,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};