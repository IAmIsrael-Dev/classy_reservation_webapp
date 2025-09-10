/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Settings, 
  Building, 
  Users, 
  Upload, 
  UserPlus,
  Trash2,
  Edit,
  Check,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
  Clock
} from 'lucide-react';
import type { User, UserRole } from '../types/user';
import type { Restaurant } from '../types/restaurant';
import { updateRestaurant } from '../services/restaurant';
import { uploadImage } from '../services/storage';
import { 
  getRestaurantStaff, 
  addStaffMember, 
  removeStaffMember,
} from '../services/staff';
import type { StaffMember} from '../services/staff';

// Minimal restaurant interface for what this component actually needs
interface RestaurantSettingsRestaurant {
  id?: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  priceRange: string;
  // Optional properties that might exist but aren't required for editing
  imageUrl?: string;
  imageUrls?: string[];
  rating?: number;
  reviewCount?: number;
  distance?: string;
  waitTime?: string;
  isOpen?: boolean;
  isFavorite?: boolean;
  hasDeals?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  amenities?: string[];
  hours?: Record<string, string>;
  latitude?: number;
  longitude?: number;
  specialOffers?: string[];
  menuHighlights?: Record<string, any>;
  ownerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RestaurantSettingsProps {
  restaurant: RestaurantSettingsRestaurant;
  currentUser: User;
  onRestaurantUpdate: (updatedRestaurant: Restaurant) => void;
  onClose: () => void;
}

interface RestaurantFormData {
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  priceRange: string;
}

interface OperatingHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

export const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({
  restaurant,
  onRestaurantUpdate,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Restaurant form data
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: restaurant.name || '',
    description: restaurant.description || '',
    cuisine: restaurant.cuisine || '',
    address: restaurant.address || '',
    phone: restaurant.phone || '',
    email: restaurant.email || '',
    website: restaurant.website || '',
    priceRange: restaurant.priceRange || '$'
  });

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Staff management state
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [newStaffMember, setNewStaffMember] = useState({
    name: '',
    email: '',
    role: 'server' as UserRole,
    phoneNumber: ''
  });
  const [, setEditingStaff] = useState<string | null>(null);

  // Operating hours state
  const [operatingHours, setOperatingHours] = useState<OperatingHours>({
    Monday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    Tuesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    Wednesday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    Thursday: { isOpen: true, openTime: '09:00', closeTime: '22:00' },
    Friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    Saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
    Sunday: { isOpen: true, openTime: '10:00', closeTime: '21:00' }
  });

  // Load staff members on component mount
  useEffect(() => {
    const loadStaffMembers = async () => {
      if (restaurant.id) {
        try {
          const staff = await getRestaurantStaff(restaurant.id);
          setStaffMembers(staff);
        } catch (error) {
          console.error('Error loading staff members:', error);
        }
      }
    };
    loadStaffMembers();
  }, [restaurant.id]);

  const handleInputChange = (field: keyof RestaurantFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveRestaurant = async () => {
    if (!restaurant.id) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let imageUrl = restaurant.imageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, `restaurants/${restaurant.id}`);
      }

      const updatedData = {
        ...formData,
        imageUrl,
        hours: Object.fromEntries(
          Object.entries(operatingHours).map(([day, hours]) => [
            day, 
            hours.isOpen ? `${hours.openTime} - ${hours.closeTime}` : 'Closed'
          ])
        )
      };

      const updatedRestaurant = await updateRestaurant(restaurant.id, updatedData);
      onRestaurantUpdate(updatedRestaurant);
      setSuccess('Restaurant information updated successfully!');
    } catch (error) {
      console.error('Error updating restaurant:', error);
      setError('Failed to update restaurant information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStaffMember = async () => {
    if (!restaurant.id || !newStaffMember.name || !newStaffMember.email) return;

    setIsLoading(true);
    try {
      const staffData = {
        name: newStaffMember.name,
        email: newStaffMember.email,
        role: newStaffMember.role,
        phoneNumber: newStaffMember.phoneNumber || undefined
      };

      const newStaff = await addStaffMember(restaurant.id, staffData);
      setStaffMembers(prev => [...prev, newStaff]);
      setNewStaffMember({
        name: '',
        email: '',
        role: 'server' as UserRole,
        phoneNumber: ''
      });
      setSuccess('Staff member added successfully!');
    } catch (error) {
      console.error('Error adding staff member:', error);
      setError('Failed to add staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStaffMember = async (staffId: string) => {
    if (!restaurant.id) return;

    setIsLoading(true);
    try {
      await removeStaffMember(restaurant.id, staffId);
      setStaffMembers(prev => prev.filter(staff => staff.id !== staffId));
      setSuccess('Staff member removed successfully!');
    } catch (error) {
      console.error('Error removing staff member:', error);
      setError('Failed to remove staff member. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOperatingHoursChange = (day: string, field: string, value: string | boolean) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Restaurant Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveRestaurant} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="m-6 border-destructive bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="m-6 border-green-500 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Restaurant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Restaurant Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter restaurant name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuisine">Cuisine Type</Label>
                      <Input
                        id="cuisine"
                        value={formData.cuisine}
                        onChange={(e) => handleInputChange('cuisine', e.target.value)}
                        placeholder="e.g., Italian, Mexican, American"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your restaurant"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceRange">Price Range</Label>
                    <Select value={formData.priceRange} onValueChange={(value) => handleInputChange('priceRange', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ - Budget friendly</SelectItem>
                        <SelectItem value="$$">$$ - Moderate</SelectItem>
                        <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                        <SelectItem value="$$$$">$$$$ - Fine dining</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="contact@restaurant.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="123 Main Street, City, State, ZIP"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website (Optional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.yourrestaurant.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restaurant Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image">Upload New Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                  </div>
                  {(imagePreview || restaurant.imageUrl) && (
                    <div className="mt-4">
                      <img
                        src={imagePreview || restaurant.imageUrl}
                        alt="Restaurant"
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(operatingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="w-20 font-medium">{day}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hours.isOpen}
                          onChange={(e) => handleOperatingHoursChange(day, 'isOpen', e.target.checked)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-muted-foreground">Open</span>
                      </div>
                    </div>
                    {hours.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.openTime}
                          onChange={(e) => handleOperatingHoursChange(day, 'openTime', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hours.closeTime}
                          onChange={(e) => handleOperatingHoursChange(day, 'closeTime', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add Staff Member
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="staffName">Name</Label>
                    <Input
                      id="staffName"
                      value={newStaffMember.name}
                      onChange={(e) => setNewStaffMember(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter staff member name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffEmail">Email</Label>
                    <Input
                      id="staffEmail"
                      type="email"
                      value={newStaffMember.email}
                      onChange={(e) => setNewStaffMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="staffRole">Role</Label>
                    <Select 
                      value={newStaffMember.role} 
                      onValueChange={(value: UserRole) => setNewStaffMember(prev => ({ ...prev, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="server">Server</SelectItem>
                        <SelectItem value="host">Host</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="chef">Chef</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="staffPhone">Phone (Optional)</Label>
                    <Input
                      id="staffPhone"
                      value={newStaffMember.phoneNumber}
                      onChange={(e) => setNewStaffMember(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <Button onClick={handleAddStaffMember} disabled={isLoading} className="w-full">
                    Add Staff Member
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Current Staff ({staffMembers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {staffMembers.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No staff members added yet.</p>
                    ) : (
                      staffMembers.map((staff) => (
                        <div key={staff.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium">{staff.name}</p>
                            <p className="text-sm text-muted-foreground">{staff.email}</p>
                            <Badge variant="secondary" className="text-xs">
                              {staff.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingStaff(staff.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveStaffMember(staff.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Advanced settings and integrations will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};