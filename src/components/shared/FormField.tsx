import React from 'react';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  children, 
  required, 
  helpText 
}) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
    {helpText && <p className="text-xs text-gray-500">{helpText}</p>}
    {error && (
      <div className="flex items-center gap-1 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    )}
  </div>
);
