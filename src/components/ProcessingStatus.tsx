import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2 } from 'lucide-react';
import { PatientData } from './PatientForm';

interface ProcessingStatusProps {
  lastProcessedField?: keyof PatientData;
  isProcessing: boolean;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  lastProcessedField,
  isProcessing
}) => {
  const [recentlyFilled, setRecentlyFilled] = useState<(keyof PatientData)[]>([]);

  useEffect(() => {
    if (lastProcessedField) {
      setRecentlyFilled(prev => {
        const newList = [lastProcessedField, ...prev.filter(f => f !== lastProcessedField)];
        return newList.slice(0, 3); // Keep only last 3
      });
      
      // Remove from recent list after 5 seconds
      const timer = setTimeout(() => {
        setRecentlyFilled(prev => prev.filter(f => f !== lastProcessedField));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [lastProcessedField]);

  const getFieldDisplayName = (field: keyof PatientData) => {
    const names = {
      name: 'Name',
      age: 'Age',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      address: 'Address',
      mobile: 'Mobile Number',
      symptoms: 'Symptoms'
    };
    return names[field];
  };

  if (!isProcessing && recentlyFilled.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 bg-gradient-card shadow-soft border-medical-primary/20">
      <div className="space-y-2">
        {isProcessing && (
          <div className="flex items-center gap-2 text-medical-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Processing voice input...</span>
          </div>
        )}
        
        {recentlyFilled.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Recently filled:</div>
            <div className="flex flex-wrap gap-2">
              {recentlyFilled.map((field, index) => (
                <Badge 
                  key={`${field}-${index}`}
                  variant="secondary" 
                  className="bg-medical-primary/10 text-medical-primary animate-in fade-in-0 slide-in-from-bottom-2"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {getFieldDisplayName(field)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};