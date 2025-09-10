import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { 
  UserCheck, 
  Clock, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  User
} from 'lucide-react';

interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  email: string;
  partySize: number;
  reservationTime: string;
  actualArrivalTime?: string;
  table?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'checked-in' | 'no-show' | 'cancelled';
  specialRequests?: string;
  notes?: string;
}

interface WaitlistEntry {
  id: string;
  guestName: string;
  phone: string;
  partySize: number;
  arrivalTime: string;
  estimatedWait: number;
  status: 'waiting' | 'notified' | 'ready' | 'seated' | 'left';
}

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: '1',
    guestName: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john@example.com',
    partySize: 4,
    reservationTime: '19:00',
    status: 'confirmed',
    specialRequests: 'Birthday celebration'
  },
  {
    id: '2',
    guestName: 'Sarah Johnson',
    phone: '(555) 234-5678',
    email: 'sarah@example.com',
    partySize: 2,
    reservationTime: '19:30',
    status: 'confirmed'
  },
  {
    id: '3',
    guestName: 'Mike Wilson',
    phone: '(555) 345-6789',
    email: 'mike@example.com',
    partySize: 6,
    reservationTime: '20:00',
    actualArrivalTime: '19:45',
    status: 'checked-in'
  },
  {
    id: '4',
    guestName: 'Emily Davis',
    phone: '(555) 456-7890',
    email: 'emily@example.com',
    partySize: 3,
    reservationTime: '18:30',
    status: 'seated',
    table: 'T5'
  }
];

const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    id: '1',
    guestName: 'Robert Brown',
    phone: '(555) 567-8901',
    partySize: 2,
    arrivalTime: '19:15',
    estimatedWait: 25,
    status: 'waiting'
  },
  {
    id: '2',
    guestName: 'Lisa Garcia',
    phone: '(555) 678-9012',
    partySize: 4,
    arrivalTime: '19:45',
    estimatedWait: 45,
    status: 'notified'
  }
];

export function HostCheckin() {
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(MOCK_WAITLIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'reservations' | 'waitlist'>('reservations');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (status: Reservation['status']) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', label: 'Pending', icon: Clock },
      confirmed: { color: 'bg-blue-500', label: 'Confirmed', icon: CheckCircle },
      'checked-in': { color: 'bg-green-500', label: 'Checked In', icon: UserCheck },
      seated: { color: 'bg-purple-500', label: 'Seated', icon: MapPin },
      'no-show': { color: 'bg-red-500', label: 'No Show', icon: XCircle },
      cancelled: { color: 'bg-gray-500', label: 'Cancelled', icon: XCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={`text-white ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getWaitlistStatusBadge = (status: WaitlistEntry['status']) => {
    const statusConfig = {
      waiting: { color: 'bg-yellow-500', label: 'Waiting', icon: Timer },
      notified: { color: 'bg-blue-500', label: 'Notified', icon: AlertCircle },
      ready: { color: 'bg-green-500', label: 'Ready', icon: CheckCircle },
      seated: { color: 'bg-purple-500', label: 'Seated', icon: MapPin },
      left: { color: 'bg-gray-500', label: 'Left', icon: XCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={`text-white ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const updateReservationStatus = (id: string, status: Reservation['status'], table?: string) => {
    setReservations(prev => prev.map(res => 
      res.id === id 
        ? { 
            ...res, 
            status, 
            table,
            actualArrivalTime: status === 'checked-in' && !res.actualArrivalTime 
              ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : res.actualArrivalTime
          }
        : res
    ));
  };

  const updateWaitlistStatus = (id: string, status: WaitlistEntry['status']) => {
    setWaitlist(prev => prev.map(entry => 
      entry.id === id ? { ...entry, status } : entry
    ));
  };

  const addToWaitlist = (name: string, phone: string, partySize: number) => {
    const newEntry: WaitlistEntry = {
      id: Date.now().toString(),
      guestName: name,
      phone,
      partySize,
      arrivalTime: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      estimatedWait: 30, // Default 30 minutes
      status: 'waiting'
    };
    setWaitlist(prev => [...prev, newEntry]);
  };

  const filteredReservations = reservations.filter(res =>
    res.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.phone.includes(searchTerm) ||
    res.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWaitlist = waitlist.filter(entry =>
    entry.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.phone.includes(searchTerm)
  );

  const getReservationTimeStatus = (reservationTime: string) => {
    const [hours, minutes] = reservationTime.split(':').map(Number);
    const reservationDate = new Date();
    reservationDate.setHours(hours, minutes, 0, 0);
    
    const timeDiff = (reservationDate.getTime() - currentTime.getTime()) / (1000 * 60);
    
    if (timeDiff < -30) return { status: 'late', text: 'Late', color: 'text-red-500' };
    if (timeDiff < 0) return { status: 'arrived', text: 'Arrival time', color: 'text-yellow-500' };
    if (timeDiff < 30) return { status: 'soon', text: 'Soon', color: 'text-green-500' };
    return { status: 'upcoming', text: 'Upcoming', color: 'text-muted-foreground' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Host Check-in</h1>
          <p className="text-muted-foreground">Manage guest arrivals and table assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Current Time: <span className="font-medium">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant={selectedTab === 'reservations' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('reservations')}
              >
                Reservations ({reservations.length})
              </Button>
              <Button
                variant={selectedTab === 'waitlist' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('waitlist')}
              >
                Waitlist ({waitlist.length})
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {selectedTab === 'reservations' && (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => {
                const timeStatus = getReservationTimeStatus(reservation.reservationTime);
                
                return (
                  <Card key={reservation.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {reservation.guestName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{reservation.guestName}</h4>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {reservation.partySize} guests
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span className={timeStatus.color}>
                                {reservation.reservationTime} ({timeStatus.text})
                              </span>
                            </div>
                            {reservation.actualArrivalTime && (
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-4 h-4" />
                                Arrived: {reservation.actualArrivalTime}
                              </div>
                            )}
                            {reservation.table && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                Table {reservation.table}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {reservation.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {reservation.email}
                            </div>
                          </div>
                          {reservation.specialRequests && (
                            <div className="text-sm text-blue-600 mt-1">
                              Note: {reservation.specialRequests}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {reservation.status === 'confirmed' && (
                          <>
                            <Button
                              onClick={() => updateReservationStatus(reservation.id, 'checked-in')}
                              size="sm"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Check In
                            </Button>
                            <Button
                              onClick={() => updateReservationStatus(reservation.id, 'no-show')}
                              variant="outline"
                              size="sm"
                            >
                              No Show
                            </Button>
                          </>
                        )}
                        
                        {reservation.status === 'checked-in' && (
                          <Button
                            onClick={() => updateReservationStatus(reservation.id, 'seated', 'T' + Math.floor(Math.random() * 20 + 1))}
                            size="sm"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Seat Guest
                          </Button>
                        )}
                        
                        {reservation.status === 'seated' && (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Seated at {reservation.table}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {selectedTab === 'waitlist' && (
            <div className="space-y-4">
              {/* Add to Waitlist Form */}
              <Card className="p-4 bg-muted/20">
                <h4 className="font-medium mb-4">Add Walk-in to Waitlist</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input placeholder="Guest name" />
                  <Input placeholder="Phone number" />
                  <Input type="number" placeholder="Party size" min="1" max="20" />
                  <Button onClick={() => addToWaitlist('New Guest', '(555) 000-0000', 2)}>
                    <User className="w-4 h-4 mr-2" />
                    Add to Waitlist
                  </Button>
                </div>
              </Card>

              {filteredWaitlist.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {entry.guestName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{entry.guestName}</h4>
                          {getWaitlistStatusBadge(entry.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {entry.partySize} guests
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Arrived: {entry.arrivalTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="w-4 h-4" />
                            Est. wait: {entry.estimatedWait}min
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {entry.phone}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {entry.status === 'waiting' && (
                        <Button
                          onClick={() => updateWaitlistStatus(entry.id, 'notified')}
                          size="sm"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Notify
                        </Button>
                      )}
                      
                      {entry.status === 'notified' && (
                        <Button
                          onClick={() => updateWaitlistStatus(entry.id, 'ready')}
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Ready
                        </Button>
                      )}
                      
                      {entry.status === 'ready' && (
                        <Button
                          onClick={() => updateWaitlistStatus(entry.id, 'seated')}
                          size="sm"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Seat
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => updateWaitlistStatus(entry.id, 'left')}
                        variant="outline"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Reservations</p>
                <p className="text-2xl font-medium">{reservations.length}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="text-2xl font-medium">{reservations.filter(r => r.status === 'checked-in').length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Seated</p>
                <p className="text-2xl font-medium">{reservations.filter(r => r.status === 'seated').length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waitlist</p>
                <p className="text-2xl font-medium">{waitlist.filter(w => w.status === 'waiting').length}</p>
              </div>
              <Timer className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}