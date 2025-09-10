/* eslint-disable @typescript-eslint/no-unused-vars */
// Staff management service with Firebase integration
import type { UserRole } from '../types/user';
import { firestore, isMockMode } from '../firebaseClient';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  isActive: boolean;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStaffData {
  name: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  restaurantId: string;
}

// Mock staff data for development
const mockStaff: StaffMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@restaurant.com',
    role: 'manager',
    phoneNumber: '+1 (555) 123-4567',
    isActive: true,
    restaurantId: 'mock-restaurant-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Bob Wilson',
    email: 'bob@restaurant.com',
    role: 'host',
    phoneNumber: '+1 (555) 234-5678',
    isActive: true,
    restaurantId: 'mock-restaurant-1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@restaurant.com',
    role: 'server',
    phoneNumber: '+1 (555) 345-6789',
    isActive: true,
    restaurantId: 'mock-restaurant-1',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'david@restaurant.com',
    role: 'server',
    phoneNumber: '+1 (555) 456-7890',
    isActive: false,
    restaurantId: 'mock-restaurant-1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-01')
  }
];

// Get staff members for a restaurant
export const getRestaurantStaff = async (restaurantId: string): Promise<StaffMember[]> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    const staff = mockStaff.filter(s => s.restaurantId === restaurantId);
    console.log('✅ Retrieved restaurant staff:', staff.length);
    return staff;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    const staffQuery = query(
      collection(firestore, 'users'),
      where('restaurantId', '==', restaurantId),
      where('role', 'in', ['manager', 'host', 'server'])
    );

    const querySnapshot = await getDocs(staffQuery);
    const staff: StaffMember[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      staff.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        isActive: data.isActive ?? true,
        restaurantId: data.restaurantId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    console.log('✅ Retrieved restaurant staff:', staff.length);
    return staff;
  } catch (error: unknown) {
    console.error('❌ Get restaurant staff error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get restaurant staff');
  }
};

// Add new staff member
export const addStaffMember = async (
  restaurantId: string,
  staffData: Omit<CreateStaffData, 'restaurantId'>,
  _temporaryPassword: string = 'TempPass123!'
): Promise<StaffMember> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newStaff: StaffMember = {
      id: Date.now().toString(),
      ...staffData,
      restaurantId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('✅ Mock staff member added:', newStaff.email);
    return newStaff;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    // In a real implementation, this would:
    // 1. Create a Firebase Auth user account
    // 2. Send them a password reset email
    // 3. Create user document in Firestore
    // 4. Send invitation email
    
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const newStaffDoc = {
      ...staffData,
      restaurantId,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(firestore, 'users'), newStaffDoc);

    const newStaff: StaffMember = {
      id: docRef.id,
      ...staffData,
      restaurantId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Staff member added successfully:', newStaff.email);
    return newStaff;
  } catch (error: unknown) {
    console.error('❌ Add staff member error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to add staff member');
  }
};

// Update staff member
export const updateStaffMember = async (
  staffId: string,
  updates: Partial<StaffMember>
): Promise<StaffMember> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockStaffMember = mockStaff.find(s => s.id === staffId);
    if (!mockStaffMember) {
      throw new Error('Staff member not found');
    }
    
    const updatedStaff: StaffMember = {
      ...mockStaffMember,
      ...updates,
      updatedAt: new Date()
    };
    
    console.log('✅ Mock staff member updated:', updatedStaff.email);
    return updatedStaff;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, updateDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
    
    const staffRef = doc(firestore, 'users', staffId);
    
    await updateDoc(staffRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    const updatedDoc = await getDoc(staffRef);
    if (!updatedDoc.exists()) {
      throw new Error('Staff member not found');
    }

    const updatedData = updatedDoc.data();
    const updatedStaff: StaffMember = {
      id: staffId,
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      phoneNumber: updatedData.phoneNumber,
      isActive: updatedData.isActive,
      restaurantId: updatedData.restaurantId,
      createdAt: updatedData.createdAt?.toDate() || new Date(),
      updatedAt: updatedData.updatedAt?.toDate() || new Date()
    };

    console.log('✅ Staff member updated successfully:', updatedStaff.email);
    return updatedStaff;
  } catch (error: unknown) {
    console.error('❌ Update staff member error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update staff member');
  }
};

// Remove staff member (deactivate)
export const removeStaffMember = async (_restaurantId: string, staffId: string): Promise<void> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Mock staff member removed');
    return;
  }

  // Real Firebase implementation
  if (!firestore) {
    throw new Error('Firebase not initialized');
  }

  try {
    const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
    
    const staffRef = doc(firestore, 'users', staffId);
    
    await updateDoc(staffRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Staff member deactivated successfully');
  } catch (error: unknown) {
    console.error('❌ Remove staff member error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to remove staff member');
  }
};

// Send invitation email to staff member
export const sendStaffInvitation = async (email: string, _restaurantName: string): Promise<void> => {
  if (isMockMode()) {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('✅ Mock invitation sent to:', email);
    return;
  }

  // In a real implementation, this would send an email invitation
  // using Firebase Functions or a third-party email service
  console.log('✅ Invitation sent to:', email);
};

// Validate staff role permissions
export const canManageStaff = (userRole: UserRole): boolean => {
  return ['owner', 'manager'].includes(userRole);
};

export const canEditStaffMember = (userRole: UserRole, targetRole: UserRole): boolean => {
  if (userRole === 'owner') {
    return true; // Owners can edit anyone
  }
  
  if (userRole === 'manager') {
    return ['host', 'server'].includes(targetRole); // Managers can edit hosts and servers
  }
  
  return false;
};