// Table management types - simplified for basic table tracking
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface Table {
  id?: string;
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  location?: string; // Section/area of restaurant
  currentReservationId?: string;
  estimatedTurnTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Table status display configuration
export const TABLE_STATUSES: Record<TableStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  available: {
    label: 'Available',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    icon: '✓'
  },
  occupied: {
    label: 'Occupied',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    icon: '●'
  },
  reserved: {
    label: 'Reserved',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    icon: '◐'
  },
  cleaning: {
    label: 'Cleaning',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    icon: '🧽'
  }
};