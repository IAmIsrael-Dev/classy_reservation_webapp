// import React from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
// import { Button } from '../../ui/button';
import { FileText, CheckCircle } from 'lucide-react';
import type { RegistrationData } from './types';

interface BusinessDetailsStepProps {
  data: RegistrationData;
  onChange: (data: Partial<RegistrationData>) => void;
}

export function BusinessDetailsStep({ data, onChange }: BusinessDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <FileText className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h3 className="text-xl font-medium">Business Information</h3>
        <p className="text-sm text-muted-foreground">
          Optional business details for compliance and verification
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessLicense">Business License Number</Label>
          <Input
            id="businessLicense"
            value={data.businessLicense || ''}
            onChange={(e) => onChange({ businessLicense: e.target.value })}
            placeholder="Optional - for business verification"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / EIN</Label>
          <Input
            id="taxId"
            value={data.taxId || ''}
            onChange={(e) => onChange({ taxId: e.target.value })}
            placeholder="Optional - for tax reporting"
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium">Ready to Launch!</h4>
              <p className="text-sm text-muted-foreground">
                You can complete your registration now and add business details later in your settings.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Start accepting reservations immediately</li>
                <li>• Invite your staff to join</li>
                <li>• Set up your floor plan and menu</li>
                <li>• Configure business details anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}