 
import { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { CheckCircle, ArrowRight, ArrowLeft, Clock, MapPin, Users, Menu, CreditCard, TestTube } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  { id: 'restaurant', title: 'Restaurant Details', icon: MapPin },
  { id: 'hours', title: 'Operating Hours', icon: Clock },
  { id: 'tables', title: 'Table Map', icon: MapPin },
  { id: 'menu', title: 'Menu Import', icon: Menu },
  { id: 'staff', title: 'Staff Invites', icon: Users },
  { id: 'payment', title: 'Payment Setup', icon: CreditCard },
  { id: 'test', title: 'Test Reservation', icon: TestTube },
];

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    restaurant: {
      name: '',
      cuisine: '',
      address: '',
      phone: '',
      email: '',
      description: '',
    },
    hours: {
      monday: { open: '17:00', close: '23:00', isClosed: false },
      tuesday: { open: '17:00', close: '23:00', isClosed: false },
      wednesday: { open: '17:00', close: '23:00', isClosed: false },
      thursday: { open: '17:00', close: '23:00', isClosed: false },
      friday: { open: '17:00', close: '24:00', isClosed: false },
      saturday: { open: '17:00', close: '24:00', isClosed: false },
      sunday: { open: '17:00', close: '22:00', isClosed: false },
    },
    tables: [],
    staff: [],
    payment: {
      processor: '',
      accountConnected: false,
    },
  });

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Restaurant details
        return formData.restaurant.name && formData.restaurant.cuisine && formData.restaurant.address;
      case 1: // Hours
        return true; // Default hours are provided
      case 2: // Tables
        return true; // Can be skipped initially
      case 3: // Menu
        return true; // Can be skipped initially
      case 4: // Staff
        return true; // Can be skipped initially
      case 5: // Payment
        return true; // Can be skipped initially
      case 6: // Test
        return true; // Can be skipped initially
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Restaurant Details
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Tell us about your restaurant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    value={formData.restaurant.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, name: e.target.value }
                    }))}
                    placeholder="Bella Vista"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisine">Cuisine Type *</Label>
                  <Select
                    value={formData.restaurant.cuisine}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, cuisine: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="american">American</SelectItem>
                      <SelectItem value="asian">Asian</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="seafood">Seafood</SelectItem>
                      <SelectItem value="steakhouse">Steakhouse</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.restaurant.address}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, address: e.target.value }
                    }))}
                    placeholder="123 Main Street, City, State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.restaurant.phone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, phone: e.target.value }
                    }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.restaurant.email}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, email: e.target.value }
                    }))}
                    placeholder="info@bellavista.com"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.restaurant.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restaurant: { ...prev.restaurant, description: e.target.value }
                    }))}
                    placeholder="Brief description of your restaurant..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Operating Hours
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Set your operating hours</h3>
              <div className="space-y-4">
                {Object.entries(formData.hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24 capitalize font-medium">{day}</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!hours.isClosed}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          hours: {
                            ...prev.hours,
                            [day]: { ...hours, isClosed: !e.target.checked }
                          }
                        }))}
                      />
                      <span className="text-sm">Open</span>
                    </div>
                    {!hours.isClosed && (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            hours: {
                              ...prev.hours,
                              [day]: { ...hours, open: e.target.value }
                            }
                          }))}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            hours: {
                              ...prev.hours,
                              [day]: { ...hours, close: e.target.value }
                            }
                          }))}
                          className="w-32"
                        />
                      </>
                    )}
                    {hours.isClosed && (
                      <span className="text-muted-foreground italic">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 2: // Table Map
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Set up your floor plan</h3>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h4 className="text-lg font-medium mb-2">Floor Plan Designer</h4>
                <p className="text-muted-foreground mb-4">
                  Drag and drop tables to create your restaurant layout
                </p>
                <Button variant="outline">
                  Launch Floor Plan Designer
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>✓ You can skip this step and set up your floor plan later</p>
                <p>✓ Import existing layouts or start from templates</p>
              </div>
            </div>
          </div>
        );

      case 3: // Menu Import
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Import your menu</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6 text-center">
                  <Menu className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium mb-2">Upload Menu File</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    PDF, DOC, or image files supported
                  </p>
                  <Button variant="outline">Choose File</Button>
                </div>
                <div className="border rounded-lg p-6 text-center">
                  <Menu className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium mb-2">Manual Entry</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add items one by one
                  </p>
                  <Button variant="outline">Start Manual Entry</Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>✓ Skip this step to set up your menu later in the Menu Management section</p>
              </div>
            </div>
          </div>
        );

      case 4: // Staff Invites
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Invite your staff</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder="Email address" className="flex-1" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="host">Host</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>Invite</Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>✓ Staff will receive email invitations to join your restaurant</p>
                  <p>✓ You can manage roles and permissions later</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5: // Payment Setup
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Payment processing</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium mb-2">Stripe</h4>
                  <p className="text-sm text-muted-foreground">2.9% + 30¢ per transaction</p>
                </div>
                <div className="border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium mb-2">Square</h4>
                  <p className="text-sm text-muted-foreground">2.6% + 10¢ per transaction</p>
                </div>
                <div className="border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                  <CreditCard className="w-8 h-8 mx-auto mb-3 text-primary" />
                  <h4 className="font-medium mb-2">PayPal</h4>
                  <p className="text-sm text-muted-foreground">2.9% + 30¢ per transaction</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>✓ Secure payment processing for reservations and deposits</p>
                <p>✓ Can be configured later in Settings</p>
              </div>
            </div>
          </div>
        );

      case 6: // Test Reservation
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-4">Test your setup</h3>
              <div className="border rounded-lg p-6">
                <h4 className="font-medium mb-4">Create a test reservation</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>Guest Name</Label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label>Party Size</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="2" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 person</SelectItem>
                        <SelectItem value="2">2 people</SelectItem>
                        <SelectItem value="4">4 people</SelectItem>
                        <SelectItem value="6">6 people</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" defaultValue="19:00" />
                  </div>
                </div>
                <Button className="w-full">Create Test Reservation</Button>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>✓ This helps verify that your reservation system is working correctly</p>
                <p>✓ You can delete this test reservation afterward</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">CR</span>
                </div>
                <span className="text-xl font-medium">Restaurant Setup</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Badge variant="outline">Step {currentStep + 1} of {steps.length}</Badge>
            </div>
            <Button onClick={onSkip} variant="ghost" size="sm">
              Skip Setup
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-medium">Welcome to Classy Reservations!</h2>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="mb-6" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep || isStepComplete(index);
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 ${
                        isActive 
                          ? 'border-primary bg-primary text-primary-foreground' 
                          : isCompleted 
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-muted-foreground bg-background'
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs text-center ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <Card>
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button 
              onClick={handlePrev} 
              variant="outline" 
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isStepComplete(currentStep) && currentStep < steps.length - 1}
            >
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}