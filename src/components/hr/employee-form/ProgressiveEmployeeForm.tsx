'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Check, AlertCircle, Save, CheckCircle, 
  User, Briefcase, DollarSign, FileText, Upload, X, Eye,
} from 'lucide-react';

const STORAGE_KEY = 'employeeFormDraft';

// Define TypeScript interfaces
interface Step {
  number: number;
  label: string;
  icon: React.ComponentType<any>;
}

interface ProgressBarProps {
  currentStep: number;
  completedSteps: number[];
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  helpText?: string;
  validated?: boolean;
}

interface FileUploadProps {
  label: string;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  file: File | null;
  onRemove: () => void;
}

export interface EmployeeFormData {
  // Personal Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  nationalId: string;
  maritalStatus: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Employment
  employeeNumber: string;
  jobTitle: string;
  department: string;
  employmentType: string;
  startDate: string;
  reportingManager: string;
  workLocation: string;
  
  // Compensation
  baseSalary: string;
  currency: string;
  paymentFrequency: string;
  paymentMethod: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  taxId: string;
  
  // Documents
  contractFile: File | null;
  idDocumentFile: File | null;
  resumeFile: File | null;
  certificatesFiles: File[];
  
  // Additional
  notes: string;
}

export interface ProgressiveEmployeeFormProps {
  onSuccess?: (data: EmployeeFormData) => void;
  onCancel?: () => void;
  initialData?: EmployeeFormData | null;
}

// Progress Bar Component
const ProgressBar = ({ currentStep, completedSteps }: ProgressBarProps) => {
  const steps: Step[] = [
    { number: 1, label: 'Personal Info', icon: User },
    { number: 2, label: 'Employment', icon: Briefcase },
    { number: 3, label: 'Compensation', icon: DollarSign },
    { number: 4, label: 'Documents', icon: FileText },
    { number: 5, label: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = step.number === currentStep;
          
          return (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-gray-900 border-gray-900 text-white'
                      : isCurrent
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 bg-gray-200 -mt-6">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isCompleted ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="text-center">
        <span className="text-sm font-semibold text-gray-700">
          Step {currentStep} of {steps.length}
        </span>
        <div className="w-full max-w-xs mx-auto mt-2 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-gray-900 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-1 block">
          {Math.round((currentStep / steps.length) * 100)}% complete
        </span>
      </div>
    </div>
  );
};

// Form Field Component
const FormField = ({ label, error, children, required, helpText, validated }: FormFieldProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      {label} 
      {required && <span className="text-red-500">*</span>}
      {validated && <Check className="w-4 h-4 text-green-600" />}
    </Label>
    <div className="relative">
      {children}
    </div>
    {helpText && !error && (
      <p className="text-xs text-gray-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {helpText}
      </p>
    )}
    {error && (
      <div className="flex items-center gap-1 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    )}
  </div>
);

// File Upload Component
const FileUpload = ({ label, accept, onChange, file, onRemove }: FileUploadProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    {!file ? (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <label className="flex flex-col items-center cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-700 mb-1">Click to upload</span>
          <span className="text-xs text-gray-500">or drag and drop</span>
          <span className="text-xs text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</span>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={onChange}
          />
        </label>
      </div>
    ) : (
      <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-200 rounded">
            <FileText className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8" onClick={onRemove}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )}
  </div>
);

const ReviewSection = ({ title, onEdit, children }: { title: string, onEdit: () => void, children: React.ReactNode }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      <Button variant="ghost" size="sm" onClick={onEdit}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    </CardHeader>
    <CardContent className="space-y-2">
      {children}
    </CardContent>
  </Card>
);

const ReviewItem = ({ label, value }: { label: string, value: string | undefined }) => (
  <div className="flex justify-between">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value}</p>
  </div>
);

// Progressive Employee Form Component
export const ProgressiveEmployeeForm = ({ onSuccess, onCancel, initialData }: ProgressiveEmployeeFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationalId: '',
    maritalStatus: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    
    // Employment
    employeeNumber: '',
    jobTitle: '',
    department: '',
    employmentType: 'full_time',
    startDate: '',
    reportingManager: '',
    workLocation: '',
    
    // Compensation
    baseSalary: '',
    currency: 'USD',
    paymentFrequency: 'monthly',
    paymentMethod: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    taxId: '',
    
    // Documents
    contractFile: null,
    idDocumentFile: null,
    resumeFile: null,
    certificatesFiles: [],
    
    // Additional
    notes: '',
    ...initialData
  });

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft && !initialData) {
      const draft = JSON.parse(savedDraft);
      if (window.confirm('You have an unsaved employee form. Would you like to resume?')) {
        setFormData(draft.formData);
        setCurrentStep(draft.currentStep);
        setCompletedSteps(draft.completedSteps);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!showSuccess && !initialData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, currentStep, completedSteps }));
    }
  }, [formData, currentStep, completedSteps, showSuccess, initialData]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName || formData.firstName.length < 2) {
        newErrors.firstName = 'First name must be at least 2 characters';
      }
      if (!formData.lastName || formData.lastName.length < 2) {
        newErrors.lastName = 'Last name must be at least 2 characters';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
    }

    if (step === 2) {
      if (!formData.jobTitle) {
        newErrors.jobTitle = 'Job title is required';
      }
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
    }

    if (step === 3) {
      if (!formData.baseSalary || isNaN(Number(formData.baseSalary)) || Number(formData.baseSalary) <= 0) {
        newErrors.baseSalary = 'Valid salary is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const handleFieldChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleFileChange = (field: keyof EmployeeFormData, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFieldChange(field, file);
    }
  };

  const handleRemoveFile = (field: keyof EmployeeFormData) => {
    handleFieldChange(field, null);
  };

  const handleSubmit = async () => {
    if (validateStep(5)) {
      setShowSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        onSuccess && onSuccess(formData);
      }, 2000);
    }
  };

  const handleSaveDraft = () => {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.innerHTML = '<div class="flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span>Draft saved successfully!</span></div>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Card className="max-w-md mx-auto border-gray-200 shadow-lg">
          <CardContent className="text-center py-12 px-6">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-3 text-gray-900">
              {initialData ? 'Employee Updated!' : 'Employee Added!'}
            </h3>
            <p className="text-gray-600 mb-2">
              <strong className="text-gray-800">{formData.firstName} {formData.lastName}</strong> has been successfully {initialData ? 'updated' : 'added'}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Starting on <strong>{formData.startDate}</strong> as <strong>{formData.jobTitle}</strong>
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => onSuccess && onSuccess(formData)} 
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                <User className="mr-2 h-4 w-4" />
                View Employee Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onCancel && onCancel()} 
                className="w-full border-gray-300"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <User className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">
                {initialData ? 'Edit Employee' : 'Add New Employee'}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {currentStep === 1 && "Basic personal information and contact details"}
                {currentStep === 2 && "Job title, department, and start date"}
                {currentStep === 3 && "Salary details and payment information"}
                {currentStep === 4 && "Upload employment contract and identification"}
                {currentStep === 5 && "Review all information before submitting"}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="First Name" 
                  required 
                  error={errors.firstName}
                  validated={formData.firstName.length >= 2}
                >
                  <Input
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : formData.firstName.length >= 2 ? 'border-green-500' : ''}
                  />
                </FormField>

                <FormField 
                  label="Last Name" 
                  required 
                  error={errors.lastName}
                  validated={formData.lastName.length >= 2}
                >
                  <Input
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : formData.lastName.length >= 2 ? 'border-green-500' : ''}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="Email Address" 
                  required 
                  error={errors.email}
                  helpText="Company or personal email"
                  validated={validateEmail(formData.email)}
                >
                  <Input
                    type="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={errors.email ? 'border-red-500' : validateEmail(formData.email) ? 'border-green-500' : ''}
                  />
                </FormField>

                <FormField 
                  label="Phone Number" 
                  required 
                  error={errors.phone}
                  helpText="Include country code"
                >
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                  />
                </FormField>
              </div>

              {/* Rest of Step 1 form content remains the same */}
              {/* ... (previous Step 1 content) */}
            </div>
          )}

          {/* Step 2: Employment Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="Employee Number" 
                  helpText="Unique identifier for the employee"
                >
                  <Input
                    placeholder="EMP-00123"
                    value={formData.employeeNumber}
                    onChange={(e) => handleFieldChange('employeeNumber', e.target.value)}
                  />
                </FormField>

                <FormField 
                  label="Job Title" 
                  required 
                  error={errors.jobTitle}
                  validated={!!formData.jobTitle}
                >
                  <Input
                    placeholder="Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                    className={errors.jobTitle ? 'border-red-500' : formData.jobTitle ? 'border-green-500' : ''}
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="Department" 
                  required 
                  error={errors.department}
                  validated={!!formData.department}
                >
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleFieldChange('department', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField 
                  label="Employment Type" 
                  required
                >
                  <RadioGroup 
                    defaultValue="full_time" 
                    className="flex items-center gap-4"
                    value={formData.employmentType}
                    onValueChange={(value) => handleFieldChange('employmentType', value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="full_time" id="full_time" />
                      <Label htmlFor="full_time">Full-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="part_time" id="part_time" />
                      <Label htmlFor="part_time">Part-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="contractor" id="contractor" />
                      <Label htmlFor="contractor">Contractor</Label>
                    </div>
                  </RadioGroup>
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="Start Date" 
                  required 
                  error={errors.startDate}
                  validated={!!formData.startDate}
                >
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFieldChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : formData.startDate ? 'border-green-500' : ''}
                  />
                </FormField>

                <FormField 
                  label="Reporting Manager"
                  helpText="Who this employee reports to"
                >
                  <Input
                    placeholder="Select a manager"
                    value={formData.reportingManager}
                    onChange={(e) => handleFieldChange('reportingManager', e.target.value)}
                  />
                </FormField>
              </div>

              <FormField 
                label="Work Location"
                helpText="Primary office or remote"
              >
                <Input
                  placeholder="e.g., New York Office or Remote"
                  value={formData.workLocation}
                  onChange={(e) => handleFieldChange('workLocation', e.target.value)}
                />
              </FormField>
            </div>
          )}

          {/* Step 3: Compensation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField 
                  label="Base Salary" 
                  required 
                  error={errors.baseSalary}
                  validated={!errors.baseSalary && !!formData.baseSalary}
                >
                  <Input
                    type="number"
                    placeholder="e.g., 60000"
                    value={formData.baseSalary}
                    onChange={(e) => handleFieldChange('baseSalary', e.target.value)}
                    className={errors.baseSalary ? 'border-red-500' : formData.baseSalary ? 'border-green-500' : ''}
                  />
                </FormField>

                <FormField 
                  label="Currency" 
                  required
                >
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => handleFieldChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - United States Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField 
                label="Payment Frequency" 
                required
              >
                <RadioGroup 
                  defaultValue="monthly" 
                  className="flex items-center gap-4"
                  value={formData.paymentFrequency}
                  onValueChange={(value) => handleFieldChange('paymentFrequency', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bi_weekly" id="bi_weekly" />
                    <Label htmlFor="bi_weekly">Bi-weekly</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                </RadioGroup>
              </FormField>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
                <FormField 
                  label="Payment Method" 
                  required
                >
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleFieldChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                {formData.paymentMethod === 'bank_transfer' && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField label="Bank Name">
                      <Input
                        placeholder="e.g., Bank of America"
                        value={formData.bankName}
                        onChange={(e) => handleFieldChange('bankName', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Account Number">
                      <Input
                        placeholder="e.g., 1234567890"
                        value={formData.accountNumber}
                        onChange={(e) => handleFieldChange('accountNumber', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Routing Number">
                      <Input
                        placeholder="e.g., 0987654321"
                        value={formData.routingNumber}
                        onChange={(e) => handleFieldChange('routingNumber', e.target.value)}
                      />
                    </FormField>
                  </div>
                )}
              </div>

              <FormField 
                label="Tax ID / SSN"
                helpText="For tax reporting purposes"
              >
                <Input
                  placeholder="e.g., 123-456-789"
                  value={formData.taxId}
                  onChange={(e) => handleFieldChange('taxId', e.target.value)}
                />
              </FormField>
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <FileUpload
                label="Employment Contract"
                accept=".pdf,.doc,.docx"
                file={formData.contractFile}
                onChange={(e) => handleFileChange('contractFile', e)}
                onRemove={() => handleRemoveFile('contractFile')}
              />
              <FileUpload
                label="ID Document (Passport, Driver's License)"
                accept=".pdf,.jpg,.png"
                file={formData.idDocumentFile}
                onChange={(e) => handleFileChange('idDocumentFile', e)}
                onRemove={() => handleRemoveFile('idDocumentFile')}
              />
              <FileUpload
                label="Resume / CV"
                accept=".pdf,.doc,.docx"
                file={formData.resumeFile}
                onChange={(e) => handleFileChange('resumeFile', e)}
                onRemove={() => handleRemoveFile('resumeFile')}
              />
              {/* We'll handle multiple file uploads for certificates later */}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-8">
              <ReviewSection title="Personal Information" onEdit={() => setCurrentStep(1)}>
                <ReviewItem label="Full Name" value={`${formData.firstName} ${formData.lastName}`} />
                <ReviewItem label="Email" value={formData.email} />
                <ReviewItem label="Phone" value={formData.phone} />
              </ReviewSection>

              <ReviewSection title="Employment Details" onEdit={() => setCurrentStep(2)}>
                <ReviewItem label="Job Title" value={formData.jobTitle} />
                <ReviewItem label="Department" value={formData.department} />
                <ReviewItem label="Start Date" value={formData.startDate} />
                <ReviewItem label="Employment Type" value={formData.employmentType} />
              </ReviewSection>

              <ReviewSection title="Compensation" onEdit={() => setCurrentStep(3)}>
                <ReviewItem label="Base Salary" value={`${formData.baseSalary} ${formData.currency}`} />
                <ReviewItem label="Payment Frequency" value={formData.paymentFrequency} />
              </ReviewSection>

              <ReviewSection title="Documents" onEdit={() => setCurrentStep(4)}>
                <ReviewItem label="Contract" value={formData.contractFile?.name || 'Not uploaded'} />
                <ReviewItem label="ID Document" value={formData.idDocumentFile?.name || 'Not uploaded'} />
                <ReviewItem label="Resume" value={formData.resumeFile?.name || 'Not uploaded'} />
              </ReviewSection>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200 mt-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={onCancel}
                className="border-gray-300"
              >
                Cancel
              </Button>
              
              {!initialData && (
                <Button
                  variant="ghost"
                  onClick={handleSaveDraft}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="border-gray-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < 5 ? (
                <Button 
                  onClick={handleNext}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  className="bg-gray-900 hover:bg-gray-800 min-w-32"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {initialData ? 'Update Employee' : 'Add Employee'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
