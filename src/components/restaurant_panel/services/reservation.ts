/* eslint-disable @typescript-eslint/no-explicit-any */
 
import type { Reservation, ReservationStatus } from '../types/reservation';
import { firestore, isMockMode } from '../firebaseClient';

// Mock reservations for development
const mockReservations: Reservation[] = [
  {
    id: 'mock-reservation-1',
    userId: 'mock-customer-1',
    restaurantId: 'mock-restaurant-1',
    restaurantName: 'Bella Vista',
    dateTime: new Date(2024, 11, 25, 19, 30), // December 25, 2024, 7:30 PM
    partySize: 4,
    status: 'confirmed',
    tableNumber: '12',
    specialRequests: 'Window table preferred',
    confirmationNumber: 'CR240001',
    totalAmount: 120.00,
    customerInfo: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 (555) 123-4567'
    },
    createdAt: new Date(2024, 11, 20),
    updatedAt: new Date(2024, 11, 20)
  },
  {
    id: 'mock-reservation-2',
    userId: 'mock-customer-2',
    restaurantId: 'mock-restaurant-1',
    restaurantName: 'Bella Vista',
    dateTime: new Date(2024, 11, 25, 18, 0), // December 25, 2024, 6:00 PM
    partySize: 2,
    status: 'pending',
    confirmationNumber: 'CR240002',
    customerInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 987-6543'
    },
    createdAt: new Date(2024, 11, 24),
    updatedAt: new Date(2024, 11, 24)
  },
  {
    id: 'mock-reservation-3',
    userId: 'mock-customer-3',
    restaurantId: 'mock-restaurant-1',
    restaurantName: 'Bella Vista',
    dateTime: new Date(2024, 11, 25, 20, 0), // December 25, 2024, 8:00 PM
    partySize: 6,
    status: 'seated',
    tableNumber: '8',
    confirmationNumber: 'CR240003',
    customerInfo: {
      name: 'Michael Brown',
      email: 'michael.brown@email.com',
      phone: '+1 (555) 456-7890'
    },
    createdAt: new Date(2024, 11, 23),
    updatedAt: new Date(2024, 11, 25)
  }
];

// Create new reservation
export const createReservation = async (
  reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'confirmationNumber'>
): Promise<Reservation> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockReservation: Reservation = {
      ...reservationData,
      id: `mock-${Date.now()}`,
      confirmationNumber: `CR${Date.now().toString().slice(-6)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockReservations.push(mockReservation);
    console.log('✅ Mock reservation created:', mockReservation.confirmationNumber);
    return mockReservation;
  }

  // Real Firebase implementation
  if (!firestore) {
    console.warn('⚠️ Firebase not initialized, cannot create reservation in Firebase mode');
    throw new Error('Database connection not available. Please try again or switch to demo mode.');
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const confirmationNumber = `CR${Date.now().toString().slice(-6)}`;
    
    const reservationDoc = {
      ...reservationData,
      confirmationNumber,
      dateTime: reservationData.dateTime.toISOString(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(firestore, 'reservations'), reservationDoc);

    const newReservation: Reservation = {
      ...reservationData,
      id: docRef.id,
      confirmationNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Reservation created successfully in Firestore:', confirmationNumber);
    return newReservation;
  } catch (error: unknown) {
    console.error('❌ Create reservation error:', error);
    
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')) {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    
    if (errorMessage.includes('permission') || 
        errorMessage.includes('auth') ||
        errorMessage.includes('access')) {
      throw new Error('Access denied. Please check your permissions.');
    }
    
    throw new Error('Failed to create reservation. Please try again.');
  }
};

// Update reservation
export const updateReservation = async (
  reservationId: string,
  updates: { status?: ReservationStatus; tableNumber?: string; cancellationReason?: string }
): Promise<Reservation> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const reservation = mockReservations.find(r => r.id === reservationId);
    if (reservation) {
      Object.assign(reservation, updates, { updatedAt: new Date() });
      if (updates.status === 'cancelled' && updates.cancellationReason) {
        reservation.cancelledAt = new Date();
      }
      console.log('✅ Mock reservation updated:', reservation.confirmationNumber);
      return reservation;
    }
    throw new Error('Reservation not found');
  }

  // Real Firebase implementation
  if (!firestore) {
    console.warn('⚠️ Firebase not initialized, cannot update reservation in Firebase mode');
    throw new Error('Database connection not available. Please try again or switch to demo mode.');
  }

  try {
    const { doc, updateDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
    
    const reservationRef = doc(firestore, 'reservations', reservationId);
    
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    if (updates.status === 'cancelled' && updates.cancellationReason) {
      updateData.cancelledAt = serverTimestamp();
    }

    await updateDoc(reservationRef, updateData);

    // Get the updated document
    const updatedDoc = await getDoc(reservationRef);
    if (!updatedDoc.exists()) {
      throw new Error('Reservation not found');
    }

    const updatedData = updatedDoc.data();
    const updatedReservation: Reservation = {
      id: reservationId,
      userId: updatedData.userId,
      restaurantId: updatedData.restaurantId,
      restaurantName: updatedData.restaurantName,
      dateTime: new Date(updatedData.dateTime),
      partySize: updatedData.partySize,
      status: updatedData.status,
      tableNumber: updatedData.tableNumber,
      specialRequests: updatedData.specialRequests,
      confirmationNumber: updatedData.confirmationNumber,
      totalAmount: updatedData.totalAmount,
      customerInfo: updatedData.customerInfo,
      cancellationReason: updatedData.cancellationReason,
      createdAt: updatedData.createdAt?.toDate() || new Date(),
      updatedAt: updatedData.updatedAt?.toDate() || new Date(),
      cancelledAt: updatedData.cancelledAt?.toDate()
    };

    console.log('✅ Reservation updated successfully in Firestore:', updatedReservation.confirmationNumber);
    return updatedReservation;
  } catch (error: unknown) {
    console.error('❌ Update reservation error:', error);
    
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout')) {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    
    if (errorMessage.includes('permission') || 
        errorMessage.includes('auth') ||
        errorMessage.includes('access')) {
      throw new Error('Access denied. Please check your permissions.');
    }
    
    if (errorMessage.includes('not found')) {
      throw new Error('Reservation not found.');
    }
    
    throw new Error('Failed to update reservation. Please try again.');
  }
};

// Get reservations for a restaurant
export const getRestaurantReservations = async (
  restaurantId: string,
  dateFilter?: { start: Date; end: Date }
): Promise<Reservation[]> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = mockReservations.filter(r => r.restaurantId === restaurantId);
    
    if (dateFilter) {
      filtered = filtered.filter(r => 
        r.dateTime >= dateFilter.start && r.dateTime <= dateFilter.end
      );
    }
    
    console.log('✅ Retrieved mock restaurant reservations:', filtered.length);
    return filtered.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  }

  // Real Firebase implementation
  if (!firestore) {
    console.warn('⚠️ Firebase not initialized, falling back to mock data');
    // Fallback to mock data if Firebase is not available
    return getRestaurantReservations(restaurantId, dateFilter);
  }

  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    
    let reservationsQuery = query(
      collection(firestore, 'reservations'),
      where('restaurantId', '==', restaurantId),
      orderBy('dateTime', 'desc')
    );

    // Apply date filter if provided
    if (dateFilter) {
      const { query: queryBuilder, where: whereClause } = await import('firebase/firestore');
      reservationsQuery = queryBuilder(
        collection(firestore, 'reservations'),
        whereClause('restaurantId', '==', restaurantId),
        whereClause('dateTime', '>=', dateFilter.start.toISOString()),
        whereClause('dateTime', '<=', dateFilter.end.toISOString()),
        orderBy('dateTime', 'desc')
      );
    }

    const querySnapshot = await getDocs(reservationsQuery);
    const reservations: Reservation[] = [];

    // Check if query snapshot is empty
    if (querySnapshot.empty) {
      console.log('ℹ️ No reservations found for restaurant:', restaurantId);
      return [];
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        userId: data.userId,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        dateTime: new Date(data.dateTime),
        partySize: data.partySize,
        status: data.status,
        tableNumber: data.tableNumber,
        specialRequests: data.specialRequests,
        confirmationNumber: data.confirmationNumber,
        totalAmount: data.totalAmount,
        customerInfo: data.customerInfo,
        cancellationReason: data.cancellationReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        cancelledAt: data.cancelledAt?.toDate()
      });
    });

    console.log('✅ Retrieved restaurant reservations from Firestore:', reservations.length);
    return reservations;
  } catch (error: unknown) {
    console.error('❌ Get restaurant reservations error:', error);
    
    // Check if this is likely due to empty collection or missing data
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    // Check if this is a collection doesn't exist error
    if (errorMessage.includes('not found') || 
        errorMessage.includes('missing') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('no documents') ||
        errorMessage.includes('collection') ||
        (errorMessage.includes('index') && errorMessage.includes('build'))) {
      console.log('ℹ️ Reservations collection does not exist yet, returning empty array');
      return [];
    }
    
    // For connection errors, network issues, or permission errors
    if (errorMessage.includes('network') || 
        errorMessage.includes('connection') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('permission') ||
        errorMessage.includes('auth') ||
        errorMessage.includes('access') ||
        errorMessage.includes('unavailable') ||
        errorMessage.includes('deadline')) {
      throw new Error('Unable to connect to the database. Please check your internet connection and try again.');
    }
    
    // If the query returns empty, that's not an error
    console.log('ℹ️ Query returned empty results, returning empty array');
    return [];
  }
};

// Get today's reservations for a restaurant
export const getTodaysReservations = async (restaurantId: string): Promise<Reservation[]> => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return getRestaurantReservations(restaurantId, { start: startOfDay, end: endOfDay });
};

// Get upcoming reservations (next 7 days)
export const getUpcomingReservations = async (restaurantId: string): Promise<Reservation[]> => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const reservations = await getRestaurantReservations(restaurantId, { start: now, end: nextWeek });
  
  return reservations.filter(r => 
    ['pending', 'confirmed'].includes(r.status)
  ).sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
};

// Get reservation by ID
export const getReservationById = async (reservationId: string): Promise<Reservation | null> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200));
    const reservation = mockReservations.find(r => r.id === reservationId);
    return reservation || null;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    
    const reservationDoc = await getDoc(doc(firestore, 'reservations', reservationId));
    
    if (!reservationDoc.exists()) {
      return null;
    }

    const data = reservationDoc.data();
    const reservation: Reservation = {
      id: reservationDoc.id,
      userId: data.userId,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName,
      dateTime: new Date(data.dateTime),
      partySize: data.partySize,
      status: data.status,
      tableNumber: data.tableNumber,
      specialRequests: data.specialRequests,
      confirmationNumber: data.confirmationNumber,
      totalAmount: data.totalAmount,
      customerInfo: data.customerInfo,
      cancellationReason: data.cancellationReason,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      cancelledAt: data.cancelledAt?.toDate()
    };

    return reservation;
  } catch (error: unknown) {
    console.error('❌ Get reservation by ID error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get reservation');
  }
};

// Get reservations by user ID
export const getUserReservations = async (userId: string): Promise<Reservation[]> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    const userReservations = mockReservations.filter(r => r.userId === userId);
    console.log('✅ Retrieved mock user reservations:', userReservations.length);
    return userReservations.sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    
    const reservationsQuery = query(
      collection(firestore, 'reservations'),
      where('userId', '==', userId),
      orderBy('dateTime', 'desc')
    );

    const querySnapshot = await getDocs(reservationsQuery);
    const reservations: Reservation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        userId: data.userId,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        dateTime: new Date(data.dateTime),
        partySize: data.partySize,
        status: data.status,
        tableNumber: data.tableNumber,
        specialRequests: data.specialRequests,
        confirmationNumber: data.confirmationNumber,
        totalAmount: data.totalAmount,
        customerInfo: data.customerInfo,
        cancellationReason: data.cancellationReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        cancelledAt: data.cancelledAt?.toDate()
      });
    });

    console.log('✅ Retrieved user reservations:', reservations.length);
    return reservations;
  } catch (error: unknown) {
    console.error('❌ Get user reservations error:', error);
    
    // Check if this is likely due to empty collection or missing data
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    
    if (errorMessage.includes('not found') || 
        errorMessage.includes('missing') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('no documents') ||
        errorMessage.includes('collection') ||
        errorMessage.includes('index') && errorMessage.includes('build')) {
      console.log('ℹ️ No user reservations found or collection is empty, returning empty array');
      return [];
    }
    
    // For other errors (permission, connection, etc.), still throw
    throw new Error(error instanceof Error ? error.message : 'Failed to get user reservations');
  }
};

// Confirm reservation (restaurant staff action)
export const confirmReservation = async (reservationId: string): Promise<Reservation> => {
  return updateReservation(reservationId, { status: 'confirmed' });
};

// Seat guests (transition from confirmed to seated)
export const seatReservation = async (
  reservationId: string, 
  tableNumber?: string
): Promise<Reservation> => {
  return updateReservation(reservationId, { 
    status: 'seated',
    tableNumber 
  });
};

// Complete reservation (guests finished dining)
export const completeReservation = async (reservationId: string): Promise<Reservation> => {
  return updateReservation(reservationId, { status: 'completed' });
};

// Cancel reservation
export const cancelReservation = async (
  reservationId: string,
  cancellationReason: string
): Promise<Reservation> => {
  return updateReservation(reservationId, {
    status: 'cancelled',
    cancellationReason
  });
};

// Mark as no-show
export const markNoShow = async (reservationId: string): Promise<Reservation> => {
  return updateReservation(reservationId, {
    status: 'noShow',
    cancellationReason: 'Customer did not show up'
  });
};

// Delete reservation (hard delete)
export const deleteReservation = async (reservationId: string): Promise<void> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockReservations.findIndex(r => r.id === reservationId);
    if (index > -1) {
      mockReservations.splice(index, 1);
      console.log('✅ Mock reservation deleted');
    } else {
      throw new Error('Reservation not found');
    }
    return;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    
    await deleteDoc(doc(firestore, 'reservations', reservationId));
    console.log('✅ Reservation deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Delete reservation error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete reservation');
  }
};

// Get reservation analytics for a restaurant
export const getReservationAnalytics = async (
  restaurantId: string,
  startDate: Date,
  endDate: Date
) => {
  const reservations = await getRestaurantReservations(restaurantId, { 
    start: startDate, 
    end: endDate 
  });

  const analytics = {
    totalReservations: reservations.length,
    confirmedReservations: reservations.filter(r => r.status === 'confirmed').length,
    completedReservations: reservations.filter(r => r.status === 'completed').length,
    cancelledReservations: reservations.filter(r => r.status === 'cancelled').length,
    noShowReservations: reservations.filter(r => r.status === 'noShow').length,
    totalGuests: reservations.reduce((sum, r) => sum + r.partySize, 0),
    averagePartySize: reservations.length > 0 ? 
      Math.round((reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length) * 10) / 10 : 0,
    totalRevenue: reservations
      .filter(r => r.status === 'completed' && r.totalAmount)
      .reduce((sum, r) => sum + (r.totalAmount || 0), 0),
    busyHours: {} as Record<number, number>
  };

  // Calculate busy hours
  reservations
    .filter(r => ['confirmed', 'seated', 'completed'].includes(r.status))
    .forEach(r => {
      const hour = r.dateTime.getHours();
      analytics.busyHours[hour] = (analytics.busyHours[hour] || 0) + 1;
    });

  return analytics;
};