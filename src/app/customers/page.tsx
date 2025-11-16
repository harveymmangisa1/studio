"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { FormField, SuccessCard } from '@/components/shared';

const STORAGE_KEY = 'customerFormDraft';

const ProgressBar = ({ currentStep, completedSteps }) => {
  const steps = [
    { number: 1, label: 'Basic' },
    { number: 2, label: 'Address' },
    { number: 3, label: 'Financial' },
    { number: 4, label: 'Review' }
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
        Step {currentStep} of 4 ({Math.round((currentStep / 4) * 100)}% complete)
      </div>
    </div>
  );
};


export default function ProgressiveCustomerForm({ onSuccess, onCancel, initialData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'individual',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    paymentTerms: 'due_on_receipt',
    creditLimit: '',
    paymentMethods: [],
    discountRate: '',
    tags: [],
    notes: '',
    accountManager: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (confirm('You have unsaved changes. Would you like to resume?')) {
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

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (step === 3) {
      if (formData.creditLimit && isNaN(formData.creditLimit)) {
        newErrors.creditLimit = 'Credit limit must be a number';
      }
      if (formData.discountRate && (isNaN(formData.discountRate) || formData.discountRate < 0 || formData.discountRate > 100)) {
        newErrors.discountRate = 'Discount must be between 0 and 100';
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

  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
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
        title="Customer Created!"
        description={`${formData.name} has been added to your customer database.`}
        buttonText="View Customer"
        onButtonClick={() => onSuccess && onSuccess(formData)}
      />
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {currentStep === 1 && "Let's start with the basics"}
          {currentStep === 2 && "Where is your customer located?"}
          {currentStep === 3 && "Financial information"}
          {currentStep === 4 && "Review and confirm"}
        </CardTitle>
        <p className="text-sm text-gray-500">
          {currentStep === 1 && "We need some essential information about your customer"}
          {currentStep === 2 && "This information helps with invoicing and shipping"}
          {currentStep === 3 && "Set up payment terms and billing preferences"}
          {currentStep === 4 && "Review your information before submitting"}
        </p>
      </CardHeader>

      <CardContent>
        <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <FormField label="Customer Name" required error={errors.name} helpText="This will appear on invoices and reports">
              <Input
                placeholder="Acme Corporation"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : formData.name.length >= 2 ? 'border-green-500' : ''}
              />
            </FormField>

            <FormField label="Customer Type" required>
              <RadioGroup value={formData.type} onValueChange={(value) => handleFieldChange('type', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business">Business/Company</Label>
                </div>
              </RadioGroup>
            </FormField>

            <FormField label="Email Address" required error={errors.email} helpText="Used for invoice delivery and communication">
              <Input
                type="email"
                placeholder="contact@acme.com"
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : validateEmail(formData.email) ? 'border-green-500' : ''}
              />
            </FormField>

            <FormField label="Phone Number" helpText="Include country code for international customers">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
            </FormField>
          </div>
        )}

        {/* Step 2: Address Information */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <FormField label="Street Address">
              <Input
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
              />
            </FormField>

            <FormField label="Address Line 2" helpText="Apartment, suite, unit, building, floor, etc.">
              <Input
                placeholder="Suite 100, Floor 2"
                value={formData.address2}
                onChange={(e) => handleFieldChange('address2', e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City">
                <Input
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                />
              </FormField>

              <FormField label="State/Province">
                <Input
                  placeholder="NY"
                  value={formData.state}
                  onChange={(e) => handleFieldChange('state', e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Postal/ZIP Code">
                <Input
                  placeholder="10001"
                  value={formData.postalCode}
                  onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                />
              </FormField>

              <FormField label="Country">
                <Select value={formData.country} onValueChange={(value) => handleFieldChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    <SelectItem value="au">Australia</SelectItem>
                    <SelectItem value="mw">Malawi</SelectItem>
                    <SelectItem value="za">South Africa</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>
        )}

        {/* Step 3: Financial Details */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <FormField label="Tax ID / VAT Number" helpText="For tax reporting and invoice requirements">
              <Input
                placeholder="US: 12-3456789, EU: GB123456789"
                value={formData.taxId}
                onChange={(e) => handleFieldChange('taxId', e.target.value)}
              />
            </FormField>

            <FormField label="Payment Terms" helpText="Default payment deadline for invoices">
              <Select value={formData.paymentTerms} onValueChange={(value) => handleFieldChange('paymentTerms', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                  <SelectItem value="net_15">Net 15</SelectItem>
                  <SelectItem value="net_30">Net 30</SelectItem>
                  <SelectItem value="net_60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            <FormField label="Credit Limit" error={errors.creditLimit} helpText="Maximum outstanding balance allowed">
              <Input
                type="number"
                placeholder="5000.00"
                value={formData.creditLimit}
                onChange={(e) => handleFieldChange('creditLimit', e.target.value)}
              />
            </FormField>

            <FormField label="Discount Rate (%)" error={errors.discountRate} helpText="Default discount applied to invoices">
              <Input
                type="number"
                placeholder="5.00"
                min="0"
                max="100"
                value={formData.discountRate}
                onChange={(e) => handleFieldChange('discountRate', e.target.value)}
              />
            </FormField>

            <FormField label="Preferred Payment Methods" helpText="Methods this customer typically uses">
              <div className="space-y-2">
                {['Bank Transfer', 'Credit Card', 'Cash', 'Check', 'Mobile Money'].map((method) => (
                  <div key={method} className="flex items-center space-x-2">
                    <Checkbox
                      id={method}
                      checked={formData.paymentMethods.includes(method)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleFieldChange('paymentMethods', [...formData.paymentMethods, method]);
                        } else {
                          handleFieldChange('paymentMethods', formData.paymentMethods.filter(m => m !== method));
                        }
                      }}
                    />
                    <Label htmlFor={method}>{method}</Label>
                  </div>
                ))}
              </div>
            </FormField>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Basic Information</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>Edit</Button>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Name:</span> {formData.name}</p>
                <p><span className="text-gray-500">Type:</span> {formData.type}</p>
                <p><span className="text-gray-500">Email:</span> {formData.email}</p>
                {formData.phone && <p><span className="text-gray-500">Phone:</span> {formData.phone}</p>}
              </div>
            </div>

            {(formData.address || formData.city) && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Address</h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                </div>
                <div className="text-sm">
                  <p>{formData.address} {formData.address2}</p>
                  <p>{formData.city}, {formData.state} {formData.postalCode}</p>
                  <p>{formData.country}</p>
                </div>
              </div>
            )}

            {(formData.paymentTerms || formData.creditLimit) && (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Financial Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Payment Terms:</span> {formData.paymentTerms}</p>
                  {formData.creditLimit && <p><span className="text-gray-500">Credit Limit:</span> ${formData.creditLimit}</p>}
                  {formData.discountRate && <p><span className="text-gray-500">Discount:</span> {formData.discountRate}%</p>}
                </div>
              </div>
            )}

            <FormField label="Internal Notes" helpText="Private notes, not visible to customer">
              <Textarea
                placeholder="Add any internal notes about this customer..."
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
            {currentStep > 1 && currentStep < 4 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
            
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext} disabled={currentStep === 1 && (!formData.name || !formData.email)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button data-tour-id="customers-add" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" />
                Create Customer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}