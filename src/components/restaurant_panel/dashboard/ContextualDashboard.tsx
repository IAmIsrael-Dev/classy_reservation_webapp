/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Store,
  Plus,
  Settings,
  Edit,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { useRole } from '../context/RoleContext';
import type { Reservation } from '../types/reservation';
import type { Table } from '../types/table';
import type { Restaurant } from '../types/restaurant';
import { getTodaysReservations } from '../services/reservation';
import { getRestaurantTables } from '../services/table';
import { RestaurantForm } from '../components/RestaurantForm';
import { RestaurantSettings } from '../features/RestaurantSettings';

export const ContextualDashboard: React.FC = () => {
  const { restaurant, isLoading: contextLoading } = useRestaurant();
  const { currentRole, permissions } = useRole();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load restaurant-specific data
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!restaurant?.id) return;

      try {
        setIsLoading(true);
        const [restaurantReservations, restaurantTables] = await Promise.all([
          getTodaysReservations(restaurant.id),
          getRestaurantTables(restaurant.id)
        ]);
        
        setReservations(restaurantReservations);
        setTables(restaurantTables);
      } catch (error) {
        console.error('Failed to load restaurant data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextLoading) {
      loadRestaurantData();
    }
  }, [restaurant, contextLoading]);

  // Calculate basic analytics
  const analytics = React.useMemo(() => {
    const todaysReservations = reservations.length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const totalTables = tables.length;
    const utilizationRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
    
    return {
      todaysReservations,
      occupiedTables,
      totalTables,
      utilizationRate,
      avgWaitTime: '15-25 minutes' // Mock data for now
    };
  }, [reservations, tables]);

  if (contextLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Restaurant Selected</h3>
          <p className="text-muted-foreground mb-4">
            Please select or create a restaurant to view the dashboard.
          </p>
          {permissions.canManageSettings && (
            <Button onClick={() => setShowRestaurantForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Map restaurant.hours (object with open/close/isClosed) to Record<string, string>
  // so it matches the shape expected by RestaurantSettings.
  const restaurantForSettings = {
    ...restaurant,
    hours: Object.fromEntries(
      Object.entries(restaurant.hours || {}).map(([day, h]) => {
        // if hours are already strings, keep them; otherwise format from {open, close, isClosed}
        if (typeof h === 'string') return [day, h];
        const open = (h as any).open ?? '';
        const close = (h as any).close ?? '';
        const isClosed = (h as any).isClosed ?? false;
        const formatted = isClosed ? 'Closed' : `${open} - ${close}`;
        return [day, formatted];
      })
    ) as Record<string, string>
  } as unknown as Restaurant; // keep overall type compatible for spread usage

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Reservations</p>
                <p className="text-2xl font-semibold">{analytics.todaysReservations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Tables Occupied</p>
                <p className="text-2xl font-semibold">{analytics.occupiedTables}/{analytics.totalTables}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-semibold">{analytics.utilizationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                <p className="text-2xl font-semibold">{analytics.avgWaitTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {permissions.canManageSettings && (
              <Button 
                className="h-16 flex-col"
                onClick={() => setShowRestaurantForm(true)}
              >
                <Plus className="w-5 h-5 mb-2" />
                Add Restaurant
              </Button>
            )}
            
            {permissions.canManageReservations && (
              <>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col"
                >
                  <Calendar className="w-5 h-5 mb-2" />
                  View Reservations
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 flex-col"
                >
                  <Users className="w-5 h-5 mb-2" />
                  Manage Tables
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              className="h-16 flex-col"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-5 h-5 mb-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Restaurant Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Restaurant
            {permissions.canManageSettings && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSettings(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-muted-foreground">{restaurant.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{restaurant.cuisine}</Badge>
                <Badge variant="default">Open</Badge>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Address:</strong> {restaurant.address}</div>
              <div><strong>Phone:</strong> {restaurant.phone}</div>
              <div><strong>Email:</strong> {restaurant.email}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurant Form Modal */}
      {showRestaurantForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <RestaurantForm 
              onClose={() => setShowRestaurantForm(false)}
              onSuccess={() => {
                setShowRestaurantForm(false);
                // Refresh data if needed
              }}
              userId="current-user" // This should come from auth context
            />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <RestaurantSettings
          restaurant={restaurantForSettings as unknown as any}
          currentUser={{
            id: 'current-user',
            name: 'Current User',
            email: 'user@restaurant.com',
            role: currentRole,
            createdAt: new Date(),
            updatedAt: new Date()
          }}
          onRestaurantUpdate={(updatedRestaurant) => {
            // Update restaurant in context
            console.log('Restaurant updated:', updatedRestaurant);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};
