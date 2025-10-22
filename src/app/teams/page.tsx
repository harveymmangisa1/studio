'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Mail, 
  User, 
  Briefcase, 
  Building, 
  Check, 
  AlertCircle,
  Users,
  UserPlus,
  Edit3,
  Shield,
  Clock,
  Save,
  Download,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Star,
  Crown,
  Zap,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

const STORAGE_KEY = 'teamMemberFormDraft';

// Enhanced Progress Bar with steps
const ProgressBar = ({ currentStep, totalSteps, steps }) => (
  <div className="space-y-4 mb-8">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add Team Member</h2>
        <p className="text-gray-600">{steps[currentStep - 1]?.description}</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </div>
        <div className="text-xs text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>

    {/* Step Indicators */}
    <div className="flex justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-col items-center flex-1">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2
            transition-all duration-300
            ${currentStep > index + 1 
              ? 'bg-green-500 text-white' 
              : currentStep === index + 1
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {currentStep > index + 1 ? <Check className="w-4 h-4" /> : index + 1}
          </div>
          <span className={`
            text-xs font-medium text-center
            ${currentStep >= index + 1 ? 'text-gray-900' : 'text-gray-500'}
          `}>
            {step.title}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const FormSection = ({ title, description, children, status }) => (
  <Card className="shadow-lg border-0">
    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            {title}
            {status === 'completed' && (
              <Check className="w-5 h-5 text-green-500" />
            )}
          </CardTitle>
          {description && (
            <CardDescription className="text-base">{description}</CardDescription>
          )}
        </div>
        {status && (
          <div className={`
            px-3 py-1 rounded-full text-xs font-medium
            ${status === 'completed' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
            }
          `}>
            {status === 'completed' ? 'Completed' : 'In Progress'}
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      {children}
    </CardContent>
  </Card>
);

const FormField = ({ label, children, error, required, helpText, icon: Icon }) => (
  <div className="space-y-2">
    <Label className="font-semibold text-gray-900 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {label} 
      {required && <span className="text-red-500">*</span>}
    </Label>
    <div>{children}</div>
    {helpText && (
      <p className="text-sm text-gray-500">{helpText}</p>
    )}
    {error && (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" /> 
        {error}
      </p>
    )}
  </div>
);

const RoleBadge = ({ role, size = 'md' }) => {
  const roleConfig = {
    admin: { 
      label: 'Administrator', 
      class: 'bg-red-100 text-red-700 border-red-200',
      icon: Crown 
    },
    manager: { 
      label: 'Manager', 
      class: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Shield 
    },
    editor: { 
      label: 'Editor', 
      class: 'bg-green-100 text-green-700 border-green-200',
      icon: Edit3 
    },
    viewer: { 
      label: 'Viewer', 
      class: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: Eye 
    }
  };

  const config = roleConfig[role] || roleConfig.viewer;
  const Icon = config.icon;
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`
      inline-flex items-center gap-1 rounded-full border font-medium
      ${config.class} ${sizeClass}
    `}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const PermissionCard = ({ title, description, permissions, selectedPermissions, onPermissionChange }) => (
  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
    <div>
      <h4 className="font-semibold text-gray-900 capitalize">{title}</h4>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {permissions.map(permission => (
        <div key={permission} className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:border-blue-300 transition-colors">
          <Checkbox 
            id={permission} 
            checked={selectedPermissions.includes(permission)}
            onCheckedChange={(checked) => onPermissionChange(permission, checked)}
          />
          <Label htmlFor={permission} className="flex-1 text-sm cursor-pointer">
            <div className="font-medium capitalize">{permission.split(':')[1] || permission.split(':')[0]}</div>
            <div className="text-gray-500 text-xs">{permission}</div>
          </Label>
        </div>
      ))}
    </div>
  </div>
);

export function EnhancedTeamMemberForm({ initialData = null, onSuccess, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'viewer',
    department: 'general',
    permissions: [],
    sendInvite: true,
    startDate: '',
    notes: '',
    salary: '',
    employmentType: 'full-time'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Add personal and contact information' },
    { id: 2, title: 'Role & Access', description: 'Set permissions and access levels' },
    { id: 3, title: 'Review & Send', description: 'Confirm details and send invitation' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const draft = localStorage.getItem(STORAGE_KEY);
      if (draft) {
        const confirmRestore = window.confirm(
          'We found an unsaved draft. Would you like to restore it?'
        );
        if (confirmRestore) {
          setFormData(JSON.parse(draft));
          setHasUnsavedChanges(true);
        }
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, hasUnsavedChanges]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep = (step: number) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName?.trim()) newErrors.fullName = "Full name is required";
      else if (formData.fullName.length < 2) newErrors.fullName = "Name must be at least 2 characters";
      
      if (!formData.email) newErrors.email = "Email is required";
      else if (!validateEmail(formData.email)) newErrors.email = "Invalid email format";
      
      if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
        newErrors.phone = "Invalid phone number format";
      }
    }
    
    if (step === 2) {
      if (!formData.role) newErrors.role = "Please select a role";
      if (formData.permissions.length === 0 && formData.role === 'viewer') {
        newErrors.permissions = "Please select at least one permission";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (validateStep(1) && validateStep(2)) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      onSuccess(formData);
      localStorage.removeItem(STORAGE_KEY);
      setHasUnsavedChanges(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePermissionChange = (permission, checked) => {
    handleFieldChange('permissions', 
      checked 
        ? [...formData.permissions, permission]
        : formData.permissions.filter(p => p !== permission)
    );
  };

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const roles = ['admin', 'manager', 'editor', 'viewer'];
  const departments = [
    { value: 'engineering', label: 'Engineering', icon: Zap },
    { value: 'sales', label: 'Sales', icon: Users },
    { value: 'marketing', label: 'Marketing', icon: Eye },
    { value: 'support', label: 'Customer Support', icon: Shield },
    { value: 'general', label: 'General', icon: Building }
  ];

  const allPermissions = {
    inventory: {
      title: 'Inventory Management',
      description: 'Manage products, stock levels, and inventory',
      permissions: ['view:inventory', 'edit:inventory', 'delete:inventory', 'manage:suppliers']
    },
    sales: {
      title: 'Sales & Orders',
      description: 'Access sales data and order management',
      permissions: ['view:sales', 'edit:sales', 'delete:sales', 'process:refunds']
    },
    billing: {
      title: 'Billing & Finance',
      description: 'Financial operations and billing management',
      permissions: ['view:billing', 'manage:billing', 'process:payments', 'view:reports']
    },
    settings: {
      title: 'System Settings',
      description: 'Application configuration and settings',
      permissions: ['view:settings', 'edit:settings', 'manage:users', 'view:audit']
    }
  };

  const getRolePermissions = (role: string) => {
    const rolePermissions = {
      admin: Object.values(allPermissions).flatMap(group => group.permissions),
      manager: ['view:inventory', 'edit:inventory', 'view:sales', 'edit:sales', 'view:billing', 'view:reports'],
      editor: ['view:inventory', 'edit:inventory', 'view:sales'],
      viewer: ['view:inventory', 'view:sales']
    };
    return rolePermissions[role] || [];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <ProgressBar 
        currentStep={currentStep} 
        totalSteps={steps.length}
        steps={steps}
      />

      {currentStep === 1 && (
        <FormSection 
          title="Personal Information" 
          description="Basic details and contact information for the team member"
          status={getStepStatus(1)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Full Name" 
              required 
              error={errors.fullName}
              helpText="As it should appear in the system"
              icon={User}
            >
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  placeholder="e.g., Sarah Johnson" 
                  value={formData.fullName}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  className="pl-10 text-lg py-3"
                />
              </div>
            </FormField>
            
            <FormField 
              label="Email Address" 
              required 
              error={errors.email}
              helpText="Official company email address"
              icon={Mail}
            >
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input 
                  type="email"
                  placeholder="e.g., sarah@company.com" 
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="pl-10 text-lg py-3"
                />
              </div>
            </FormField>

            <FormField 
              label="Phone Number" 
              error={errors.phone}
              helpText="Optional contact number"
              icon={Clock}
            >
              <Input 
                type="tel"
                placeholder="e.g., +1 (555) 123-4567" 
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="text-lg py-3"
              />
            </FormField>

            <FormField 
              label="Department" 
              error={errors.department}
              helpText="Primary department or team"
              icon={Building}
            >
              <Select value={formData.department} onValueChange={(val) => handleFieldChange('department', val)}>
                <SelectTrigger className="text-lg py-3">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(({ value, label, icon: Icon }) => (
                    <SelectItem key={value} value={value} className="flex items-center gap-2 py-2">
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Advanced Fields */}
          <div className="border-t pt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              Additional Information {showAdvanced ? '(Optional)' : ''}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <FormField label="Start Date" helpText="Employment start date">
                  <Input 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFieldChange('startDate', e.target.value)}
                    className="py-3"
                  />
                </FormField>

                <FormField label="Employment Type" helpText="Full-time or part-time">
                  <Select value={formData.employmentType} onValueChange={(val) => handleFieldChange('employmentType', val)}>
                    <SelectTrigger className="py-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contractor">Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Salary" helpText="Annual salary (optional)">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number"
                      placeholder="e.g., 75000"
                      value={formData.salary}
                      onChange={(e) => handleFieldChange('salary', e.target.value)}
                      className="pl-8 py-3"
                    />
                  </div>
                </FormField>

                <FormField label="Notes" helpText="Additional information">
                  <Textarea 
                    placeholder="Any additional notes or information..."
                    value={formData.notes}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    rows={3}
                  />
                </FormField>
              </div>
            )}
          </div>
        </FormSection>
      )}

      {currentStep === 2 && (
        <FormSection 
          title="Roles & Permissions" 
          description="Assign access levels and system permissions"
          status={getStepStatus(2)}
        >
          <div className="space-y-8">
            <FormField label="Team Role" error={errors.role}>
              <RadioGroup 
                value={formData.role} 
                onValueChange={(val) => {
                  handleFieldChange('role', val);
                  // Auto-set permissions based on role
                  handleFieldChange('permissions', getRolePermissions(val));
                }} 
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                {roles.map(role => (
                  <div key={role}>
                    <RadioGroupItem value={role} id={role} className="sr-only" />
                    <Label 
                      htmlFor={role} 
                      className={`
                        flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all
                        ${formData.role === role 
                          ? 'border-blue-600 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <RoleBadge role={role} />
                      <p className="text-sm text-gray-600 mt-2 text-center">
                        {role === 'admin' && 'Full system access'}
                        {role === 'manager' && 'Manage teams and data'}
                        {role === 'editor' && 'Edit content and data'}
                        {role === 'viewer' && 'View-only access'}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormField>
            
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Permissions</h3>
              <p className="text-gray-600 mb-6">
                Fine-tune access by selecting specific permissions. Role-based permissions are pre-selected.
              </p>
              
              <div className="space-y-6">
                {Object.entries(allPermissions).map(([key, group]) => (
                  <PermissionCard
                    key={key}
                    title={group.title}
                    description={group.description}
                    permissions={group.permissions}
                    selectedPermissions={formData.permissions}
                    onPermissionChange={handlePermissionChange}
                  />
                ))}
              </div>
              
              {errors.permissions && (
                <div className="flex items-center gap-2 text-red-500 mt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.permissions}</span>
                </div>
              )}
            </div>
          </div>
        </FormSection>
      )}

      {currentStep === 3 && (
        <FormSection 
          title="Review & Finish" 
          description="Confirm all details before adding the team member"
          status={getStepStatus(3)}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Full Name:</span>
                    <p className="text-gray-900">{formData.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Email:</span>
                    <p className="text-gray-900">{formData.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Phone:</span>
                    <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Department:</span>
                    <p className="text-gray-900 capitalize">{formData.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Role:</span>
                    <p className="text-gray-900"><RoleBadge role={formData.role} size="sm" /></p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Permissions:</span>
                    <p className="text-gray-900">{formData.permissions.length} selected</p>
                  </div>
                </div>
              </div>

              {/* Permissions Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Summary</h3>
                <div className="space-y-3">
                  {Object.entries(allPermissions).map(([key, group]) => {
                    const groupPermissions = formData.permissions.filter(p => 
                      group.permissions.includes(p)
                    );
                    if (groupPermissions.length === 0) return null;
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{key}</h4>
                          <p className="text-sm text-gray-600">{groupPermissions.length} permissions</p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-wrap gap-1 justify-end">
                            {groupPermissions.slice(0, 3).map(perm => (
                              <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {perm.split(':')[1]}
                              </span>
                            ))}
                            {groupPermissions.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{groupPermissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invitation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField label="Send Invitation Email">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Checkbox 
                        id="sendInvite"
                        checked={formData.sendInvite}
                        onCheckedChange={(checked) => handleFieldChange('sendInvite', checked)}
                      />
                      <Label htmlFor="sendInvite" className="flex-1">
                        <div className="font-medium">Send invitation email</div>
                        <div className="text-sm text-gray-600">
                          {formData.email} will receive setup instructions
                        </div>
                      </Label>
                    </div>
                  </FormField>

                  <div className="space-y-2">
                    <Label>Invitation Expires</Label>
                    <Select defaultValue="7">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-amber-600 text-sm p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  You have unsaved changes
                </div>
              )}
            </div>
          </div>
        </FormSection>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 border-t">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          {hasUnsavedChanges && (
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
                alert('Draft saved successfully!');
              }}
              className="text-blue-600 hover:text-blue-700"
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
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {currentStep < 3 ? (
            <Button 
              onClick={handleNext}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg min-w-32"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Adding...' : (initialData ? 'Update Member' : 'Add Team Member')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Team Member List with improved UX
export const TeamMemberList = ({ members, onEdit, onDelete, onAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name': return a.fullName.localeCompare(b.fullName);
      case 'role': return a.role.localeCompare(b.role);
      case 'department': return a.department.localeCompare(b.department);
      default: return 0;
    }
  });

  const stats = {
    total: members.length,
    admin: members.filter(m => m.role === 'admin').length,
    manager: members.filter(m => m.role === 'manager').length,
    active: members.length // In real app, you'd have active/inactive status
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-blue-100 text-sm">Total Members</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.admin}</div>
            <div className="text-green-100 text-sm">Administrators</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.manager}</div>
            <div className="text-purple-100 text-sm">Managers</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500 to-gray-600 text-white">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-gray-100 text-sm">Active</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Team Members ({members.length})
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your team members and their permissions
              </p>
            </div>
            
            <Button 
              onClick={onAdd}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search team members by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="role">Sort by Role</SelectItem>
                  <SelectItem value="department">Sort by Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {filteredMembers.map((member) => (
              <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {member.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                        <RoleBadge role={member.role} />
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {member.department && (
                          <span className="text-xs text-gray-400 capitalize">
                            {member.department}
                          </span>
                        )}
                        {member.phone && (
                          <span className="text-xs text-gray-400">{member.phone}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(member)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(member)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                No team members found
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {searchTerm || filterRole !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by inviting your first team member'
                }
              </p>
              {!searchTerm && filterRole === 'all' && (
                <Button onClick={onAdd} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Your First Member
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced confirmation dialog with progressive UX
export const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false
}) => {
  if (!isOpen) return null;

  const variantConfig = {
    destructive: {
      icon: AlertCircle,
      iconBg: 'bg-red-100 text-red-600',
      button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    },
    warning: {
      icon: AlertCircle,
      iconBg: 'bg-amber-100 text-amber-600',
      button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
    },
    info: {
      icon: Users,
      iconBg: 'bg-blue-100 text-blue-600',
      button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    }
  };

  const config = variantConfig[variant] || variantConfig.destructive;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="max-w-md w-full border-0 shadow-2xl animate-in zoom-in duration-200">
        <CardContent className="p-6 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${config.iconBg}`}>
            <Icon className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {message}
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 ${config.button}`}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? 'Processing...' : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Usage example with enhanced state management
export function TeamManagementDashboard() {
  const [members, setMembers] = useState([
    {
      id: 1,
      fullName: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'admin',
      department: 'engineering',
      phone: '+1 (555) 123-4567',
      startDate: '2023-01-15',
      employmentType: 'full-time'
    },
    {
      id: 2,
      fullName: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'manager',
      department: 'sales',
      phone: '+1 (555) 987-6543',
      startDate: '2023-03-20',
      employmentType: 'full-time'
    },
    {
      id: 3,
      fullName: 'Emma Davis',
      email: 'emma.davis@company.com',
      role: 'editor',
      department: 'marketing',
      phone: '+1 (555) 456-7890',
      startDate: '2023-06-10',
      employmentType: 'full-time'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveMember = (memberData) => {
    if (editingMember) {
      setMembers(members.map(m => m.id === editingMember.id 
        ? { ...m, ...memberData }
        : m
      ));
    } else {
      setMembers([...members, { ...memberData, id: Date.now() }]);
    }
    setShowForm(false);
    setEditingMember(null);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = (member) => {
    setDeleteConfirm(member);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setMembers(members.filter(m => m.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {!showForm ? (
          <TeamMemberList 
            members={members}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={() => {
              setEditingMember(null);
              setShowForm(true);
            }}
          />
        ) : (
          <EnhancedTeamMemberForm
            initialData={editingMember}
            onSuccess={handleSaveMember}
            onCancel={() => {
              setShowForm(false);
              setEditingMember(null);
            }}
          />
        )}

        <ConfirmationDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          title="Delete Team Member"
          message={`Are you sure you want to remove ${deleteConfirm?.fullName} from your team? This action cannot be undone.`}
          confirmText="Delete Member"
          variant="destructive"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
}

export default TeamManagementDashboard;