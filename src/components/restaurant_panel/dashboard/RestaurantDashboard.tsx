import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Separator } from '../../ui/separator';
import { Badge } from '../../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { Toaster } from '../../ui/sooner';
import { useRole } from '../context/RoleContext';
import { useRestaurant } from '../context/RestaurantContext';
import type { Restaurant } from '../types/restaurant';
import { ContextualDashboard } from './ContextualDashboard';
import { DataModeToggle } from '../components/DataModeToggle';
import { ReservationsAndWaitlist } from '../features/ReservationAndWaitlist';
import { FloorPlanManager } from '../features/FloorPlanManager';
import { HostCheckin } from '../features/HostCheckin';
import { ServerView } from '../features/ServerView';
import { OrdersPOS } from '../features/OrdersPOS';
import { MenuManagement } from '../features/MenuManagement';
import { StaffAndShifts } from '../features/StaffAndShift';
import { RestaurantSettings } from '../features/RestaurantSettings';
import { 
  LayoutDashboard, 
  Calendar, 
  MapPin, 
  UserCheck, 
  Utensils, 
  ShoppingCart, 
  Menu, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Bell,
  Archive,
  ExternalLink,
  Info,
  AlertTriangle
} from 'lucide-react';
import type { UserRole } from '../types/user';

interface RestaurantDashboardProps {
  onLogout: () => void;
  onBackToDashboard: () => void;
}

// ✅ Fix: explicitly type and include "customer"
const roleDisplayNames: Record<UserRole, string> = {
  owner: 'Owner',
  manager: 'Manager', 
  host: 'Host',
  server: 'Server',
  customer: 'Customer'
};

// Placeholder components for features not yet implemented
const AnalyticsReports = () => (
  <div className="space-y-6">
    <div className="text-center py-12">
      <h2 className="text-2xl font-medium mb-4">Analytics & Reports</h2>
      <p className="text-muted-foreground">Business analytics and performance reports</p>
      <div className="mt-6">
        <Alert className="max-w-md mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Comprehensive analytics dashboard coming soon. Track revenue, customer insights, and operational metrics.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
);

const BillingSubscription = () => (
  <div className="space-y-6">
    <div className="text-center py-12">
      <h2 className="text-2xl font-medium mb-4">Billing & Subscription</h2>
      <p className="text-muted-foreground">Subscription management and billing</p>
      <div className="mt-6">
        <Alert className="max-w-md mx-auto">
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            Manage your subscription plan, view billing history, and update payment methods.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
);

const NotificationsAlerts = () => (
  <div className="space-y-6">
    <div className="text-center py-12">
      <h2 className="text-2xl font-medium mb-4">Notifications & Alerts</h2>
      <p className="text-muted-foreground">Real-time notifications and alerts</p>
      <div className="mt-6">
        <Alert className="max-w-md mx-auto">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            Configure real-time alerts for reservations, staff notifications, and system updates.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
);

export function RestaurantDashboard({ onLogout, onBackToDashboard }: RestaurantDashboardProps) {
  const { currentRole, setCurrentRole, permissions } = useRole();
  const { restaurant, setRestaurant, staff, loadRestaurantData } = useRestaurant();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLegacyDialog, setShowLegacyDialog] = useState(false);
  const [selectedLegacyPanel, setSelectedLegacyPanel] = useState<string>('');
  const [showDataModeToggle, setShowDataModeToggle] = useState(false);

  const availableTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'reservations', label: 'Reservations', icon: Calendar, show: permissions.canManageReservations },
    { id: 'floor-plan', label: 'Floor Plan', icon: MapPin, show: permissions.canManageFloorPlan },
    { id: 'host-checkin', label: 'Check-in', icon: UserCheck, show: permissions.canManageReservations },
    { id: 'server-view', label: 'Service', icon: Utensils, show: permissions.canAccessPOS },
    { id: 'orders-pos', label: 'Orders/POS', icon: ShoppingCart, show: permissions.canAccessPOS },
    { id: 'menu', label: 'Menu', icon: Menu, show: permissions.canManageMenu },
    { id: 'staff', label: 'Staff', icon: Users, show: permissions.canManageStaff },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, show: permissions.canViewAnalytics },
    { id: 'settings', label: 'Settings', icon: Settings, show: permissions.canManageSettings },
    { id: 'billing', label: 'Billing', icon: CreditCard, show: permissions.canViewBilling },
    { id: 'notifications', label: 'Alerts', icon: Bell, show: true },
    { id: 'legacy', label: 'Legacy', icon: Archive, show: true },
  ].filter(tab => tab.show);

  const legacyPanels = [
    { 
      id: 'owner', 
      name: 'Legacy Owner Panel', 
      description: 'Original owner interface with comprehensive management tools',
      emoji: '👑',
      features: ['Revenue Analytics', 'Staff Management', 'System Settings', 'Business Reports']
    },
    { 
      id: 'manager', 
      name: 'Legacy Manager Panel', 
      description: 'Operations management and daily oversight tools',
      emoji: '📊',
      features: ['Daily Operations', 'Staff Scheduling', 'Inventory Management', 'Performance Metrics']
    },
    { 
      id: 'host', 
      name: 'Legacy Host Panel', 
      description: 'Guest management and seating coordination',
      emoji: '🏢',
      features: ['Table Management', 'Guest Check-in', 'Waitlist Management', 'Floor Plan']
    },
    { 
      id: 'server', 
      name: 'Legacy Server Panel', 
      description: 'Table service and order management interface',
      emoji: '🍽️',
      features: ['Order Taking', 'Table Service', 'Payment Processing', 'Guest Communications']
    }
  ];

  const handleLegacyNavigation = (panelType: string) => {
    setSelectedLegacyPanel(panelType);
    setShowLegacyDialog(true);
  };

  const handleRestaurantUpdate = (updatedRestaurant: Restaurant) => {
    setRestaurant(updatedRestaurant);
  };

  const handleCloseSettings = () => {
    setActiveTab('dashboard');
  };

  const handleDataModeChange = async (mode: 'mock' | 'firebase') => {
    console.log(`🔄 Data mode changed to: ${mode}`);
    // Reload restaurant data when mode changes
    await loadRestaurantData();
  };

  // Get current user based on role
  const getCurrentUser = () => {
    return staff.find(user => user.role === currentRole) || staff[0];
  };

  const confirmLegacyNavigation = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('panel', selectedLegacyPanel);
    window.location.href = url.toString();
  };

  return (
    <div className="dark">
      <Toaster />
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">CR</span>
                </div>
                <span className="text-xl font-medium">Classy Reservations</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-muted-foreground">Restaurant Panel - {restaurant?.name}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Role Switcher */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Select value={currentRole} onValueChange={setCurrentRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">👑 Owner</SelectItem>
                    <SelectItem value="manager">📊 Manager</SelectItem>
                    <SelectItem value="host">🏢 Host</SelectItem>
                    <SelectItem value="server">🍽️ Server</SelectItem>
                    <SelectItem value="customer">🙋 Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator orientation="vertical" className="h-4" />
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              
              <Button onClick={onLogout} variant="outline" size="sm">
                Logout
              </Button>
              <Button 
                onClick={() => setShowDataModeToggle(!showDataModeToggle)} 
                variant="outline" 
                size="sm"
              >
                Data Mode
              </Button>
              <Button onClick={onBackToDashboard} variant="outline" size="sm">
                ← Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Data Mode Toggle */}
        {showDataModeToggle && (
          <div className="px-6 py-4">
            <DataModeToggle onModeChange={handleDataModeChange} />
          </div>
        )}

        {/* Navigation */}
        <div className="px-6 py-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label>Navigation</Label>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {availableTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-muted hover:bg-accent border-border hover:border-primary/50 text-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Badge */}
        <div className="px-6 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Current Role:</span>
              <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">
                {currentRole === 'owner' && '👑'} 
                {currentRole === 'manager' && '📊'} 
                {currentRole === 'host' && '🏢'} 
                {currentRole === 'server' && '🍽️'} 
                {currentRole === 'customer' && '🙋'} 
                {roleDisplayNames[currentRole]}
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground">
              {availableTabs.length} features available for this role
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          {activeTab === 'dashboard' && <ContextualDashboard />}
          {activeTab === 'reservations' && <ReservationsAndWaitlist restaurantId={restaurant?.id || ''} />}
          {activeTab === 'floor-plan' && <FloorPlanManager />}
          {activeTab === 'host-checkin' && <HostCheckin />}
          {activeTab === 'server-view' && <ServerView />}
          {activeTab === 'orders-pos' && <OrdersPOS />}
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'staff' && <StaffAndShifts />}
          {activeTab === 'analytics' && <AnalyticsReports />}
          {activeTab === 'settings' && restaurant && (
            <RestaurantSettings 
              restaurant={restaurant}
              currentUser={getCurrentUser()}
              onRestaurantUpdate={handleRestaurantUpdate}
              onClose={handleCloseSettings}
            />
          )}
          {activeTab === 'billing' && <BillingSubscription />}
          {activeTab === 'notifications' && <NotificationsAlerts />}
          {activeTab === 'legacy' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-medium mb-4">Legacy Panels</h1>
                <p className="text-muted-foreground mb-6">Access to original individual panels for reference and specialized workflows</p>
              </div>
              
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Legacy panels provide access to the original specialized interfaces. Use these for workflows not yet integrated into the unified system.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {legacyPanels.map((panel) => (
                  <Card 
                    key={panel.id}
                    className="cursor-pointer hover:bg-accent transition-all hover:shadow-md border-2 hover:border-primary/20"
                    onClick={() => handleLegacyNavigation(panel.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{panel.emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            {panel.name}
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">{panel.description}</p>
                          
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Key Features:</Label>
                            <div className="flex flex-wrap gap-1">
                              {panel.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Badge variant="secondary" className="text-xs">
                              Click to Access Legacy Panel
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Legacy Navigation Confirmation */}
        <Dialog open={showLegacyDialog} onOpenChange={setShowLegacyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Navigate to Legacy Panel
              </DialogTitle>
              <DialogDescription>
                You are about to navigate to the legacy {selectedLegacyPanel} panel. This will take you away from the unified restaurant panel.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You are about to navigate to the legacy {selectedLegacyPanel} panel. This will take you away from the unified restaurant panel.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-muted-foreground">
                The legacy panel provides the original specialized interface for {selectedLegacyPanel} operations. 
                You can return to the unified panel anytime using the dashboard selector.
              </p>
              
              <div className="flex gap-3">
                <Button onClick={confirmLegacyNavigation}>
                  Continue to Legacy Panel
                </Button>
                <Button variant="outline" onClick={() => setShowLegacyDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
