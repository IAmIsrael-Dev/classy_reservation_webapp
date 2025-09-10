 
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt,
  Search,
  Clock,
  CheckCircle,
  Utensils,
  Coffee,
  Wine
} from 'lucide-react';

interface POSItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  available: boolean;
  image?: string;
}

interface CartItem extends POSItem {
  quantity: number;
  specialInstructions?: string;
}

interface Order {
  id: string;
  tableNumber?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  status: 'draft' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid';
  orderTime: string;
  paymentMethod?: 'cash' | 'card' | 'split';
}

const MENU_ITEMS: POSItem[] = [
  // Appetizers
  { id: '1', name: 'Truffle Arancini', price: 16, category: 'appetizers', available: true, description: 'Crispy risotto balls with truffle oil' },
  { id: '2', name: 'Burrata Caprese', price: 18, category: 'appetizers', available: true, description: 'Fresh burrata with tomatoes and basil' },
  { id: '3', name: 'Calamari Fritti', price: 14, category: 'appetizers', available: true, description: 'Crispy fried calamari with marinara' },
  
  // Mains
  { id: '4', name: 'Grilled Salmon', price: 28, category: 'mains', available: true, description: 'Atlantic salmon with lemon herb butter' },
  { id: '5', name: 'Ribeye Steak', price: 45, category: 'mains', available: true, description: '12oz ribeye with garlic mashed potatoes' },
  { id: '6', name: 'Pasta Carbonara', price: 22, category: 'mains', available: true, description: 'Classic carbonara with pancetta and egg' },
  { id: '7', name: 'Osso Buco', price: 32, category: 'mains', available: false, description: 'Braised veal shank with risotto' },
  
  // Desserts
  { id: '8', name: 'Tiramisu', price: 12, category: 'desserts', available: true, description: 'Classic Italian tiramisu' },
  { id: '9', name: 'Chocolate Soufflé', price: 14, category: 'desserts', available: true, description: 'Dark chocolate soufflé with vanilla ice cream' },
  
  // Beverages
  { id: '10', name: 'House Wine - Red', price: 35, category: 'beverages', available: true, description: 'Full bottle of house red wine' },
  { id: '11', name: 'Craft Beer', price: 8, category: 'beverages', available: true, description: 'Local craft beer selection' },
  { id: '12', name: 'Espresso', price: 4, category: 'beverages', available: true, description: 'Double espresso shot' }
];

const CATEGORIES = [
  { id: 'all', name: 'All Items', icon: Utensils },
  { id: 'appetizers', name: 'Appetizers', icon: Utensils },
  { id: 'mains', name: 'Main Courses', icon: Utensils },
  { id: 'desserts', name: 'Desserts', icon: Coffee },
  { id: 'beverages', name: 'Beverages', icon: Wine }
];

export function OrdersPOS() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [, setCurrentOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const addToCart = (item: POSItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTable('');
    setCustomerName('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.08; // 8% tax rate
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const createOrder = () => {
    if (cart.length === 0) return;

    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const total = subtotal + tax;

    const order: Order = {
      id: Date.now().toString(),
      tableNumber: selectedTable || undefined,
      customerName: customerName || undefined,
      items: [...cart],
      subtotal,
      tax,
      tip: 0,
      total,
      status: 'confirmed',
      orderTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setOrders(prev => [order, ...prev]);
    setCurrentOrder(order);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status } : order
    ));
  };

  const getStatusBadge = (status: Order['status']) => {
    const config = {
      draft: { color: 'bg-gray-500', label: 'Draft' },
      confirmed: { color: 'bg-blue-500', label: 'Confirmed' },
      preparing: { color: 'bg-yellow-500', label: 'Preparing' },
      ready: { color: 'bg-green-500', label: 'Ready' },
      served: { color: 'bg-purple-500', label: 'Served' },
      paid: { color: 'bg-emerald-500', label: 'Paid' }
    };
    
    const conf = config[status];
    
    return (
      <Badge variant="secondary" className={`text-white ${conf.color}`}>
        {conf.label}
      </Badge>
    );
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = CATEGORIES.find(cat => cat.id === categoryId);
    const Icon = category?.icon || Utensils;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Orders & POS</h1>
          <p className="text-muted-foreground">Point of sale and order management system</p>
        </div>
      </div>

      <Tabs defaultValue="pos" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pos">Point of Sale</TabsTrigger>
          <TabsTrigger value="orders">Active Orders</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>

        <TabsContent value="pos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Search and Category Filter */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Buttons */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {getCategoryIcon(category.id)}
                    <span className="ml-2">{category.name}</span>
                  </Button>
                ))}
              </div>

              {/* Menu Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{item.name}</h4>
                          <span className="text-lg font-medium text-primary">${item.price}</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <Button 
                          onClick={() => addToCart(item)}
                          size="sm" 
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Current Order</span>
                    <ShoppingCart className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Table number (optional)"
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                    />
                    <Input
                      placeholder="Customer name (optional)"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>

                  <Separator />

                  {/* Cart Items */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Cart is empty</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              ${item.price} each
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <>
                      <Separator />

                      {/* Order Summary */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${calculateSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (8%):</span>
                          <span>${calculateTax(calculateSubtotal()).toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium">
                          <span>Total:</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          onClick={createOrder}
                          className="w-full"
                        >
                          <Receipt className="w-4 h-4 mr-2" />
                          Send Order
                        </Button>
                        <Button 
                          onClick={clearCart}
                          variant="outline"
                          className="w-full"
                        >
                          Clear Cart
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.filter(order => !['paid', 'served'].includes(order.status)).map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-4)}
                    </CardTitle>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.tableNumber && `Table ${order.tableNumber} • `}
                    {order.customerName && `${order.customerName} • `}
                    {order.orderTime}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1"
                      >
                        Start Prep
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1"
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Served
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {orders.filter(order => !['paid', 'served'].includes(order.status)).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Active Orders</h3>
                <p className="text-sm text-muted-foreground">
                  New orders will appear here when they're placed
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            {orders.filter(order => ['paid', 'served'].includes(order.status)).map((order) => (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Order #{order.id.slice(-4)}</h4>
                      <div className="text-sm text-muted-foreground">
                        {order.tableNumber && `Table ${order.tableNumber} • `}
                        {order.customerName && `${order.customerName} • `}
                        {order.orderTime} • {order.items.length} items
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <div className="text-sm font-medium mt-1">${order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {orders.filter(order => ['paid', 'served'].includes(order.status)).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="font-medium mb-2">No Order History</h3>
                <p className="text-sm text-muted-foreground">
                  Completed orders will appear here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}