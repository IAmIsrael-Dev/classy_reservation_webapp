import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OwnerDetailsStep } from './OwnerDetailsStep';
import { RestaurantDetailsStep } from './RestaurantDetailsStep';
import { BusinessDetailsStep } from './BusinessDetailsStep';
import type { RegistrationData } from './types';
import { validateOwnerDetails, validateRestaurantDetails, validateBusinessDetails } from './validation';

interface OwnerRegistrationWizardProps {
  isLoading: boolean;
  error: string;
  onSubmit: (data: RegistrationData) => Promise<void>;
  onBack: () => void;
}

const STEPS = [
  { id: 'owner', title: 'Owner Details', description: 'Personal information' },
  { id: 'restaurant', title: 'Restaurant Details', description: 'Restaurant information' },
  { id: 'business', title: 'Business Details', description: 'Legal & operational details' }
];

export function OwnerRegistrationWizard({ 
  isLoading, 
  error, 
  onSubmit, 
  onBack 
}: OwnerRegistrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    // Owner details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Restaurant details
    restaurantName: '',
    restaurantType: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    description: '',
    restaurantImage: undefined,
    
    // Business details
    businessLicense: '',
    taxId: '',
    estimatedCapacity: 50
  });

  const handleDataChange = (updates: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return validateOwnerDetails(data).isValid;
      case 1:
        return validateRestaurantDetails(data).isValid;
      case 2:
        return validateBusinessDetails(data).isValid;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (canProceedToNext()) {
      await onSubmit(data);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OwnerDetailsStep
            data={data}
            onChange={handleDataChange}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        );
      case 1:
        return (
          <RestaurantDetailsStep
            data={data}
            onChange={handleDataChange}
          />
        );
      case 2:
        return (
          <BusinessDetailsStep
            data={data}
            onChange={handleDataChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="dark">
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-medium">Restaurant Registration</h1>
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="w-full max-w-2xl space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        index === currentStep
                          ? 'border-primary bg-primary text-primary-foreground'
                          : index < currentStep
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-muted text-muted-foreground'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <Card>
              <CardHeader>
                <CardTitle>{STEPS[currentStep].title}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderStepContent()}

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  {currentStep === STEPS.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceedToNext() || isLoading}
                      className="flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Creating...' : 'Complete Registration'}</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceedToNext()}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}