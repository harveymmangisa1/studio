'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Save, CheckCircle, UserPlus } from 'lucide-react';
import { FormField, SuccessCard, PageHeader } from '@/components/shared';

const STORAGE_KEY = 'teamMemberFormDraft';

const ProgressBar = ({ currentStep, completedSteps }: { currentStep: number, completedSteps: number[] }) => {
  const steps = [
    { number: 1, label: 'Basic' },
    { number: 2, label: 'Permissions' },
    { number: 3, label: 'Review' }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  completedSteps.includes(step.number)
                    ? 'bg-green-500 text-white'
                    : step.number === currentStep
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {completedSteps.includes(step.number) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-gray-200 rounded">
                <div
                  className={`h-full rounded transition-all ${
                    completedSteps.includes(step.number) ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  style={{ width: completedSteps.includes(step.number) ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="text-center text-sm text-gray-600">
        Step {currentStep} of {steps.length} ({Math.round((currentStep / steps.length) * 100)}% complete)
      </div>
    </div>
  );
};


export default function ProgressiveTeamMemberForm({ onSuccess, onCancel, initialData }: { onSuccess?: (data: any) => void; onCancel?: () => void; initialData?: any; }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'viewer',
    department: '',
    phone: '',
    accessLevel: 'standard',
    permissions: [] as string[],
    startDate: '',
    manager: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (confirm('You have an unsaved team member invitation. Would you like to resume?')) {
          setFormData(draft.formData);
          setCurrentStep(draft.currentStep);
          setCompletedSteps(draft.completedSteps);
        }
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (!showSuccess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData, currentStep, completedSteps }));
    }
  }, [formData, currentStep, completedSteps, showSuccess]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName || formData.fullName.length < 2) {
        newErrors.fullName = 'Full name must be at least 2 characters';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
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

  const handleSkip = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async () => {
    if (validateStep(3)) {
      setShowSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        onSuccess && onSuccess(formData);
      }, 2000);
    }
  };

  const handleSaveDraft = () => {
    alert('Draft saved successfully! You can resume later.');
  };

  if (showSuccess) {
    return (
      <SuccessCard
        title="Invitation Sent!"
        description={`${formData.fullName} has been invited to join your team.`}
        buttonText="View Team Members"
        onButtonClick={() => onSuccess && onSuccess(formData)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Team Management"
        description="Invite and manage team members for your organization."
      />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Let's start with the basics"}
            {currentStep === 2 && "Set permissions and access"}
            {currentStep === 3 && "Review and send invitation"}
          </CardTitle>
          <p className="text-sm text-gray-500">
            {currentStep === 1 && "We need some essential information about your team member"}
            {currentStep === 2 && "Configure what this team member can access and do"}
            {currentStep === 3 && "Review all information before sending the invitation"}
          </p>
        </CardHeader>

      <CardContent>
        <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <FormField label="Full Name" required error={errors.fullName} helpText="This name will be displayed throughout the application">
              <Input
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className={errors.fullName ? 'border-red-500' : formData.fullName.length >= 2 ? 'border-green-500' : ''}
              />
            </FormField>

            <FormField label="Email Address" required error={errors.email} helpText="The invitation will be sent to this email address">
              <Input
                type="email"
                placeholder="john.doe@company.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : validateEmail(formData.email) ? 'border-green-500' : ''}
              />
            </FormField>

            <FormField label="Phone Number" helpText="Optional contact number">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </FormField>

            <FormField label="Department" helpText="Which department will this team member belong to?">
              <Select value={formData.department} onValueChange={(value) => handleFieldChange('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="support">Customer Support</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        )}

        {/* Step 2: Permissions */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <FormField label="Role" required helpText="Primary role defines their main responsibilities">
              <Select value={formData.role} onValueChange={(value) => handleFieldChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Access Level" required helpText="Defines what systems and data they can access">
              <RadioGroup value={formData.accessLevel} onValueChange={(value) => handleFieldChange('accessLevel', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="full" id="full" />
                  <Label htmlFor="full">Full Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">Standard Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="limited" id="limited" />
                  <Label htmlFor="limited">Limited Access</Label>
                </div>
              </RadioGroup>
            </FormField>

            <FormField label="Additional Permissions" helpText="Select specific permissions beyond their role">
              <div className="space-y-2">
                {['Create Customers', 'Edit Customers', 'Delete Customers', 'View Financial Data', 'Export Data', 'Manage Team Members'].map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={formData.permissions.includes(permission)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFieldChange('permissions', [...formData.permissions, permission]);
                        } else {
                          handleFieldChange('permissions', formData.permissions.filter(p => p !== permission));
                        }
                      }}
                    />
                    <Label htmlFor={permission}>{permission}</Label>
                  </div>
                ))}
              </div>
            </FormField>

            <FormField label="Start Date" helpText="When should their access begin?">
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
              />
            </FormField>

            <FormField label="Reporting Manager" helpText="Who will this team member report to?">
              <Select value={formData.manager} onValueChange={(value) => handleFieldChange('manager', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Chen</SelectItem>
                  <SelectItem value="lisa">Lisa Rodriguez</SelectItem>
                  <SelectItem value="david">David Kim</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Basic Information</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Full Name:</span> {formData.fullName}</p>
                <p><span className="text-gray-500">Email:</span> {formData.email}</p>
                {formData.phone && <p><span className="text-gray-500">Phone:</span> {formData.phone}</p>}
                {formData.department && <p><span className="text-gray-500">Department:</span> {formData.department}</p>}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Permissions & Access</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Role:</span> <span className="capitalize">{formData.role}</span></p>
                <p><span className="text-gray-500">Access Level:</span> <span className="capitalize">{formData.accessLevel}</span></p>
                {formData.manager && <p><span className="text-gray-500">Manager:</span> {formData.manager}</p>}
                {formData.startDate && <p><span className="text-gray-500">Start Date:</span> {formData.startDate}</p>}
                {formData.permissions.length > 0 && (
                  <div>
                    <span className="text-gray-500">Additional Permissions:</span>
                    <ul className="list-disc list-inside ml-2">
                      {formData.permissions.map(permission => (
                        <li key={permission}>{permission}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <FormField label="Internal Notes" helpText="Private notes, not visible to the team member">
              <Textarea
                placeholder="Add any internal notes about this team member..."
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">{formData.notes.length}/500</p>
            </FormField>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep > 1 && currentStep < 3 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={currentStep === 1 && (!formData.fullName || !formData.email)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
