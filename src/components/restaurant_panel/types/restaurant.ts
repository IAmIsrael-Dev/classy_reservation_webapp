/* eslint-disable @typescript-eslint/no-explicit-any */
// Restaurant interface based on Flutter schema - exact match from restaurant_model_dart.tsx
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  imageUrl: string;
  imageUrls: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  distance: string;
  waitTime: string;
  isOpen: boolean;
  isFavorite?: boolean;
  hasDeals?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  amenities: string[];
  hours: Record<string, string>; // day -> hours mapping (e.g., "Monday": "9:00 AM - 10:00 PM")
  latitude: number;
  longitude: number;
  specialOffers: string[];
  menuHighlights: Record<string, any>;
  ownerId?: string; // Firebase Auth user ID of the owner
  createdAt: Date;
  updatedAt: Date;
}

// Form data for creating/editing restaurants
export interface RestaurantFormData {
  name: string;
  description: string;
  cuisine: string;
  priceRange: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  waitTime: string;
  isOpen: boolean;
  amenities: string[];
  hours: Record<string, string>;
  latitude: number;
  longitude: number;
  specialOffers: string[];
  imageUrls: string[];
  menuHighlights: Record<string, any>;
}

// Available cuisine types
export const CUISINE_TYPES = [
  'American', 'Italian', 'Japanese', 'Chinese', 'Mexican', 'Thai', 'Indian',
  'Mediterranean', 'French', 'Spanish', 'Greek', 'Korean', 'Vietnamese',
  'Lebanese', 'Turkish', 'Brazilian', 'Peruvian', 'Ethiopian', 'Moroccan',
  'German', 'British', 'Fusion', 'Seafood', 'Steakhouse', 'BBQ', 'Pizza',
  'Breakfast', 'Brunch', 'Fast Food', 'Casual Dining', 'Fine Dining'
] as const;

// Price range options
export const PRICE_RANGES = [
  { value: '$', label: '$ - Under $15' },
  { value: '$$', label: '$$ - $15-30' },
  { value: '$$$', label: '$$$ - $30-50' },
  { value: '$$$$', label: '$$$$ - Over $50' }
] as const;

// Available amenities
export const AMENITIES = [
  'Parking Available', 'Wheelchair Accessible', 'Outdoor Seating',
  'Private Dining', 'Full Bar', 'Wine List', 'Happy Hour', 'Live Music',
  'Valet Parking', 'Reservations Required', 'Walk-ins Welcome',
  'Family Friendly', 'Pet Friendly', 'WiFi Available', 'Delivery Available',
  'Takeout Available', 'Group Friendly'
] as const;