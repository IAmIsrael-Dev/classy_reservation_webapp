 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Calendar, Search, Filter, Plus, Phone, Users, UserCheck, X, Edit } from 'lucide-react';
import type { Reservation } from '../types/reservation';
import { 
  getRestaurantReservations, 
  getTodaysReservations,
  updateReservation,
  confirmReservation,
  seatReservation,
  cancelReservation,
  markNoShow
} from '../services/reservation';

// Mock waitlist data (will be replaced with Firebase integration later)

const mockWaitlist = [
  { 
    id: 1, 
    customerName: "Lisa Anderson", 
    phone: "(555) 111-2222",
    guests: 2, 
    estimatedWait: 15, 
    priority: "high", 
    arrivedAt: "19:45",
    notes: "Regular customer"
  },
  { 
    id: 2, 
    customerName: "Tom Wilson", 
    phone: "(555) 333-4444",
    guests: 4, 
    estimatedWait: 25, 
    priority: "normal", 
    arrivedAt: "19:35",
    notes: "First time visit"
  },
];

interface ReservationsAndWaitlistProps {
  restaurantId: string;
}

export function ReservationsAndWaitlist({ restaurantId }: ReservationsAndWaitlistProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showNewReservation, setShowNewReservation] = useState(false);

  // Load reservations
  useEffect(() => {
    const loadReservations = async () => {
      if (!restaurantId) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        let reservationData: Reservation[];
        
        if (dateFilter === 'today') {
          reservationData = await getTodaysReservations(restaurantId);
        } else {
          // For other date filters, you can implement date range logic
          reservationData = await getRestaurantReservations(restaurantId);
        }
        
        setReservations(reservationData);
      } catch (err) {
        console.error('Error loading reservations:', err);
        setError('Failed to load reservations');
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, [restaurantId, dateFilter]);

  // Filter reservations based on search and status
  useEffect(() => {
    let filtered = reservations;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.customerInfo.name.toLowerCase().includes(term) ||
        r.customerInfo.email.toLowerCase().includes(term) ||
        r.confirmationNumber.toLowerCase().includes(term)
      );
    }

    setFilteredReservations(filtered);
  }, [reservations, statusFilter, searchTerm]);

  const handleStatusChange = async (reservation: Reservation, newStatus: string) => {
    try {
      setIsLoading(true);
      let updatedReservation: Reservation;

      switch (newStatus) {
        case 'confirmed':
          updatedReservation = await confirmReservation(reservation.id);
          break;
        case 'seated':
          updatedReservation = await seatReservation(reservation.id);
          break;
        case 'cancelled':
          updatedReservation = await cancelReservation(reservation.id, 'Cancelled by restaurant');
          break;
        case 'noShow':
          updatedReservation = await markNoShow(reservation.id);
          break;
        default:
          updatedReservation = await updateReservation(reservation.id, { status: newStatus as any });
      }

      // Update the reservations list
      setReservations(prev => prev.map(r => 
        r.id === reservation.id ? updatedReservation : r
      ));
      
    } catch (err) {
      console.error('Error updating reservation:', err);
      setError('Failed to update reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'seated': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      case 'no-show': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-950';
      case 'normal': return 'text-blue-500 bg-blue-50 dark:bg-blue-950';
      case 'low': return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-950';
    }
  };

  const handleQuickAction = async (reservation: Reservation, action: 'seat' | 'cancel' | 'no-show' | 'confirm') => {
    await handleStatusChange(reservation, action);
  };

  const handleWaitlistAction = (waitlistId: number, action: 'seat' | 'call' | 'remove') => {
    console.log(`${action} waitlist guest ${waitlistId}`);
    // Handle the action here
  };

  const formatDateTime = (dateTime: Date) => {
    return {
      date: dateTime.toLocaleDateString(),
      time: dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Reservations & Waitlist</h1>
          <p className="text-muted-foreground">Manage reservations and walk-in guests</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{filteredReservations.length} Reservations</Badge>
          <Badge variant="outline">{mockWaitlist.length} Waiting</Badge>
          <Dialog open={showNewReservation} onOpenChange={setShowNewReservation}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Reservation
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name</Label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="(555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@email.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Party Size</Label>
                  <Select>
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
                  <Input placeholder="Any special requests..." />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Create Reservation</Button>
                  <Button variant="outline" onClick={() => setShowNewReservation(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="reservations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reservations" className="gap-2">
            <Calendar className="w-4 h-4" />
            Reservations
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="gap-2">
            <Users className="w-4 h-4" />
            Waitlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, phone, or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="seated">Seated</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reservations Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReservations.map((reservation) => {
                    const { date, time } = formatDateTime(reservation.dateTime);
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{reservation.customerInfo.name}</div>
                            {reservation.specialRequests && (
                              <div className="text-sm text-muted-foreground italic">"{reservation.specialRequests}"</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{date}</div>
                            <div className="text-sm text-muted-foreground">{time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {reservation.partySize}
                          </div>
                        </TableCell>
                        <TableCell>
                          {reservation.tableNumber ? (
                            <Badge variant="outline">{reservation.tableNumber}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{reservation.customerInfo.phone}</div>
                            <div className="text-muted-foreground">{reservation.customerInfo.email}</div>
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {reservation.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleQuickAction(reservation, 'seat')}
                              disabled={isLoading}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Seat
                            </Button>
                          )}
                          {reservation.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleQuickAction(reservation, 'confirm')}
                              disabled={isLoading}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReservation(reservation)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="space-y-6">
          {/* Waitlist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockWaitlist.map((guest, index) => (
              <Card key={guest.id} className={`border-l-4 ${getPriorityColor(guest.priority)}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{guest.customerName}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1} in line
                          </Badge>
                          <span>•</span>
                          <span>Arrived: {guest.arrivedAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-medium text-orange-600">
                          {guest.estimatedWait}m
                        </div>
                        <div className="text-xs text-muted-foreground">wait time</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{guest.guests} people</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{guest.phone}</span>
                      </div>
                    </div>
                    
                    {guest.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground italic">"{guest.notes}"</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleWaitlistAction(guest.id, 'seat')}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Seat Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWaitlistAction(guest.id, 'call')}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleWaitlistAction(guest.id, 'remove')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add to Waitlist */}
          <Card>
            <CardHeader>
              <CardTitle>Add Walk-in Guest</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input placeholder="Customer name" />
                <Input placeholder="Phone number" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Party size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(size => (
                      <SelectItem key={size} value={size.toString()}>
                        {size} {size === 1 ? 'person' : 'people'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button>Add to Waitlist</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reservation Details</DialogTitle>
              <DialogDescription>
                Manage reservation for {selectedReservation.customerInfo.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Customer Information</Label>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="ml-2 font-medium">{selectedReservation.customerInfo.name}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <span className="ml-2">{selectedReservation.customerInfo.phone}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="ml-2">{selectedReservation.customerInfo.email}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Confirmation:</span>
                        <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">{selectedReservation.confirmationNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Reservation Details</Label>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="ml-2 font-medium">{formatDateTime(selectedReservation.dateTime).date}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Time:</span>
                        <span className="ml-2">{formatDateTime(selectedReservation.dateTime).time}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Party Size:</span>
                        <span className="ml-2">{selectedReservation.partySize} people</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Table:</span>
                        <span className="ml-2">{selectedReservation.tableNumber || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={`ml-2 ${getStatusColor(selectedReservation.status)}`}>
                          {selectedReservation.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedReservation.specialRequests && (
                <div>
                  <Label className="text-sm font-medium">Special Requests</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReservation.specialRequests}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Edit Reservation</Button>
                {selectedReservation.status === 'confirmed' && (
                  <Button variant="outline" onClick={() => handleQuickAction(selectedReservation, 'seat')}>
                    Seat Guest
                  </Button>
                )}
                {selectedReservation.status === 'pending' && (
                  <Button variant="outline" onClick={() => handleQuickAction(selectedReservation, 'confirm')}>
                    Confirm
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleQuickAction(selectedReservation, 'cancel')}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}