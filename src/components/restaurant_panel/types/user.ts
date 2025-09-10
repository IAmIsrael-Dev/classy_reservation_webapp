// User types based on Flutter schema
export type UserRole = 'owner' | 'manager' | 'host' | 'server' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role: UserRole;
  restaurantId?: string; // For staff members - which restaurant they work at
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// Create user data for new signups
export interface CreateUserData {
  email: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
  restaurantId?: string;
}