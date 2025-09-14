import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Calendar, Clock, Users, Phone, Plus, UserCheck, X, AlertCircle, Loader2 } from 'lucide-react';
import type { Reservation, ReservationStatus } from '../types/reservation';
import { 
  getRestaurantReservations,
  createReservation,
  confirmReservation,
  seatReservation,
  cancelReservation
} from '../services/reservation';
import { toast } from 'sonner';

interface ReservationsAndWaitlistProps {
  restaurantId: string;
}

type FilterType = 'all' | 'reserved' | 'waiting';

// Map reservation statuses to categories
const getReservationCategory = (status: ReservationStatus): 'reserved' | 'waiting' => {
  switch (status) {
    case 'confirmed':
    case 'seated':
      return 'reserved';
    case 'pending':
      return 'waiting';
    default:
      return 'reserved'; // completed, cancelled, noShow are considered resolved reservations
  }
};

const getStatusColor = (status: ReservationStatus) => {
  switch (status) {
    case 'confirmed': return 'bg-blue-500 text-white';
    case 'pending': return 'bg-yellow-500 text-black';
    case 'seated': return 'bg-green-500 text-white';
    case 'completed': return 'bg-gray-500 text-white';
    case 'cancelled': return 'bg-red-500 text-white';
    case 'noShow': return 'bg-red-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Empty state component specifically for reservations
const EmptyReservationsList = ({ filter, onCreateReservation }: { 
  filter: FilterType; 
  onCreateReservation: () => void;
}) => {
  const getEmptyMessage = () => {
    switch (filter) {
      case 'waiting':
        return {
          title: "No Waiting Guests",
          description: "There are no guests currently waiting for confirmation.",
          icon: Clock
        };
      case 'reserved':
        return {
          title: "No Reserved Tables",
          description: "There are no confirmed or seated reservations at the moment.",
          icon: Calendar
        };
      default:
        return {
          title: "No Reservations Yet",
          description: "Start accepting reservations by creating your first one or wait for customers to book online.",
          icon: Calendar
        };
    }
  };

  const { title, description, icon: Icon } = getEmptyMessage();

  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-xl font-medium mb-3">{title}</h3>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">{description}</p>
        <Button onClick={onCreateReservation} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Add First Reservation
        </Button>
      </CardContent>
    </Card>
  );
};

// Loading state for the reservations list
const ReservationsListLoading = () => (
  <Card>
    <CardContent className="p-8">
      <div className="flex items-center justify-center space-x-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading reservations...</p>
      </div>
    </CardContent>
  </Card>
);

// Error state for the reservations list
const ReservationsListError = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Card className="border-destructive/20">
    <CardContent className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
      <h3 className="font-medium text-destructive mb-2">Unable to Load Reservations</h3>
      <p className="text-muted-foreground mb-6">{error}</p>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </CardContent>
  </Card>
);

export function ReservationsAndWaitlist({ restaurantId }: ReservationsAndWaitlistProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // New reservation form state
  const [newReservation, setNewReservation] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    time: '',
    partySize: '',
    specialRequests: ''
  });

  // Load reservations from Firestore (only affects the list area)
  const loadReservations = useCallback(async () => {
    if (!restaurantId) {
      setReservations([]);
      setListLoading(false);
      return;
    }

    try {
      setListLoading(true);
      setListError('');
      
      const data = await getRestaurantReservations(restaurantId);
      setReservations(data);
      console.log('✅ Loaded reservations:', data.length);
    } catch (err) {
      console.error('❌ Error loading reservations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reservations';
      setListError(errorMessage);
    } finally {
      setListLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Filter reservations based on selected filter
  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'all') return true;
    return getReservationCategory(reservation.status) === filter;
  });

  // Count reservations by category
  const reservedCount = reservations.filter(r => getReservationCategory(r.status) === 'reserved').length;
  const waitingCount = reservations.filter(r => getReservationCategory(r.status) === 'waiting').length;

  // Handle creating new reservation
  const handleCreateReservation = async () => {
    if (!newReservation.customerName || !newReservation.customerEmail || !newReservation.date || !newReservation.time || !newReservation.partySize) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setActionLoading('create');
      
      // Combine date and time
      const dateTime = new Date(`${newReservation.date}T${newReservation.time}`);
      
      const reservationData = {
        userId: `manual-${Date.now()}`, // Unique ID for manually created reservations
        restaurantId,
        restaurantName: 'Restaurant', // Simple name - can be updated when restaurant context is available
        dateTime,
        partySize: parseInt(newReservation.partySize),
        status: 'pending' as ReservationStatus,
        specialRequests: newReservation.specialRequests || undefined,
        customerInfo: {
          name: newReservation.customerName,
          email: newReservation.customerEmail,
          phone: newReservation.customerPhone
        }
      };

      await createReservation(reservationData);
      
      // Reset form
      setNewReservation({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        date: new Date().toISOString().split('T')[0], // Reset to today
        time: '',
        partySize: '',
        specialRequests: ''
      });
      
      setShowNewReservation(false);
      toast.success('Reservation created successfully');
      
      // Reload reservations
      await loadReservations();
    } catch (err) {
      console.error('❌ Error creating reservation:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reservation';
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  // Handle quick actions
  const handleQuickAction = async (reservation: Reservation, action: 'confirm' | 'seat' | 'cancel') => {
    try {
      setActionLoading(`${action}-${reservation.id}`);
      
      switch (action) {
        case 'confirm':
          await confirmReservation(reservation.id);
          toast.success('Reservation confirmed');
          break;
        case 'seat':
          await seatReservation(reservation.id);
          toast.success('Guests seated');
          break;
        case 'cancel':
          await cancelReservation(reservation.id, 'Cancelled by restaurant');
          toast.success('Reservation cancelled');
          break;
      }
      
      await loadReservations();
    } catch (err) {
      console.error('❌ Error updating reservation:', err);
      const errorMessage = err instanceof Error ? err.message : `Failed to ${action} reservation`;
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDateTime = (dateTime: Date) => {
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Render the reservations list content
  const renderReservationsList = () => {
    if (listLoading) {
      return <ReservationsListLoading />;
    }

    if (listError) {
      return <ReservationsListError error={listError} onRetry={loadReservations} />;
    }

    if (filteredReservations.length === 0) {
      return <EmptyReservationsList filter={filter} onCreateReservation={() => setShowNewReservation(true)} />;
    }

    return (
      <div className="grid gap-4">
        {filteredReservations.map((reservation) => {
          const { date, time } = formatDateTime(reservation.dateTime);
          return (
            <Card key={reservation.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{reservation.customerInfo.name}</h3>
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{reservation.partySize} people</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{reservation.customerInfo.phone || 'No phone'}</span>
                      </div>
                    </div>

                    {reservation.specialRequests && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm italic">"{reservation.specialRequests}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {reservation.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickAction(reservation, 'confirm')}
                        disabled={actionLoading === `confirm-${reservation.id}`}
                      >
                        {actionLoading === `confirm-${reservation.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Confirm
                          </>
                        )}
                      </Button>
                    )}
                    {reservation.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleQuickAction(reservation, 'seat')}
                        disabled={actionLoading === `seat-${reservation.id}`}
                      >
                        {actionLoading === `seat-${reservation.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4 mr-1" />
                            Seat
                          </>
                        )}
                      </Button>
                    )}
                    {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleQuickAction(reservation, 'cancel')}
                        disabled={actionLoading === `cancel-${reservation.id}`}
                      >
                        {actionLoading === `cancel-${reservation.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Always render the full UI - no early returns for loading/error states
  return (
    <div className="space-y-6">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Reservations & Waitlist</h1>
          <p className="text-muted-foreground">Manage your restaurant reservations</p>
        </div>
        <Dialog open={showNewReservation} onOpenChange={setShowNewReservation}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Reservation</DialogTitle>
              <DialogDescription>
                Create a new reservation for a guest
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input 
                  placeholder="John Doe" 
                  value={newReservation.customerName}
                  onChange={(e) => setNewReservation({...newReservation, customerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input 
                  type="email" 
                  placeholder="john@email.com" 
                  value={newReservation.customerEmail}
                  onChange={(e) => setNewReservation({...newReservation, customerEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input 
                  placeholder="(555) 123-4567" 
                  value={newReservation.customerPhone}
                  onChange={(e) => setNewReservation({...newReservation, customerPhone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input 
                    type="date" 
                    value={newReservation.date}
                    onChange={(e) => setNewReservation({...newReservation, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input 
                    type="time" 
                    value={newReservation.time}
                    onChange={(e) => setNewReservation({...newReservation, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Party Size *</Label>
                <Select 
                  value={newReservation.partySize} 
                  onValueChange={(value) => setNewReservation({...newReservation, partySize: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select party size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Special Requests</Label>
                <Input 
                  placeholder="Any special requests..." 
                  value={newReservation.specialRequests}
                  onChange={(e) => setNewReservation({...newReservation, specialRequests: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1" 
                  onClick={handleCreateReservation}
                  disabled={actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Reservation'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewReservation(false)}
                  disabled={actionLoading === 'create'}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Tabs - Always visible */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({reservations.length})
          </Button>
          <Button
            variant={filter === 'reserved' ? 'default' : 'outline'}
            onClick={() => setFilter('reserved')}
            size="sm"
          >
            Reserved ({reservedCount})
          </Button>
          <Button
            variant={filter === 'waiting' ? 'default' : 'outline'}
            onClick={() => setFilter('waiting')}
            size="sm"
          >
            Waiting ({waitingCount})
          </Button>
        </div>
      </div>

      {/* Reservations List - Shows loading, error, empty, or data states */}
      {renderReservationsList()}
    </div>
  );
}