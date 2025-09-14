
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Users,
  Plus,
  MapPin,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { TABLE_STATUSES } from '../types/table';
import type { Table, TableStatus } from '../types/table';
import { 
  createTable, 
  updateTableStatus, 
  clearTable, 
  setTableCleaning,
  getTableSummary
} from '../services/table';

interface TablesListProps {
  restaurantId: string;
  tables: Table[];
  onTablesUpdate: (tables: Table[]) => void;
}

export const TablesList: React.FC<TablesListProps> = ({
  restaurantId,
  tables,
  onTablesUpdate
}) => {
  const [filteredTables, setFilteredTables] = useState<Table[]>(tables);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 2, location: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tableSummary, setTableSummary] = useState<any>(null);

  // Load table summary
  useEffect(() => {
    const loadSummary = async () => {
      try {
        const summary = await getTableSummary(restaurantId);
        setTableSummary(summary);
      } catch (error) {
        console.error('Failed to load table summary:', error);
      }
    };

    if (restaurantId) {
      loadSummary();
    }
  }, [restaurantId, tables]);

  // Update filtered tables when props change or filters change
  useEffect(() => {
    let filtered = [...tables];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(table =>
        table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(table => table.status === statusFilter);
    }

    // Sort by table number
    filtered.sort((a, b) => {
      const aNum = parseInt(a.tableNumber) || 0;
      const bNum = parseInt(b.tableNumber) || 0;
      return aNum - bNum;
    });

    setFilteredTables(filtered);
  }, [tables, searchQuery, statusFilter]);

  const handleStatusUpdate = async (tableId: string, newStatus: TableStatus) => {
    setIsLoading(true);
    setError('');

    try {
      let updatedTable: Table;

      if (newStatus === 'available') {
        updatedTable = await clearTable(tableId);
      } else if (newStatus === 'cleaning') {
        updatedTable = await setTableCleaning(tableId);
      } else {
        updatedTable = await updateTableStatus(tableId, newStatus);
      }

      // Update the tables list
      const updatedTables = tables.map(t =>
        t.id === tableId ? updatedTable : t
      );
      onTablesUpdate(updatedTables);
    } catch (error: any) {
      console.error('Failed to update table:', error);
      setError(error.message || 'Failed to update table');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const table = await createTable(restaurantId, newTable);
      onTablesUpdate([...tables, table]);
      setNewTable({ tableNumber: '', capacity: 2, location: '' });
      setShowAddTable(false);
    } catch (error: any) {
      console.error('Failed to create table:', error);
      setError(error.message || 'Failed to create table');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: TableStatus) => {
    const config = TABLE_STATUSES[status];
    return (
      <Badge className={`${config.color} ${config.bgColor}`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getActionButtons = (table: Table) => {
    const buttons = [];

    if (table.status === 'occupied' || table.status === 'reserved') {
      buttons.push(
        <Button
          key="clear"
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(table.id!, 'available')}
          disabled={isLoading}
        >
          Clear Table
        </Button>
      );
    }

    if (table.status === 'available') {
      buttons.push(
        <Button
          key="cleaning"
          size="sm"
          variant="outline"
          onClick={() => handleStatusUpdate(table.id!, 'cleaning')}
          disabled={isLoading}
        >
          Set Cleaning
        </Button>
      );
    }

    if (table.status === 'cleaning') {
      buttons.push(
        <Button
          key="available"
          size="sm"
          onClick={() => handleStatusUpdate(table.id!, 'available')}
          disabled={isLoading}
        >
          Mark Available
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tables</p>
                <p className="text-2xl font-semibold">{tableSummary?.total || tables.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-semibold">{tableSummary?.available || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-semibold">{tableSummary?.occupied || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-semibold">{tableSummary?.utilizationRate || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h3 className="text-xl font-semibold">Table Management</h3>
          <p className="text-muted-foreground">
            {filteredTables.length} of {tables.length} tables
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TableStatus | 'all')}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(TABLE_STATUSES).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => setShowAddTable(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Add Table Form */}
      {showAddTable && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Table</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Table Number</label>
                  <Input
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable(prev => ({ ...prev, tableNumber: e.target.value }))}
                    placeholder="e.g., 1, A1, Patio-3"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={newTable.capacity}
                    onChange={(e) => setNewTable(prev => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location (Optional)</label>
                  <Input
                    value={newTable.location}
                    onChange={(e) => setNewTable(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Main Dining, Patio, Bar"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !newTable.tableNumber}>
                  {isLoading ? 'Adding...' : 'Add Table'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddTable(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tables Grid */}
      {filteredTables.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No Tables Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Add your first table to get started.'}
            </p>
            {tables.length === 0 && (
              <Button onClick={() => setShowAddTable(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Table
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Table Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">Table {table.tableNumber}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} seats</span>
                      </div>
                    </div>
                    {getStatusBadge(table.status)}
                  </div>

                  {/* Table Details */}
                  {table.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{table.location}</span>
                    </div>
                  )}

                  {table.estimatedTurnTime && table.status === 'occupied' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>
                        Est. available: {new Intl.DateTimeFormat('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }).format(new Date(table.estimatedTurnTime))}
                      </span>
                    </div>
                  )}

                  {table.currentReservationId && (
                    <div className="text-sm text-muted-foreground">
                      Reservation: {table.currentReservationId.slice(-6)}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    {getActionButtons(table)}
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

// Export the main component
export const RestaurantNavbar: React.FC<{ onLogout: () => void; onBackToDashboard: () => void }> = ({ 
  onLogout, 
  onBackToDashboard 
}) => {
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Restaurant Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBackToDashboard}>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};