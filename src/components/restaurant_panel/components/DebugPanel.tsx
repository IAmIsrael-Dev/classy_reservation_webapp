import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { 
  Settings,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { environment } from '../config/environment';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const environmentInfo = [
    {
      label: 'Environment Mode',
      value: environment.isDevelopment ? 'Development' : 'Production',
      status: 'info'
    },
    {
      label: 'Firebase Status',
      value: environment.isFirebaseEnabled ? 'Enabled' : 'Mock Mode',
      status: environment.isFirebaseEnabled ? 'success' : 'warning'
    },
    {
      label: 'Firebase API Key',
      value: environment.firebase.apiKey ? '✓ Configured' : '✗ Missing',
      status: environment.firebase.apiKey ? 'success' : 'error'
    },
    {
      label: 'Firebase Project ID',
      value: environment.firebase.projectId || 'Not configured',
      status: environment.firebase.projectId ? 'success' : 'error'
    },
    {
      label: 'Firebase Auth Domain',
      value: environment.firebase.authDomain ? '✓ Configured' : '✗ Missing',
      status: environment.firebase.authDomain ? 'success' : 'error'
    },
    {
      label: 'Firebase Storage Bucket',
      value: environment.firebase.storageBucket ? '✓ Configured' : '✗ Missing',
      status: environment.firebase.storageBucket ? 'success' : 'error'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 text-white">OK</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">Error</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  if (!environment.isDevelopment) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-background border-border shadow-lg"
          >
            <Settings className="w-4 h-4 mr-2" />
            Debug Info
            {isOpen ? (
              <ChevronDown className="w-4 h-4 ml-2" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Environment Debug Panel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {environmentInfo.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <span className="font-medium">{item.label}:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.value}</span>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
              
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {environment.isFirebaseEnabled 
                    ? 'All services connected to Firebase'
                    : 'Running in mock mode - add Firebase environment variables to enable real backend'
                  }
                </p>
              </div>
              
              {!environment.isFirebaseEnabled && (
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Required environment variables:
                  </p>
                  <div className="text-xs font-mono bg-muted p-2 rounded">
                    VITE_FIREBASE_API_KEY<br />
                    VITE_FIREBASE_AUTH_DOMAIN<br />
                    VITE_FIREBASE_PROJECT_ID<br />
                    VITE_FIREBASE_STORAGE_BUCKET<br />
                    VITE_FIREBASE_MESSAGING_SENDER_ID<br />
                    VITE_FIREBASE_APP_ID
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};