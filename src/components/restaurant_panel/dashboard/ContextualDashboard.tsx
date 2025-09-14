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
  Settings,
  Edit,
  Database,
  Cloud,
  AlertCircle,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { useRole } from '../context/RoleContext';
import type { Reservation } from '../types/reservation';
import type { Table } from '../types/table';
import type { Restaurant } from '../types/restaurant';
import { getTodaysReservations } from '../services/reservation';
import { getRestaurantTables } from '../services/table';
import { RestaurantSettings } from '../features/RestaurantSettings';
import { getDataMode, isFirebaseConfigured } from '../firebaseClient';

export const ContextualDashboard: React.FC = () => {
  const { restaurant, isLoading: contextLoading } = useRestaurant();
  const { currentRole, permissions } = useRole();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [currentDataMode, setCurrentDataMode] = useState(() => getDataMode());

  // Load restaurant-specific data
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!restaurant?.id) {
        setIsLoading(false);
        return;
      }

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
        // Set empty arrays on error to show empty states
        setReservations([]);
        setTables([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextLoading) {
      loadRestaurantData();
    }
  }, [restaurant, contextLoading, currentDataMode]);

  // Listen for data mode changes
  useEffect(() => {
    const handleDataModeChange = () => {
      const newMode = getDataMode();
      setCurrentDataMode(newMode);
    };

    window.addEventListener('datamode-changed', handleDataModeChange);
    window.addEventListener('storage', handleDataModeChange);

    return () => {
      window.removeEventListener('datamode-changed', handleDataModeChange);
      window.removeEventListener('storage', handleDataModeChange);
    };
  }, []);

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
    const isFirebaseMode = currentDataMode === 'firebase';
    const isFirebaseAvailable = isFirebaseConfigured();

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              {isFirebaseMode ? (
                <Cloud className="w-12 h-12 text-blue-500" />
              ) : (
                <Database className="w-12 h-12 text-green-500" />
              )}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">
                {isFirebaseMode ? 'No Restaurant Data in Firebase' : 'No Restaurant Found'}
              </h3>
              
              {isFirebaseMode ? (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    No restaurant data found in Firebase Firestore for your account.
                  </p>
                  {isFirebaseAvailable ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        • Create a restaurant through the owner registration process
                      </p>
                      <p className="text-sm text-muted-foreground">
                        • Or switch to Mock Data mode to see demo content
                      </p>
                    </div>
                  ) : (
                    <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 rounded-lg p-4 mt-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-700 dark:text-orange-300">
                          <p className="font-medium">Firebase not configured</p>
                          <p>Add Firebase environment variables to enable real data storage.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Demo restaurant data should be available in Mock Data mode.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    If you're seeing this message, there may be an issue with the mock data loading.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                {isFirebaseMode ? (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Firebase Mode Active</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Mock Data Mode Active</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use the "Data Mode" button in the header to switch between modes
              </p>
            </div>
          </div>
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
      {/* Data Mode Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
          {currentDataMode === 'firebase' ? (
            <>
              <Cloud className="w-3 h-3" />
              <span>Firebase Mode - Real Data</span>
            </>
          ) : (
            <>
              <Database className="w-3 h-3" />
              <span>Mock Data Mode - Demo Content</span>
            </>
          )}
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Restaurant Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Restaurant Profile
            {permissions.canManageSettings && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowSettings(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Restaurant Image */}
            {restaurant.imageUrl && (
              <div className="lg:col-span-1">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={restaurant.imageUrl} 
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Basic Information */}
            <div className={`space-y-4 ${restaurant.imageUrl ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="space-y-3">
                <h3 className="font-semibold text-xl">{restaurant.name}</h3>
                <p className="text-muted-foreground">{restaurant.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{restaurant.cuisine}</Badge>
                  <Badge variant="outline">{restaurant.priceRange}</Badge>
                  <Badge variant={restaurant.isOpen ? "default" : "destructive"}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                  {restaurant.hasDeals && <Badge variant="outline">Special Offers</Badge>}
                  {restaurant.isTrending && <Badge variant="outline">Trending</Badge>}
                  {restaurant.isNew && <Badge variant="outline">New</Badge>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2 text-sm">
                  <div><strong>Address:</strong> {restaurant.address}</div>
                  <div><strong>Phone:</strong> {restaurant.phone}</div>
                  <div><strong>Email:</strong> {restaurant.email}</div>
                  {restaurant.website && (
                    <div><strong>Website:</strong> 
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                        {restaurant.website.replace('https://', '').replace('http://', '')}
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Additional Details */}
                <div className="space-y-2 text-sm">
                  {restaurant.rating > 0 && (
                    <div><strong>Rating:</strong> {restaurant.rating}/5 ({restaurant.reviewCount} reviews)</div>
                  )}
                  <div><strong>Wait Time:</strong> {restaurant.waitTime}</div>
                  {restaurant.amenities && restaurant.amenities.length > 0 && (
                    <div>
                      <strong>Amenities:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {restaurant.amenities.slice(0, 3).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {restaurant.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{restaurant.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Offers */}
              {restaurant.specialOffers && restaurant.specialOffers.length > 0 && (
                <div className="pt-2">
                  <strong className="text-sm">Special Offers:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {restaurant.specialOffers.map((offer, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                        {offer}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Highlights */}
              {restaurant.menuHighlights && Object.keys(restaurant.menuHighlights).length > 0 && (
                <div className="pt-2">
                  <strong className="text-sm">Menu Highlights:</strong>
                  <div className="mt-2 space-y-2">
                    {Object.entries(restaurant.menuHighlights).map(([category, items]) => (
                      <div key={category} className="text-sm">
                        <span className="font-medium capitalize">{category.replace('_', ' ')}:</span>
                        <span className="text-muted-foreground ml-2">{Array.isArray(items) ? items.join(', ') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="pt-2 text-xs text-muted-foreground border-t">
                Created: {restaurant.createdAt.toLocaleDateString()} • 
                Last Updated: {restaurant.updatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
