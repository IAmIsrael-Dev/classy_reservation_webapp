// import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Crown, Eye, EyeOff } from 'lucide-react';
import type { RegistrationData } from './types';

interface OwnerDetailsStepProps {
  data: RegistrationData;
  onChange: (data: Partial<RegistrationData>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
}

export function OwnerDetailsStep({ data, onChange, showPassword, onTogglePassword }: OwnerDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Crown className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-medium">Owner Information</h3>
        <p className="text-sm text-muted-foreground">
          Set up your account as the restaurant owner
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Smith"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="john@bellavista.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="Create a secure password"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={data.confirmPassword}
          onChange={(e) => onChange({ confirmPassword: e.target.value })}
          placeholder="Confirm your password"
        />
      </div>
    </div>
  );
}