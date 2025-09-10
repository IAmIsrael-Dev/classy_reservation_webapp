 
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Table, TableStatus } from '../types/table';
import { firestore, isMockMode } from '../firebaseClient';

// Mock tables for development
const mockTables: Table[] = [
  {
    id: 'mock-table-1',
    restaurantId: 'mock-restaurant-1',
    tableNumber: '1',
    capacity: 2,
    status: 'available',
    location: 'Main Dining',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-table-2',
    restaurantId: 'mock-restaurant-1',
    tableNumber: '2',
    capacity: 4,
    status: 'occupied',
    location: 'Main Dining',
    currentReservationId: 'mock-reservation-1',
    estimatedTurnTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-table-3',
    restaurantId: 'mock-restaurant-1',
    tableNumber: '3',
    capacity: 6,
    status: 'reserved',
    location: 'Window Section',
    currentReservationId: 'mock-reservation-2',
    estimatedTurnTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-table-4',
    restaurantId: 'mock-restaurant-1',
    tableNumber: '4',
    capacity: 2,
    status: 'cleaning',
    location: 'Patio',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-table-5',
    restaurantId: 'mock-restaurant-1',
    tableNumber: '5',
    capacity: 8,
    status: 'available',
    location: 'Private Room',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Create new table
export const createTable = async (
  restaurantId: string,
  tableData: { tableNumber: string; capacity: number; location?: string }
): Promise<Table> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockTable: Table = {
      id: `mock-table-${Date.now()}`,
      restaurantId,
      ...tableData,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to mock data
    mockTables.push(mockTable);
    
    console.log('✅ Mock table created:', mockTable.tableNumber);
    return mockTable;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const tableDoc = {
      restaurantId,
      ...tableData,
      status: 'available' as TableStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(firestore, 'tables'), tableDoc);

    const newTable: Table = {
      id: docRef.id,
      restaurantId,
      ...tableData,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Table created successfully:', newTable.tableNumber);
    return newTable;
  } catch (error: unknown) {
    console.error('❌ Create table error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create table');
  }
};

// Update table
export const updateTable = async (
  tableId: string,
  updates: { status?: TableStatus; currentReservationId?: string; estimatedTurnTime?: Date }
): Promise<Table> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const table = mockTables.find(t => t.id === tableId);
    if (table) {
      Object.assign(table, updates, { updatedAt: new Date() });
      console.log('✅ Mock table updated:', table.tableNumber);
      return table;
    }
    throw new Error('Table not found');
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, updateDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
    
    const tableRef = doc(firestore, 'tables', tableId);
    
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    // Convert Date to ISO string for Firestore
    if (updates.estimatedTurnTime) {
      updateData.estimatedTurnTime = updates.estimatedTurnTime.toISOString();
    }

    await updateDoc(tableRef, updateData);

    // Get the updated document
    const updatedDoc = await getDoc(tableRef);
    if (!updatedDoc.exists()) {
      throw new Error('Table not found');
    }

    const updatedData = updatedDoc.data();
    const updatedTable: Table = {
      id: tableId,
      restaurantId: updatedData.restaurantId,
      tableNumber: updatedData.tableNumber,
      capacity: updatedData.capacity,
      status: updatedData.status,
      location: updatedData.location,
      currentReservationId: updatedData.currentReservationId,
      estimatedTurnTime: updatedData.estimatedTurnTime ? new Date(updatedData.estimatedTurnTime) : undefined,
      createdAt: updatedData.createdAt?.toDate() || new Date(),
      updatedAt: updatedData.updatedAt?.toDate() || new Date()
    };

    console.log('✅ Table updated successfully:', updatedTable.tableNumber);
    return updatedTable;
  } catch (error: unknown) {
    console.error('❌ Update table error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update table');
  }
};

// Get all tables for a restaurant
export const getRestaurantTables = async (restaurantId: string): Promise<Table[]> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const tables = mockTables.filter(t => t.restaurantId === restaurantId);
    console.log('✅ Retrieved mock restaurant tables:', tables.length);
    return tables;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    
    const tablesQuery = query(
      collection(firestore, 'tables'),
      where('restaurantId', '==', restaurantId),
      orderBy('tableNumber')
    );

    const querySnapshot = await getDocs(tablesQuery);
    const tables: Table[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tables.push({
        id: doc.id,
        restaurantId: data.restaurantId,
        tableNumber: data.tableNumber,
        capacity: data.capacity,
        status: data.status,
        location: data.location,
        currentReservationId: data.currentReservationId,
        estimatedTurnTime: data.estimatedTurnTime ? new Date(data.estimatedTurnTime) : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    console.log('✅ Retrieved restaurant tables:', tables.length);
    return tables;
  } catch (error: unknown) {
    console.error('❌ Get restaurant tables error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get restaurant tables');
  }
};

// Get available tables for a restaurant
export const getAvailableTables = async (
  restaurantId: string,
  capacity?: number
): Promise<Table[]> => {
  const allTables = await getRestaurantTables(restaurantId);
  
  let availableTables = allTables.filter(t => t.status === 'available');
  
  // Filter by minimum capacity if specified
  if (capacity) {
    availableTables = availableTables.filter(t => t.capacity >= capacity);
  }
  
  return availableTables.sort((a, b) => a.capacity - b.capacity);
};

// Update table status
export const updateTableStatus = async (
  tableId: string,
  status: TableStatus,
  reservationId?: string,
  estimatedTurnTime?: Date
): Promise<Table> => {
  return updateTable(tableId, {
    status,
    currentReservationId: reservationId,
    estimatedTurnTime
  });
};

// Assign table to reservation
export const assignTableToReservation = async (
  tableId: string,
  reservationId: string,
  estimatedTurnTime?: Date
): Promise<Table> => {
  return updateTableStatus(tableId, 'occupied', reservationId, estimatedTurnTime);
};

// Clear table (make available)
export const clearTable = async (tableId: string): Promise<Table> => {
  return updateTable(tableId, {
    status: 'available',
    currentReservationId: undefined,
    estimatedTurnTime: undefined
  });
};

// Set table for cleaning
export const setTableCleaning = async (tableId: string): Promise<Table> => {
  return updateTableStatus(tableId, 'cleaning');
};

// Delete table
export const deleteTable = async (tableId: string): Promise<void> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockTables.findIndex(t => t.id === tableId);
    if (index > -1) {
      mockTables.splice(index, 1);
      console.log('✅ Mock table deleted');
    } else {
      throw new Error('Table not found');
    }
    return;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    
    await deleteDoc(doc(firestore, 'tables', tableId));
    console.log('✅ Table deleted successfully');
  } catch (error: unknown) {
    console.error('❌ Delete table error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete table');
  }
};

// Get table by ID
export const getTableById = async (tableId: string): Promise<Table | null> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 200));
    const table = mockTables.find(t => t.id === tableId);
    return table || null;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, getDoc } = await import('firebase/firestore');
    
    const tableDoc = await getDoc(doc(firestore, 'tables', tableId));
    
    if (!tableDoc.exists()) {
      return null;
    }

    const data = tableDoc.data();
    const table: Table = {
      id: tableDoc.id,
      restaurantId: data.restaurantId,
      tableNumber: data.tableNumber,
      capacity: data.capacity,
      status: data.status,
      location: data.location,
      currentReservationId: data.currentReservationId,
      estimatedTurnTime: data.estimatedTurnTime ? new Date(data.estimatedTurnTime) : undefined,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    };

    return table;
  } catch (error: unknown) {
    console.error('❌ Get table by ID error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get table');
  }
};

// Get table summary for analytics
export const getTableSummary = async (restaurantId: string) => {
  const tables = await getRestaurantTables(restaurantId);
  
  const summary = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    occupiedCapacity: tables.filter(t => t.status === 'occupied' || t.status === 'reserved')
                           .reduce((sum, t) => sum + t.capacity, 0)
  };
  
  const utilizationRate = summary.totalCapacity > 0 ? 
    Math.round((summary.occupiedCapacity / summary.totalCapacity) * 100) : 0;
  
  return {
    ...summary,
    utilizationRate
  };
};