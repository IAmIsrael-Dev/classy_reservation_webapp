import type { RegistrationData } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateOwnerDetails = (data: RegistrationData): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.firstName.trim()) errors.push('First name is required');
  if (!data.lastName.trim()) errors.push('Last name is required');
  if (!data.email.trim()) errors.push('Email is required');
  if (data.email && !data.email.includes('@')) errors.push('Valid email is required');
  if (!data.phone.trim()) errors.push('Phone number is required');
  if (data.password && data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (data.password !== data.confirmPassword) errors.push('Passwords do not match');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRestaurantDetails = (data: RegistrationData): ValidationResult => {
  const errors: string[] = [];
  
  if (!data.restaurantName.trim()) errors.push('Restaurant name is required');
  if (!data.restaurantType) errors.push('Restaurant type is required');
  if (!data.address.trim()) errors.push('Address is required');
  if (!data.city.trim()) errors.push('City is required');
  if (!data.state.trim()) errors.push('State is required');
  if (!data.zipCode.trim()) errors.push('ZIP code is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBusinessDetails = (data: RegistrationData): ValidationResult => {
  const errors: string[] = [];
  
  // Business details are mostly optional, but we can add validation if needed
  if (data.estimatedCapacity && data.estimatedCapacity < 1) {
    errors.push('Estimated capacity must be at least 1');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRegistrationStep = (step: number, data: RegistrationData): string[] => {
  switch (step) {
    case 1:
      return validateOwnerDetails(data).errors;
    case 2:
      return validateRestaurantDetails(data).errors;
    case 3:
      return validateBusinessDetails(data).errors;
    default:
      return [];
  }
};