import React, { useState, useEffect } from 'react';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { getDataMode, toggleDataMode, isFirebaseConfigured } from '../firebaseClient';
import { Database, Cloud, AlertTriangle, Info } from 'lucide-react';

interface DataModeToggleProps {
  onModeChange?: (mode: 'mock' | 'firebase') => void;
}

export const DataModeToggle: React.FC<DataModeToggleProps> = ({ onModeChange }) => {
  const [currentMode, setCurrentMode] = useState<'mock' | 'firebase'>(() => getDataMode());
  const [isFirebaseAvailable] = useState(isFirebaseConfigured());

  useEffect(() => {
    // Initialize mode from localStorage
    const mode = getDataMode();
    setCurrentMode(mode);
  }, []);

  const handleToggle = () => {
    const newMode = toggleDataMode();
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  const isFirebaseMode = currentMode === 'firebase';

  return (
    <Card className="border-2 border-dashed border-border">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                {isFirebaseMode ? (
                  <Cloud className="w-4 h-4 text-blue-500" />
                ) : (
                  <Database className="w-4 h-4 text-green-500" />
                )}
                <Label className="text-sm font-medium">Data Mode</Label>
              </div>
              <Badge 
                variant={isFirebaseMode ? "default" : "secondary"}
                className="text-xs"
              >
                {isFirebaseMode ? 'Firebase' : 'Mock Data'}
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-xs text-muted-foreground">Mock</span>
              <Switch
                checked={isFirebaseMode}
                onCheckedChange={handleToggle}
                disabled={!isFirebaseAvailable && currentMode === 'mock'}
              />
              <span className="text-xs text-muted-foreground">Firebase</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {isFirebaseMode ? (
              <div className="flex items-start space-x-2">
                <Info className="w-3 h-3 mt-0.5 text-blue-500 flex-shrink-0" />
                <div>
                  <p>Using Firebase Firestore for data storage.</p>
                  <p>Create, update, and manage real restaurant data.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <Database className="w-3 h-3 mt-0.5 text-green-500 flex-shrink-0" />
                <div>
                  <p>Using mock data for demonstration.</p>
                  <p>Perfect for testing and development without affecting real data.</p>
                </div>
              </div>
            )}
          </div>

          {!isFirebaseAvailable && (
            <div className="border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-orange-700 dark:text-orange-300">
                  <p className="font-medium">Firebase not configured</p>
                  <p>Add Firebase environment variables to enable real data storage.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};