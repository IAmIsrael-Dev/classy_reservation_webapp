/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState} from 'react';
import type { ReactNode } from 'react';
import type { UserRole } from '../types/user';

interface RoleContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  permissions: {
    canViewAnalytics: boolean;
    canManageStaff: boolean;
    canManageMenu: boolean;
    canManageReservations: boolean;
    canAccessPOS: boolean;
    canManageFloorPlan: boolean;
    canViewBilling: boolean;
    canManageSettings: boolean;
  };
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

const getPermissions = (role: UserRole) => {
  switch (role) {
    case 'owner':
      return {
        canViewAnalytics: true,
        canManageStaff: true,
        canManageMenu: true,
        canManageReservations: true,
        canAccessPOS: true,
        canManageFloorPlan: true,
        canViewBilling: true,
        canManageSettings: true,
      };
    case 'manager':
      return {
        canViewAnalytics: true,
        canManageStaff: true,
        canManageMenu: true,
        canManageReservations: true,
        canAccessPOS: true,
        canManageFloorPlan: true,
        canViewBilling: false,
        canManageSettings: false,
      };
    case 'host':
      return {
        canViewAnalytics: false,
        canManageStaff: false,
        canManageMenu: false,
        canManageReservations: true,
        canAccessPOS: false,
        canManageFloorPlan: true,
        canViewBilling: false,
        canManageSettings: false,
      };
    case 'server':
      return {
        canViewAnalytics: false,
        canManageStaff: false,
        canManageMenu: false,
        canManageReservations: false,
        canAccessPOS: true,
        canManageFloorPlan: false,
        canViewBilling: false,
        canManageSettings: false,
      };
    default:
      return {
        canViewAnalytics: false,
        canManageStaff: false,
        canManageMenu: false,
        canManageReservations: false,
        canAccessPOS: false,
        canManageFloorPlan: false,
        canViewBilling: false,
        canManageSettings: false,
      };
  }
};

interface RoleProviderProps {
  children: ReactNode;
  initialRole?: UserRole;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children, initialRole = 'owner' }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const permissions = getPermissions(currentRole);

  const value: RoleContextType = {
    currentRole,
    setCurrentRole,
    permissions,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};