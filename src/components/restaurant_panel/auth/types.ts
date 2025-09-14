export interface RegistrationData {
  // Owner details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Restaurant details
  restaurantName: string;
  restaurantType: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  restaurantImage?: File;
  
  // Business details
  businessLicense?: string;
  taxId?: string;
  estimatedCapacity: number;
}

export interface RestaurantAuthScreenProps {
  email: string;
  password: string;
  error: string;
  isLoading: boolean;
  currentRole: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRoleChange: (role: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToDashboard: () => void;
}