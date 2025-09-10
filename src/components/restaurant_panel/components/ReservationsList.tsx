/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { RESERVATION_STATUSES } from '../types/reservation';
import type { Reservation, ReservationStatus } from '../types/reservation';
import { 
  confirmReservation, 
  seatReservation, 
  completeReservation, 
  cancelReservation, 
  markNoShow 
} from '../services/reservation';

interface ReservationsListProps {
  restaurantId: string;
  reservations: Reservation[];
  onReservationsUpdate: (reservations: Reservation[]) => void;
}

export const ReservationsList: React.FC<ReservationsListProps> = ({
  reservations,
  onReservationsUpdate
}) => {
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>(reservations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update filtered reservations when props change or filters change
  useEffect(() => {
    let filtered = [...reservations];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(reservation =>
        reservation.customerInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.customerInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.confirmationNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Sort by date/time
    filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

    setFilteredReservations(filtered);
  }, [reservations, searchQuery, statusFilter]);

  const handleStatusUpdate = async (reservationId: string, action: string, tableNumber?: string) => {
    setIsLoading(true);
    setError('');

    try {
      let updatedReservation: Reservation;

      switch (action) {
        case 'confirm':
          updatedReservation = await confirmReservation(reservationId);
          break;
        case 'seat':
          updatedReservation = await seatReservation(reservationId, tableNumber);
          break;
        case 'complete':
          updatedReservation = await completeReservation(reservationId);
          break;
        case 'cancel':
          updatedReservation = await cancelReservation(reservationId, 'Cancelled by restaurant');
          break;
        case 'no-show':
          updatedReservation = await markNoShow(reservationId);
          break;
        default:
          throw new Error('Invalid action');
      }

      // Update the reservations list
      const updatedReservations = reservations.map(r =>
        r.id === reservationId ? updatedReservation : r
      );
      onReservationsUpdate(updatedReservations);
    } catch (error: any) {
      console.error('Failed to update reservation:', error);
      setError(error.message || 'Failed to update reservation');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(dateTime));
  };

  const getStatusBadge = (status: ReservationStatus) => {
    const config = RESERVATION_STATUSES[status];
    return (
      <Badge className={`${config.color} ${config.bgColor}`}>
        {config.label}
      </Badge>
    );
  };

  const getActionButtons = (reservation: Reservation) => {
    const buttons = [];

    if (reservation.status === 'pending') {
      buttons.push(
        <Button
          key="confirm"
          size="sm"
          onClick={() => handleStatusUpdate(reservation.id!, 'confirm')}
          disabled={isLoading}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirm
        </Button>
      );
    }

    if (reservation.status === 'confirmed') {
      buttons.push(
        <Button
          key="seat"
          size="sm"
          variant="outline"
          onClick={() => {
            const tableNumber = prompt('Enter table number:');
            if (tableNumber) {
              handleStatusUpdate(reservation.id!, 'seat', tableNumber);
            }
          }}
          disabled={isLoading}
        >
          <UserCheck className="w-3 h-3 mr-1" />
          Seat
        </Button>
      );
    }

    if (reservation.status === 'seated') {
      buttons.push(
        <Button
          key="complete"
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(reservation.id!, 'complete')}
          disabled={isLoading}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Complete
        </Button>
      );
    }

    if (['pending', 'confirmed'].includes(reservation.status)) {
      buttons.push(
        <Button
          key="cancel"
          size="sm"
          variant="destructive"
          onClick={() => handleStatusUpdate(reservation.id!, 'cancel')}
          disabled={isLoading}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      );

      // Add no-show option if reservation time has passed
      const now = new Date();
      const reservationTime = new Date(reservation.dateTime);
      if (now > reservationTime) {
        buttons.push(
          <Button
            key="no-show"
            size="sm"
            variant="destructive"
            onClick={() => handleStatusUpdate(reservation.id!, 'no-show')}
            disabled={isLoading}
          >
            <AlertCircle className="w-3 h-3 mr-1" />
            No Show
          </Button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-xl font-semibold">Reservations</h3>
          <p className="text-muted-foreground">
            {filteredReservations.length} of {reservations.length} reservations
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search reservations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReservationStatus | 'all')}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(RESERVATION_STATUSES).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Reservations Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No reservations have been made yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => (
            <Card key={reservation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Reservation Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {reservation.customerInfo?.name || 'Unknown Customer'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Confirmation: {reservation.confirmationNumber}
                        </p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDateTime(reservation.dateTime)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'}</span>
                      </div>

                      {reservation.tableNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Table:</span>
                          <Badge variant="outline">{reservation.tableNumber}</Badge>
                        </div>
                      )}
                    </div>

                    {/* Customer Contact */}
                    <div className="text-sm text-muted-foreground space-y-1">
                      {reservation.customerInfo?.email && (
                        <div>Email: {reservation.customerInfo.email}</div>
                      )}
                      {reservation.customerInfo?.phone && (
                        <div>Phone: {reservation.customerInfo.phone}</div>
                      )}
                    </div>

                    {/* Special Requests */}
                    {reservation.specialRequests && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Special Requests: </span>
                        <span>{reservation.specialRequests}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    {getActionButtons(reservation)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};