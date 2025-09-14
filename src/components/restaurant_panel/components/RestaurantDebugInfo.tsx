import { useRestaurant } from '../context/RestaurantContext';
import { isFirebaseAvailable, isFirebaseConfigured } from '../firebaseClient';
import { environment } from '../config/environment';

export function RestaurantDebugInfo() {
  const { restaurant, tables, staff, isLoading } = useRestaurant();

  if (!environment.isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-3 text-xs max-w-xs z-50">
      <div className="font-medium mb-2">🔧 Debug Info</div>
      <div className="space-y-1 text-xs">
        <div>Firebase Enabled: {environment.isFirebaseEnabled ? '✅' : '❌'}</div>
        <div>Firebase Configured: {isFirebaseConfigured() ? '✅' : '❌'}</div>
        <div>Firebase Available: {isFirebaseAvailable() ? '✅' : '❌'}</div>
        <div>Loading: {isLoading ? '🔄' : '✅'}</div>
        <div>Restaurant: {restaurant ? restaurant.name : 'None'}</div>
        <div>Tables: {tables.length}</div>
        <div>Staff: {staff.length}</div>
      </div>
    </div>
  );
}