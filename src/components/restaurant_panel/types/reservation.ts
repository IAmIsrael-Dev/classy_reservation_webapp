// Reservation types based on Flutter schema - exact match from reservation_model_dart.tsx
export type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'noShow';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Reservation {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  dateTime: Date;
  partySize: number;
  status: ReservationStatus;
  tableNumber?: string;
  specialRequests?: string;
  confirmationNumber: string;
  totalAmount?: number;
  depositAmount?: number;
  customerInfo: CustomerInfo;
  createdAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
  cancelledAt?: Date;
}

// Status display configuration
export const RESERVATION_STATUSES: Record<ReservationStatus, { 
  label: string; 
  description: string; 
  color: string;
  bgColor: string;
}> = {
  pending: {
    label: 'Pending',
    description: 'Awaiting confirmation from restaurant',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
  },
  confirmed: {
    label: 'Confirmed', 
    description: 'Reservation confirmed by restaurant',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
  },
  seated: {
    label: 'Seated',
    description: 'Currently dining',
    color: 'text-green-600 dark:text-green-400', 
    bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
  },
  completed: {
    label: 'Completed',
    description: 'Dining experience completed',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Reservation was cancelled',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  },
  noShow: {
    label: 'No Show',
    description: 'Customer did not show up',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
  }
};