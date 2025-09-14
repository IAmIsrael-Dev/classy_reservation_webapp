/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Restaurant, RestaurantFormData } from '../types/restaurant';
import { firestore, isMockMode } from '../firebaseClient';

// Mock restaurants for development
const mockRestaurants: Restaurant[] = [
  {
    id: 'mock-restaurant-1',
    name: 'Bella Vista',
    description: 'Authentic Italian cuisine with a modern twist',
    cuisine: 'Italian',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    imageUrls: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
    rating: 4.5,
    reviewCount: 127,
    priceRange: '$$$',
    address: '123 Main St, Seattle, WA 98101',
    phone: '+1 (206) 555-0123',
    email: 'info@bellavista.com',
    website: 'https://bellavista.com',
    distance: '0.5 miles',
    waitTime: '15-25 minutes',
    isOpen: true,
    isFavorite: false,
    hasDeals: true,
    isTrending: true,
    isNew: false,
    amenities: ['Outdoor Seating', 'Full Bar', 'Valet Parking'],
    hours: {
      'Monday': '5:00 PM - 10:00 PM',
      'Tuesday': '5:00 PM - 10:00 PM',
      'Wednesday': '5:00 PM - 10:00 PM',
      'Thursday': '5:00 PM - 10:00 PM',
      'Friday': '5:00 PM - 11:00 PM',
      'Saturday': '5:00 PM - 11:00 PM',
      'Sunday': '5:00 PM - 9:00 PM'
    },
    latitude: 47.6062,
    longitude: -122.3321,
    specialOffers: ['Happy Hour 4-6 PM', '20% off wine bottles'],
    menuHighlights: {
      'signature_dishes': ['Osso Buco', 'Truffle Risotto'],
      'popular_items': ['Margherita Pizza', 'Tiramisu']
    },
    ownerId: 'mock-user-id',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// No longer needed with mock-only implementation

// Create new restaurant
export const createRestaurant = async (
  restaurantData: RestaurantFormData,
  imageUrls: string[],
  ownerId: string
): Promise<Restaurant> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockRestaurant: Restaurant = {
      id: `mock-${Date.now()}`,
      ...restaurantData,
      imageUrl: imageUrls[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      imageUrls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
      rating: 0,
      reviewCount: 0,
      distance: '',
      isFavorite: false,
      hasDeals: restaurantData.specialOffers.length > 0,
      isTrending: false,
      isNew: true,
      ownerId: ownerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    console.log('Mock restaurant created:', mockRestaurant.name);
    return mockRestaurant;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const restaurant: Omit<Restaurant, 'id'> = {
      ...restaurantData,
      imageUrl: imageUrls[0] || '',
      imageUrls,
      rating: 0,
      reviewCount: 0,
      distance: '',
      isFavorite: false,
      hasDeals: restaurantData.specialOffers.length > 0,
      isTrending: false,
      isNew: true,
      ownerId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(firestore, 'restaurants'), {
      ...restaurant,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const newRestaurant: Restaurant = {
      ...restaurant,
      id: docRef.id
    };

    console.log('✅ Restaurant created successfully:', newRestaurant.name);
    return newRestaurant;
  } catch (error: unknown) {
    console.error('❌ Create restaurant error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create restaurant');
  }
};

// Update existing restaurant
export const updateRestaurant = async (
  restaurantId: string,
  updates: Partial<Restaurant>
): Promise<Restaurant> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockRestaurant: Restaurant = {
      ...mockRestaurants[0],
      ...updates,
      id: restaurantId,
      updatedAt: new Date()
    };
    console.log('Mock restaurant updated:', mockRestaurant.name);
    return mockRestaurant;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, updateDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
    
    const restaurantRef = doc(firestore, 'restaurants', restaurantId);
    
    // Update the document
    await updateDoc(restaurantRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    // Get the updated document
    const updatedDoc = await getDoc(restaurantRef);
    if (!updatedDoc.exists()) {
      throw new Error('Restaurant not found');
    }

    const updatedData = updatedDoc.data();
    const updatedRestaurant: Restaurant = {
      id: restaurantId,
      ...updatedData,
      createdAt: updatedData.createdAt?.toDate() || new Date(),
      updatedAt: updatedData.updatedAt?.toDate() || new Date()
    } as Restaurant;

    console.log('✅ Restaurant updated successfully:', updatedRestaurant.name);
    return updatedRestaurant;
  } catch (error: unknown) {
    console.error('❌ Update restaurant error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update restaurant');
  }
};

// Get restaurant by ID
export const getRestaurant = async (restaurantId: string): Promise<Restaurant | null> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    const restaurant = mockRestaurants.find(r => r.id === restaurantId) || null;
    console.log('✅ Retrieved restaurant (MOCK MODE):', restaurant?.name || 'Not found');
    return restaurant;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    
    const restaurantDoc = await getDoc(doc(firestore, 'restaurants', restaurantId));
    
    if (!restaurantDoc.exists()) {
      console.log('❌ Restaurant not found:', restaurantId);
      return null;
    }

    const data = restaurantDoc.data();
    const restaurant: Restaurant = {
      id: restaurantDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as Restaurant;

    console.log('✅ Retrieved restaurant (FIREBASE MODE):', restaurant.name);
    return restaurant;
  } catch (error: unknown) {
    console.error('❌ Get restaurant error:', error);
    
    // Check if this is likely due to document not found or missing data
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('not found') || 
        errorMessage.includes('missing') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('no documents')) {
      console.log('ℹ️ Restaurant not found, returning null');
      return null;
    }
    
    // For other errors (permission, connection, etc.), still throw
    throw new Error(error instanceof Error ? error.message : 'Failed to get restaurant');
  }
};

// Get restaurants owned by user
export const getOwnerRestaurants = async (ownerId: string): Promise<Restaurant[]> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    const restaurants = mockRestaurants.filter(r => r.ownerId === ownerId);
    console.log('✅ Retrieved owner restaurants (MOCK MODE):', restaurants.length);
    return restaurants;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const restaurantsQuery = query(
      collection(firestore, 'restaurants'),
      where('ownerId', '==', ownerId)
    );

    const querySnapshot = await getDocs(restaurantsQuery);
    const restaurants: Restaurant[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      restaurants.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Restaurant);
    });

    console.log('✅ Retrieved owner restaurants (FIREBASE MODE):', restaurants.length);
    return restaurants;
  } catch (error: unknown) {
    console.error('❌ Get owner restaurants error:', error);
    
    // Check if this is likely due to empty collection or missing data
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('not found') || 
        errorMessage.includes('missing') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('no documents') ||
        errorMessage.includes('collection') ||
        errorMessage.includes('index') && errorMessage.includes('build')) {
      console.log('ℹ️ No restaurants found for owner or collection is empty, returning empty array');
      return [];
    }
    
    // For other errors (permission, connection, etc.), still throw
    throw new Error(error instanceof Error ? error.message : 'Failed to get restaurants');
  }
};

// Update restaurant status (mock implementation)
export const updateRestaurantStatus = async (
  _restaurantId: string, 
  isOpen: boolean
): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log('Mock restaurant status update:', isOpen ? 'Open' : 'Closed');
};

// Delete restaurant (mock implementation)
export const deleteRestaurant = async (_restaurantId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Mock restaurant deleted');
};