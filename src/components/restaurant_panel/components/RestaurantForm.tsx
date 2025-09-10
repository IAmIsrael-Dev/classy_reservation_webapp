
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { X, Upload } from 'lucide-react';
import {
  CUISINE_TYPES,
  PRICE_RANGES,
  AMENITIES
} from '../types/restaurant';
import type {
  Restaurant,
  RestaurantFormData
} from '../types/restaurant';
import { createRestaurant } from '../services/restaurant';
import { uploadMultipleRestaurantImages, validateImageFile } from '../services/storage';

interface RestaurantFormProps {
  restaurant?: Restaurant;
  onClose: () => void;
  onSuccess: (restaurant: Restaurant) => void;
  userId: string;
}

export const RestaurantForm: React.FC<RestaurantFormProps> = ({
  restaurant,
  onClose,
  onSuccess,
  userId
}) => {
  const defaultHours: RestaurantFormData['hours'] = {
    Monday: '9:00 AM - 10:00 PM',
    Tuesday: '9:00 AM - 10:00 PM',
    Wednesday: '9:00 AM - 10:00 PM',
    Thursday: '9:00 AM - 10:00 PM',
    Friday: '9:00 AM - 11:00 PM',
    Saturday: '9:00 AM - 11:00 PM',
    Sunday: '9:00 AM - 9:00 PM'
  };

  const [formData, setFormData] = useState<RestaurantFormData>({
    name: restaurant?.name ?? '',
    description: restaurant?.description ?? '',
    cuisine: restaurant?.cuisine ?? '',
    priceRange: restaurant?.priceRange ?? '$',
    address: restaurant?.address ?? '',
    phone: restaurant?.phone ?? '',
    email: restaurant?.email ?? '',
    website: restaurant?.website ?? '',
    waitTime: restaurant?.waitTime ?? '15-25 minutes',
    isOpen: restaurant?.isOpen ?? true,
    amenities: restaurant?.amenities ?? [],
    hours: restaurant?.hours ?? defaultHours,
    latitude: restaurant?.latitude ?? 0,
    longitude: restaurant?.longitude ?? 0,
    specialOffers: restaurant?.specialOffers ?? [],
    menuHighlights: restaurant?.menuHighlights ?? {},
    imageUrls: restaurant?.imageUrls ?? []
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [, setUploadProgress] = useState<Record<string, number>>({});

  // Generic, strongly-typed handler for updating form fields
  const handleInputChange = <K extends keyof RestaurantFormData>(
    field: K,
    value: RestaurantFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Toggle an amenity (amenities: string[])
  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => {
      const current = prev.amenities ?? [];
      const next = current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity];
      return { ...prev, amenities: next };
    });
  };

  // File selection with validation
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) validFiles.push(file);
      else errors.push(`${file.name}: ${validation.error}`);
    });

    setError(errors.length > 0 ? errors.join(', ') : '');
    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
    }
    // Clear the input's files so same-file selection can re-trigger (optional)
    if (event.target) event.currentTarget.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler: uploads images (if any) then creates restaurant
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // start with any existing image URLs (from restaurant when editing)
      let imageUrls: string[] = formData.imageUrls ?? [];

      if (selectedImages.length > 0) {
        const restaurantId = restaurant?.id ?? `temp_${Date.now()}`;

        // uploadMultipleRestaurantImages expected to return string[] of URLs
        imageUrls = await uploadMultipleRestaurantImages(
          selectedImages,
          restaurantId,
          (imageId: string, progress: number) => {
            setUploadProgress((prev) => ({ ...prev, [imageId]: progress }));
          }
        );
      }

      let savedRestaurant: Restaurant;
      if (restaurant) {
        // If you later implement updateRestaurant, replace the error with that call.
        throw new Error('Update functionality not implemented yet');
      } else {
        // createRestaurant should accept (formData, imageUrls, userId)
        savedRestaurant = await createRestaurant(formData, imageUrls, userId);
      }

      onSuccess(savedRestaurant);
    } catch (err: unknown) {
      console.error('Failed to save restaurant:', err);
      const message = err instanceof Error ? err.message : 'Failed to save restaurant';
      setError(message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{restaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</CardTitle>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select
                  value={formData.cuisine}
                  onValueChange={(val: string) => handleInputChange('cuisine', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUISINE_TYPES.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your restaurant"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceRange">Price Range</Label>
                <Select
                  value={formData.priceRange}
                  onValueChange={(val: string) => handleInputChange('priceRange', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="waitTime">Typical Wait Time</Label>
                <Input
                  id="waitTime"
                  value={formData.waitTime}
                  onChange={(e) => handleInputChange('waitTime', e.target.value)}
                  placeholder="e.g., 15-25 minutes"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-restaurant.com"
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-semibold">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AMENITIES.map((amenity) => {
                const active = (formData.amenities ?? []).includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-2 rounded-lg border text-sm transition-colors ${
                      active ? 'bg-primary/10 border-primary text-primary' : 'bg-background border-border hover:bg-accent'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold">Restaurant Images</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Click to upload restaurant images</p>
                  <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP up to 10MB each</p>
                </label>
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.cuisine}
              className="flex-1"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{restaurant ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <span>{restaurant ? 'Update Restaurant' : 'Create Restaurant'}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
