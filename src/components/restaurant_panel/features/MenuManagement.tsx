 
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Search,
  Menu,
  DollarSign,
  Clock,
  Star,
  ChefHat,
  Leaf,
  Flame,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  dietary: string[];
  preparationTime: number;
  isAvailable: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  image?: string;
  calories?: number;
  spicyLevel?: 0 | 1 | 2 | 3;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

const MOCK_CATEGORIES: MenuCategory[] = [
  { id: '1', name: 'Appetizers', description: 'Start your meal right', sortOrder: 1, isActive: true },
  { id: '2', name: 'Salads', description: 'Fresh and healthy options', sortOrder: 2, isActive: true },
  { id: '3', name: 'Mains', description: 'Our signature dishes', sortOrder: 3, isActive: true },
  { id: '4', name: 'Pasta', description: 'Homemade pasta dishes', sortOrder: 4, isActive: true },
  { id: '5', name: 'Desserts', description: 'Sweet endings', sortOrder: 5, isActive: true },
  { id: '6', name: 'Beverages', description: 'Drinks and cocktails', sortOrder: 6, isActive: true },
];

const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Arancini',
    description: 'Crispy risotto balls stuffed with truffle and parmesan, served with marinara sauce',
    price: 16,
    category: 'Appetizers',
    ingredients: ['Arborio rice', 'Truffle oil', 'Parmesan', 'Breadcrumbs'],
    allergens: ['Gluten', 'Dairy'],
    dietary: ['Vegetarian'],
    preparationTime: 15,
    isAvailable: true,
    isPopular: true,
    isFeatured: false,
    calories: 380,
    spicyLevel: 0
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with house-made caesar dressing, croutons, and parmesan',
    price: 14,
    category: 'Salads',
    ingredients: ['Romaine lettuce', 'Caesar dressing', 'Croutons', 'Parmesan'],
    allergens: ['Gluten', 'Dairy', 'Anchovies'],
    dietary: ['Vegetarian'],
    preparationTime: 10,
    isAvailable: true,
    isPopular: false,
    isFeatured: true,
    calories: 290,
    spicyLevel: 0
  },
  {
    id: '3',
    name: 'Osso Buco',
    description: 'Braised veal shanks with risotto milanese and gremolata',
    price: 32,
    category: 'Mains',
    ingredients: ['Veal shanks', 'Arborio rice', 'Saffron', 'Gremolata'],
    allergens: ['Dairy'],
    dietary: [],
    preparationTime: 45,
    isAvailable: false,
    isPopular: true,
    isFeatured: true,
    calories: 580,
    spicyLevel: 0
  },
  {
    id: '4',
    name: 'Spicy Arrabiata',
    description: 'Penne pasta in a spicy tomato sauce with garlic, chili, and fresh basil',
    price: 18,
    category: 'Pasta',
    ingredients: ['Penne pasta', 'Tomatoes', 'Garlic', 'Chili', 'Basil'],
    allergens: ['Gluten'],
    dietary: ['Vegan'],
    preparationTime: 20,
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    calories: 420,
    spicyLevel: 3
  },
  {
    id: '5',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
    price: 12,
    category: 'Desserts',
    ingredients: ['Ladyfingers', 'Mascarpone', 'Coffee', 'Cocoa powder'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    dietary: ['Vegetarian'],
    preparationTime: 5,
    isAvailable: true,
    isPopular: true,
    isFeatured: false,
    calories: 320,
    spicyLevel: 0
  }
];

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Keto', 'Low-Carb'];
const ALLERGEN_OPTIONS = ['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Shellfish', 'Fish', 'Soy', 'Anchovies'];

export function MenuManagement() {
  const [categories] = useState<MenuCategory[]>(MOCK_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Appetizers',
    ingredients: [],
    allergens: [],
    dietary: [],
    preparationTime: 15,
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    spicyLevel: 0
  });

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSaveItem = () => {
    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...editingItem, ...newItem } : item
      ));
      setEditingItem(null);
    } else {
      const item: MenuItem = {
        id: Date.now().toString(),
        name: newItem.name || '',
        description: newItem.description || '',
        price: newItem.price || 0,
        category: newItem.category || 'Appetizers',
        ingredients: newItem.ingredients || [],
        allergens: newItem.allergens || [],
        dietary: newItem.dietary || [],
        preparationTime: newItem.preparationTime || 15,
        isAvailable: newItem.isAvailable !== false,
        isPopular: newItem.isPopular || false,
        isFeatured: newItem.isFeatured || false,
        spicyLevel: newItem.spicyLevel || 0
      };
      setMenuItems(prev => [...prev, item]);
    }
    
    setNewItem({
      name: '',
      description: '',
      price: 0,
      category: 'Appetizers',
      ingredients: [],
      allergens: [],
      dietary: [],
      preparationTime: 15,
      isAvailable: true,
      isPopular: false,
      isFeatured: false,
      spicyLevel: 0
    });
    setShowItemForm(false);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem(item);
    setShowItemForm(true);
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const duplicateItem = (item: MenuItem) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (Copy)`
    };
    setMenuItems(prev => [...prev, newItem]);
  };

  const getSpicyLevelIcon = (level: number) => {
    const icons = [];
    for (let i = 0; i < 3; i++) {
      icons.push(
        <Flame 
          key={i} 
          className={`w-3 h-3 ${i < level ? 'text-red-500' : 'text-gray-300'}`} 
        />
      );
    }
    return icons;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant's menu items and categories</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import Menu
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Menu
          </Button>
          <Button onClick={() => setShowItemForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Total Items: {menuItems.length}</span>
                  <span>Available: {menuItems.filter(i => i.isAvailable).length}</span>
                  <span>Popular: {menuItems.filter(i => i.isPopular).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className={`${!item.isAvailable ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <div className="flex items-center gap-1">
                          {item.isPopular && (
                            <Badge variant="secondary" className="text-yellow-600 bg-yellow-100">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                          {item.isFeatured && (
                            <Badge variant="secondary" className="text-blue-600 bg-blue-100">
                              <ChefHat className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-primary">${item.price}</span>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Details */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{item.preparationTime} min</span>
                      </div>
                      {item.calories && (
                        <div className="flex items-center gap-1">
                          <span>{item.calories} cal</span>
                        </div>
                      )}
                      {item.spicyLevel && item.spicyLevel > 0 && (
                        <div className="flex items-center gap-1">
                          {getSpicyLevelIcon(item.spicyLevel)}
                        </div>
                      )}
                    </div>

                    {/* Dietary and Allergens */}
                    <div className="space-y-2">
                      {item.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.dietary.map((diet) => (
                            <Badge key={diet} variant="outline" className="text-xs text-green-600 border-green-200">
                              <Leaf className="w-3 h-3 mr-1" />
                              {diet}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.slice(0, 3).map((allergen) => (
                            <Badge key={allergen} variant="outline" className="text-xs text-red-600 border-red-200">
                              {allergen}
                            </Badge>
                          ))}
                          {item.allergens.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.allergens.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => toggleItemAvailability(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          {item.isAvailable ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => duplicateItem(item)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleEditItem(item)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteItem(item.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit Item Form */}
          {showItemForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Item Name</Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Truffle Arancini"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Crispy risotto balls stuffed with truffle..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newItem.price}
                          onChange={(e) => setNewItem(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="prep-time">Prep Time (min)</Label>
                        <Input
                          id="prep-time"
                          type="number"
                          value={newItem.preparationTime}
                          onChange={(e) => setNewItem(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 15 }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="calories">Calories (optional)</Label>
                        <Input
                          id="calories"
                          type="number"
                          value={newItem.calories || ''}
                          onChange={(e) => setNewItem(prev => ({ ...prev, calories: parseInt(e.target.value) || undefined }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Dietary Options</Label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map((option) => (
                          <Badge
                            key={option}
                            variant={newItem.dietary?.includes(option) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = newItem.dietary || [];
                              const updated = current.includes(option)
                                ? current.filter(d => d !== option)
                                : [...current, option];
                              setNewItem(prev => ({ ...prev, dietary: updated }));
                            }}
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Allergens</Label>
                      <div className="flex flex-wrap gap-2">
                        {ALLERGEN_OPTIONS.map((allergen) => (
                          <Badge
                            key={allergen}
                            variant={newItem.allergens?.includes(allergen) ? "destructive" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = newItem.allergens || [];
                              const updated = current.includes(allergen)
                                ? current.filter(a => a !== allergen)
                                : [...current, allergen];
                              setNewItem(prev => ({ ...prev, allergens: updated }));
                            }}
                          >
                            {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Spicy Level</Label>
                      <div className="flex items-center gap-2">
                        {[0, 1, 2, 3].map((level) => (
                          <Button
                            key={level}
                            variant={newItem.spicyLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setNewItem(prev => ({ ...prev, spicyLevel: level as 0 | 1 | 2 | 3 }))}
                          >
                            {level === 0 ? 'None' : getSpicyLevelIcon(level)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="available"
                          checked={newItem.isAvailable !== false}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isAvailable: e.target.checked }))}
                        />
                        <Label htmlFor="available">Available</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="popular"
                          checked={newItem.isPopular || false}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isPopular: e.target.checked }))}
                        />
                        <Label htmlFor="popular">Popular Item</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={newItem.isFeatured || false}
                          onChange={(e) => setNewItem(prev => ({ ...prev, isFeatured: e.target.checked }))}
                        />
                        <Label htmlFor="featured">Featured Item</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    onClick={() => {
                      setShowItemForm(false);
                      setEditingItem(null);
                      setNewItem({
                        name: '',
                        description: '',
                        price: 0,
                        category: 'Appetizers',
                        ingredients: [],
                        allergens: [],
                        dietary: [],
                        preparationTime: 15,
                        isAvailable: true,
                        isPopular: false,
                        isFeatured: false,
                        spicyLevel: 0
                      });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveItem}>
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {menuItems.filter(item => item.category === category.name).length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-medium">{menuItems.length}</p>
                  </div>
                  <Menu className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Items</p>
                    <p className="text-2xl font-medium">{menuItems.filter(i => i.isAvailable).length}</p>
                  </div>
                  <Eye className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Popular Items</p>
                    <p className="text-2xl font-medium">{menuItems.filter(i => i.isPopular).length}</p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Price</p>
                    <p className="text-2xl font-medium">
                      ${(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}