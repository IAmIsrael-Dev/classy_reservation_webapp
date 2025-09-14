 
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  LogIn,
  ArrowLeft,
  Eye,
  EyeOff,
  Building,
  Shield,
  Users,
  Crown,
  ChefHat} from 'lucide-react';
import type { UserRole, CreateUserData } from '../types/user';
import { OwnerRegistrationWizard } from './OwnerRegistrationWizard';
import type { RegistrationData } from './types';

interface RestaurantAuthScreenProps {
  email: string;
  password: string;
  role: UserRole;
  authMode: 'login' | 'signup';
  isLoading: boolean;
  error: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onRoleChange: (role: UserRole) => void;
  onAuthModeChange: (mode: 'login' | 'signup') => void;
  onLogin: (e: React.FormEvent) => void;
  onSignup: (userData: CreateUserData, password: string) => void;
  onOwnerRegistration: (data: RegistrationData) => Promise<void>;
  onBackToDashboard: () => void;
}

type RoleConfig = {
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
};

const roleConfig: Record<UserRole, RoleConfig> = {
  owner: {
    label: 'Restaurant Owner',
    icon: Crown,
    description: 'Full control over restaurant operations and settings',
    color: 'text-amber-500'
  },
  manager: {
    label: 'Manager',
    icon: Shield,
    description: 'Oversee daily operations and manage staff',
    color: 'text-blue-500'
  },
  host: {
    label: 'Host',
    icon: Users,
    description: 'Manage reservations and seat customers',
    color: 'text-green-500'
  },
  server: {
    label: 'Server',
    icon: ChefHat,
    description: 'Take orders and serve customers',
    color: 'text-purple-500'
  },
  // Added customer so the roleConfig covers all UserRole values
  customer: {
    label: 'Customer',
    icon: Users,
    description: 'Browse restaurants, make reservations and orders',
    color: 'text-gray-500'
  }
};

export const RestaurantAuthScreen: React.FC<RestaurantAuthScreenProps> = ({
  email,
  password,
  role,
  authMode,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onAuthModeChange,
  onLogin,
  onOwnerRegistration,
  onBackToDashboard
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOwnerRegistration, setShowOwnerRegistration] = useState(false);
  // const [signupData] = useState({
  //   name: '',
  //   phoneNumber: '',
  //   confirmPassword: '',
  //   restaurantId: ''
  // });


  // safe label for Sign In button (roleConfig covers all UserRole keys now)
  const selectedLabel = roleConfig[role].label;

  // Only show staff roles for login, no customer role in restaurant panel
  const staffRoles: UserRole[] = ['owner', 'manager', 'host', 'server'];
  
  // Handle owner registration wizard
  if (showOwnerRegistration) {
    return (
      <OwnerRegistrationWizard
        isLoading={isLoading}
        error={error}
        onSubmit={onOwnerRegistration}
        onBack={() => setShowOwnerRegistration(false)}
      />
    );
  }

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Building className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-medium">Restaurant Access</span>
              </div>
            </div>
            <Button
              onClick={onBackToDashboard}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-lg space-y-6">
            {/* Welcome Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl">Restaurant Management</h2>
              <p className="text-muted-foreground">
                {authMode === 'login'
                  ? "Sign in to access your restaurant's control panel"
                  : 'Create your restaurant management account'}
              </p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => onAuthModeChange('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMode === 'login'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Staff Sign In
              </button>
              <button
                onClick={() => setShowOwnerRegistration(true)}
                className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
              >
                Owner Registration
              </button>
            </div>

            {/* Role Selection - Only for Login */}
            {authMode === 'login' && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Role</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {staffRoles.map((key) => {
                      const config = roleConfig[key];
                      const Icon = config.icon;
                      const isSelected = role === key;

                      return (
                        <button
                          key={key}
                          onClick={() => onRoleChange(key)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-primary' : config.color}`} />
                            <span className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {config.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{config.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auth Form - Only Login */}
            <Card>
              <CardHeader>
                <CardTitle>Staff Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onLogin} className="space-y-4">


                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => onEmailChange(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="h-12"
                    />
                  </div>



                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="h-12 pr-12"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>



                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <LogIn className="w-4 h-4" />
                        <span>Sign In as {selectedLabel}</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Demo Information for Login */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Demo Credentials</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Owner:</strong> owner@restaurant.com / owner123
                    </p>
                    <p>
                      <strong>Manager:</strong> manager@restaurant.com / manager123
                    </p>
                    <p>
                      <strong>Host:</strong> host@restaurant.com / host123
                    </p>
                    <p>
                      <strong>Server:</strong> server@restaurant.com / server123
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/50 mt-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>New to restaurant management?</strong> Click "Owner Registration" to create your restaurant and account.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
