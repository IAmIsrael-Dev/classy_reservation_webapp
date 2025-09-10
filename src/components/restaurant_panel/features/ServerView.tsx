 
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  Clock, 
  Users, 
  DollarSign, 
  CheckCircle, 
  Utensils,
  Timer,
  User,
  MapPin,
  Bell,
  CreditCard,
  Receipt} from 'lucide-react';

interface TableOrder {
  id: string;
  tableNumber: string;
  customerName: string;
  partySize: number;
  seatedTime: string;
  status: 'seated' | 'ordered' | 'served' | 'check-requested' | 'paid';
  serverId: string;
  orderItems: OrderItem[];
  totalAmount: number;
  specialRequests?: string;
  checkoutTime?: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'ordered' | 'preparing' | 'ready' | 'served';
  specialInstructions?: string;
  category: string;
}

const MOCK_TABLES: TableOrder[] = [
  {
    id: '1',
    tableNumber: 'T5',
    customerName: 'Smith Party',
    partySize: 4,
    seatedTime: '19:15',
    status: 'ordered',
    serverId: 'server-1',
    totalAmount: 125.50,
    orderItems: [
      { id: '1', name: 'Caesar Salad', quantity: 2, price: 14, status: 'preparing', category: 'appetizer' },
      { id: '2', name: 'Grilled Salmon', quantity: 2, price: 28, status: 'ordered', category: 'main' },
      { id: '3', name: 'Pasta Primavera', quantity: 1, price: 22, status: 'ordered', category: 'main' },
      { id: '4', name: 'Wine - Chardonnay', quantity: 1, price: 35, status: 'served', category: 'beverage' }
    ]
  },
  {
    id: '2',
    tableNumber: 'T12',
    customerName: 'Johnson',
    partySize: 2,
    seatedTime: '18:45',
    status: 'served',
    serverId: 'server-1',
    totalAmount: 85.25,
    orderItems: [
      { id: '5', name: 'Appetizer Platter', quantity: 1, price: 18, status: 'served', category: 'appetizer' },
      { id: '6', name: 'Ribeye Steak', quantity: 1, price: 45, status: 'served', category: 'main' },
      { id: '7', name: 'Chicken Marsala', quantity: 1, price: 32, status: 'served', category: 'main' }
    ]
  },
  {
    id: '3',
    tableNumber: 'T8',
    customerName: 'Davis Family',
    partySize: 6,
    seatedTime: '19:30',
    status: 'check-requested',
    serverId: 'server-1',
    totalAmount: 245.75,
    orderItems: [
      { id: '8', name: 'Bruschetta', quantity: 2, price: 12, status: 'served', category: 'appetizer' },
      { id: '9', name: 'Margherita Pizza', quantity: 2, price: 18, status: 'served', category: 'main' },
      { id: '10', name: 'Lasagna', quantity: 2, price: 24, status: 'served', category: 'main' },
      { id: '11', name: 'Kids Spaghetti', quantity: 2, price: 12, status: 'served', category: 'main' }
    ]
  }
];

export function ServerView() {
  const [tables, setTables] = useState<TableOrder[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const updateTableStatus = (tableId: string, status: TableOrder['status']) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  };


  const getStatusBadge = (status: TableOrder['status']) => {
    const config = {
      seated: { color: 'bg-blue-500', label: 'Seated', icon: Users },
      ordered: { color: 'bg-yellow-500', label: 'Ordered', icon: Utensils },
      served: { color: 'bg-green-500', label: 'Served', icon: CheckCircle },
      'check-requested': { color: 'bg-orange-500', label: 'Check Requested', icon: Receipt },
      paid: { color: 'bg-purple-500', label: 'Paid', icon: CreditCard }
    };
    
    const conf = config[status];
    const Icon = conf.icon;
    
    return (
      <Badge variant="secondary" className={`text-white ${conf.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {conf.label}
      </Badge>
    );
  };

  const getItemStatusBadge = (status: OrderItem['status']) => {
    const config = {
      ordered: { color: 'bg-blue-500', label: 'Ordered' },
      preparing: { color: 'bg-yellow-500', label: 'Preparing' },
      ready: { color: 'bg-green-500', label: 'Ready' },
      served: { color: 'bg-purple-500', label: 'Served' }
    };
    
    const conf = config[status];
    
    return (
      <Badge variant="secondary" className={`text-white ${conf.color} text-xs`}>
        {conf.label}
      </Badge>
    );
  };

  const getTableDuration = (seatedTime: string) => {
    const seated = new Date();
    const [hours, minutes] = seatedTime.split(':').map(Number);
    seated.setHours(hours, minutes, 0, 0);
    
    const diff = Math.floor((currentTime.getTime() - seated.getTime()) / (1000 * 60));
    const hours_diff = Math.floor(diff / 60);
    const minutes_diff = diff % 60;
    
    if (hours_diff > 0) {
      return `${hours_diff}h ${minutes_diff}m`;
    }
    return `${minutes_diff}m`;
  };

  const selectedTableData = selectedTable ? tables.find(t => t.id === selectedTable) : null;

  // Calculate stats
  const activeOrdersCount = tables.filter(t => t.status === 'ordered').length;
  const checkRequestsCount = tables.filter(t => t.status === 'check-requested').length;
  const totalSales = tables.reduce((sum, t) => sum + (t.status === 'paid' ? t.totalAmount : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Server View</h1>
          <p className="text-muted-foreground">Manage your assigned tables and orders</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Tables</p>
                <p className="text-2xl font-medium">{tables.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-medium">{activeOrdersCount}</p>
              </div>
              <Utensils className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Check Requests</p>
                <p className="text-2xl font-medium">{checkRequestsCount}</p>
              </div>
              <Receipt className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Sales</p>
                <p className="text-2xl font-medium">${totalSales.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-medium">Your Tables</h2>
          
          {tables.map((table) => (
            <Card 
              key={table.id} 
              className={`cursor-pointer transition-all ${
                selectedTable === table.id ? 'ring-2 ring-primary' : ''
              } ${
                table.status === 'check-requested' ? 'border-orange-500' : ''
              }`}
              onClick={() => setSelectedTable(table.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{table.tableNumber} - {table.customerName}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {table.partySize} guests
                        </div>
                        <div className="flex items-center gap-1">
                          <Timer className="w-4 h-4" />
                          {getTableDuration(table.seatedTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(table.status)}
                    {table.status === 'check-requested' && (
                      <Bell className="w-4 h-4 text-orange-500 animate-pulse" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {table.orderItems.length} items • ${table.totalAmount.toFixed(2)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {table.status === 'seated' && (
                      <Button size="sm">Take Order</Button>
                    )}
                    {table.status === 'ordered' && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, 'served');
                        }}
                      >
                        Mark Served
                      </Button>
                    )}
                    {table.status === 'check-requested' && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(table.id, 'paid');
                        }}
                      >
                        Process Payment
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Table Details</h2>
          
          {selectedTableData ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedTableData.tableNumber} - {selectedTableData.customerName}</span>
                  {getStatusBadge(selectedTableData.status)}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Party Size:</span>
                    <div className="font-medium">{selectedTableData.partySize} guests</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Seated:</span>
                    <div className="font-medium">{selectedTableData.seatedTime}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">{getTableDuration(selectedTableData.seatedTime)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium">${selectedTableData.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedTableData.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Qty: {item.quantity} • ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          {item.specialInstructions && (
                            <div className="text-xs text-blue-600 mt-1">
                              Note: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                        <div className="ml-2">
                          {getItemStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTableData.specialRequests && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Special Requests</h4>
                      <p className="text-sm text-muted-foreground">{selectedTableData.specialRequests}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2">
                  {selectedTableData.status === 'seated' && (
                    <Button className="w-full">
                      <Utensils className="w-4 h-4 mr-2" />
                      Take Order
                    </Button>
                  )}
                  
                  {selectedTableData.status === 'ordered' && (
                    <Button 
                      className="w-full"
                      onClick={() => updateTableStatus(selectedTableData.id, 'served')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Served
                    </Button>
                  )}
                  
                  {selectedTableData.status === 'served' && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => updateTableStatus(selectedTableData.id, 'check-requested')}
                    >
                      <Receipt className="w-4 h-4 mr-2" />
                      Request Check
                    </Button>
                  )}
                  
                  {selectedTableData.status === 'check-requested' && (
                    <Button 
                      className="w-full"
                      onClick={() => updateTableStatus(selectedTableData.id, 'paid')}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Payment
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">Select a Table</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a table to view details and manage orders
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}