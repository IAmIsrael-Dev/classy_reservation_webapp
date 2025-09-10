import type { RegistrationData } from './types';

export const validateRegistrationStep = (step: number, data: RegistrationData): string[] => {
  const errors: string[] = [];
  
  switch (step) {
    case 1: // Owner details
      if (!data.firstName.trim()) errors.push('First name is required');
      if (!data.lastName.trim()) errors.push('Last name is required');
      if (!data.email.trim()) errors.push('Email is required');
      if (!data.email.includes('@')) errors.push('Valid email is required');
      if (!data.phone.trim()) errors.push('Phone number is required');
      if (data.password.length < 6) errors.push('Password must be at least 6 characters');
      if (data.password !== data.confirmPassword) errors.push('Passwords do not match');
      break;
      
    case 2: // Restaurant details
      if (!data.restaurantName.trim()) errors.push('Restaurant name is required');
      if (!data.restaurantType) errors.push('Restaurant type is required');
      if (!data.address.trim()) errors.push('Address is required');
      if (!data.city.trim()) errors.push('City is required');
      if (!data.state.trim()) errors.push('State is required');
      if (!data.zipCode.trim()) errors.push('ZIP code is required');
      break;
  }
  
  return errors;
};