import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { Store, Table, Users, Calendar, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon: Icon = AlertCircle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoRestaurantState({ onCreateRestaurant }: { onCreateRestaurant?: () => void }) {
  return (
    <Card>
      <CardContent>
        <EmptyState
          title="No Restaurant Found"
          description="You haven't created a restaurant yet. Create your first restaurant to get started with managing reservations and tables."
          icon={Store}
          action={onCreateRestaurant ? {
            label: "Create Restaurant",
            onClick: onCreateRestaurant
          } : undefined}
        />
      </CardContent>
    </Card>
  );
}

export function NoTablesState({ onCreateTable }: { onCreateTable?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tables</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="No Tables Found"
          description="Your restaurant doesn't have any tables configured yet. Add tables to start managing seating and reservations."
          icon={Table}
          action={onCreateTable ? {
            label: "Add Table",
            onClick: onCreateTable
          } : undefined}
        />
      </CardContent>
    </Card>
  );
}

export function NoReservationsState({ onCreateReservation }: { onCreateReservation?: () => void }) {
  return (
    <Card>
      <CardContent className="p-12">
        <EmptyState
          title="No Reservations"
          description="There are no reservations for your restaurant yet. Reservations will appear here once customers start booking or you can manually add one."
          icon={Calendar}
          action={onCreateReservation ? {
            label: "Add Reservation",
            onClick: onCreateReservation
          } : undefined}
        />
      </CardContent>
    </Card>
  );
}

export function NoStaffState({ onAddStaff }: { onAddStaff?: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="No Staff Members"
          description="No staff members have been added to your restaurant yet. Add staff to manage roles and permissions."
          icon={Users}
          action={onAddStaff ? {
            label: "Add Staff",
            onClick: onAddStaff
          } : undefined}
        />
      </CardContent>
    </Card>
  );
}

export function FirebaseNotConfiguredState() {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Firebase is not configured. Please configure Firebase environment variables to use the restaurant panel.
        <br />
        <br />
        For demo purposes, you can use these credentials:
        <br />
        <strong>Owner:</strong> owner@restaurant.com / owner123
        <br />
        <strong>Manager:</strong> manager@restaurant.com / manager123
      </AlertDescription>
    </Alert>
  );
}