// import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Building } from 'lucide-react';
import type { RegistrationData } from './types';
import { RESTAURANT_TYPES, US_STATES } from './constants';

interface RestaurantDetailsStepProps {
  data: RegistrationData;
  onChange: (data: Partial<RegistrationData>) => void;
}

export function RestaurantDetailsStep({ data, onChange }: RestaurantDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Building className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-medium">Restaurant Details</h3>
        <p className="text-sm text-muted-foreground">
          Tell us about your restaurant
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Restaurant Name *</Label>
          <Input
            id="restaurantName"
            value={data.restaurantName}
            onChange={(e) => onChange({ restaurantName: e.target.value })}
            placeholder="Bella Vista"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurantType">Restaurant Type *</Label>
          <Select
            value={data.restaurantType}
            onValueChange={(value) => onChange({ restaurantType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select restaurant type" />
            </SelectTrigger>
            <SelectContent>
              {RESTAURANT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="New York"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select
              value={data.state}
              onValueChange={(value) => onChange({ state: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code *</Label>
            <Input
              id="zipCode"
              value={data.zipCode}
              onChange={(e) => onChange({ zipCode: e.target.value })}
              placeholder="10001"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedCapacity">Estimated Capacity</Label>
          <Input
            id="estimatedCapacity"
            type="number"
            value={data.estimatedCapacity}
            onChange={(e) => onChange({ estimatedCapacity: parseInt(e.target.value) || 50 })}
            placeholder="50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Restaurant Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Describe your restaurant's atmosphere, cuisine, and unique features..."
            className="min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}