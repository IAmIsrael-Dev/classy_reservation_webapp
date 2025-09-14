import React, { useState, useEffect } from 'react';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { getDataMode, toggleDataMode, isFirebaseConfigured } from '../firebaseClient';
import { Database, Cloud, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';

interface DataModeToggleCompactProps {
  onModeChange?: (mode: 'mock' | 'firebase') => void;
}

export const DataModeToggleCompact: React.FC<DataModeToggleCompactProps> = ({ onModeChange }) => {
  const [currentMode, setCurrentMode] = useState<'mock' | 'firebase'>(() => getDataMode());
  const [isFirebaseAvailable] = useState(isFirebaseConfigured());

  useEffect(() => {
    // Initialize mode from localStorage
    const mode = getDataMode();
    setCurrentMode(mode);
  }, []);

  useEffect(() => {
    // Listen for data mode changes from other components
    const handleDataModeChange = (event: CustomEvent) => {
      const newMode = event.detail as 'mock' | 'firebase';
      setCurrentMode(newMode);
    };

    window.addEventListener('datamode-changed', handleDataModeChange as EventListener);
    return () => {
      window.removeEventListener('datamode-changed', handleDataModeChange as EventListener);
    };
  }, []);

  const handleToggle = () => {
    const newMode = toggleDataMode();
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  const isFirebaseMode = currentMode === 'firebase';

  const tooltipContent = isFirebaseMode 
    ? "Using Firebase Firestore - Real data storage"
    : "Using Mock Data - Demo mode for testing";

  const firbaseUnavailableTooltip = "Firebase not configured. Add environment variables to enable real data storage.";

  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-muted/50 border">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center space-x-2 cursor-help">
              {isFirebaseMode ? (
                <Cloud className="w-4 h-4 text-blue-500" />
              ) : (
                <Database className="w-4 h-4 text-green-500" />
              )}
              <Badge 
                variant={isFirebaseMode ? "default" : "secondary"}
                className="text-xs px-2 py-0"
              >
                {isFirebaseMode ? 'Firebase' : 'Mock'}
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center space-x-2">
        <span className="text-xs text-muted-foreground hidden sm:inline">Mock</span>
        <Switch
          checked={isFirebaseMode}
          onCheckedChange={handleToggle}
          disabled={!isFirebaseAvailable && currentMode === 'mock'}
        />
        <span className="text-xs text-muted-foreground hidden sm:inline">Firebase</span>
      </div>

      {!isFirebaseAvailable && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertTriangle className="w-4 h-4 text-orange-500 cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{firbaseUnavailableTooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};