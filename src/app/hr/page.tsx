'use client'
import React, { useState, useEffect } from 'react';
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
  Users, Plus, Search, Filter, Edit, Trash2, MoreVertical
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

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  employmentType: string;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
}

interface EmployeeFormData {
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

interface ProgressiveEmployeeFormProps {
  onSuccess?: (data: EmployeeFormData) => void;
  onCancel?: () => void;
  initialData?: EmployeeFormData | null;
}

// Employee Dashboard Component
const EmployeeDashboard = ({ 
  employees, 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee 
}: { 
  employees: Employee[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    pending: employees.filter(e => e.status === 'pending').length,
    departments: [...new Set(employees.map(e => e.department))].length
  };

  const getStatusBadge = (status: Employee['status']) => {
    const config = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactive', class: 'bg-red-100 text-red-800' },
      pending: { label: 'Pending', class: 'bg-amber-100 text-amber-800' }
    };
    const { label, class: className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-blue-100 text-sm">Total Employees</div>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-green-100 text-sm">Active</div>
              </div>
              <Check className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-amber-100 text-sm">Pending</div>
              </div>
              <AlertCircle className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.departments}</div>
                <div className="text-purple-100 text-sm">Departments</div>
              </div>
              <Briefcase className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Employee Directory
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your team members and their information
              </p>
            </div>
            
            <Button 
              onClick={onAddEmployee}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search employees by name, email, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        {getStatusBadge(employee.status)}
                      </div>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-400 capitalize">
                          {employee.jobTitle}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">
                          {employee.department}
                        </span>
                        <span className="text-xs text-gray-400">
                          Since {new Date(employee.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEmployee(employee)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEmployee(employee)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">
                No employees found
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first employee'
                }
              </p>
              {!searchTerm && filterDepartment === 'all' && filterStatus === 'all' && (
                <Button onClick={onAddEmployee} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Employee
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

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

// Progressive Employee Form Component
const ProgressiveEmployeeForm = ({ onSuccess, onCancel, initialData }: ProgressiveEmployeeFormProps) => {
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
              {/* Step 2 form content */}
              {/* ... (previous Step 2 content) */}
            </div>
          )}

          {/* Step 3: Compensation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Step 3 form content */}
              {/* ... (previous Step 3 content) */}
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Step 4 form content */}
              {/* ... (previous Step 4 content) */}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Step 5 review content */}
              {/* ... (previous Step 5 content) */}
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

// Main HR Page Component
export default function HRPage() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      jobTitle: 'Senior Software Engineer',
      department: 'engineering',
      employmentType: 'full_time',
      startDate: '2023-01-15',
      status: 'active'
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike.chen@company.com',
      phone: '+1 (555) 987-6543',
      jobTitle: 'Sales Manager',
      department: 'sales',
      employmentType: 'full_time',
      startDate: '2023-03-20',
      status: 'active'
    },
    {
      id: '3',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@company.com',
      phone: '+1 (555) 456-7890',
      jobTitle: 'Marketing Specialist',
      department: 'marketing',
      employmentType: 'full_time',
      startDate: '2023-06-10',
      status: 'pending'
    }
  ]);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setCurrentView('form');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setCurrentView('form');
  };

  const handleDeleteEmployee = (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      setEmployees(employees.filter(emp => emp.id !== employee.id));
    }
  };

  const handleFormSuccess = (formData: EmployeeFormData) => {
    if (editingEmployee) {
      // Update existing employee
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? {
              ...emp,
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              jobTitle: formData.jobTitle,
              department: formData.department,
              employmentType: formData.employmentType,
              startDate: formData.startDate
            }
          : emp
      ));
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: Date.now().toString(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        jobTitle: formData.jobTitle,
        department: formData.department,
        employmentType: formData.employmentType,
        startDate: formData.startDate,
        status: 'pending'
      };
      setEmployees([...employees, newEmployee]);
    }
    setCurrentView('dashboard');
    setEditingEmployee(null);
  };

  const handleFormCancel = () => {
    setCurrentView('dashboard');
    setEditingEmployee(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {currentView === 'dashboard' ? (
          <EmployeeDashboard
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        ) : (
          <ProgressiveEmployeeForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            initialData={editingEmployee ? {
              // Convert Employee to EmployeeFormData
              firstName: editingEmployee.firstName,
              lastName: editingEmployee.lastName,
              email: editingEmployee.email,
              phone: editingEmployee.phone,
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
              employeeNumber: '',
              jobTitle: editingEmployee.jobTitle,
              department: editingEmployee.department,
              employmentType: editingEmployee.employmentType,
              startDate: editingEmployee.startDate,
              reportingManager: '',
              workLocation: '',
              baseSalary: '',
              currency: 'USD',
              paymentFrequency: 'monthly',
              paymentMethod: 'bank_transfer',
              bankName: '',
              accountNumber: '',
              routingNumber: '',
              taxId: '',
              contractFile: null,
              idDocumentFile: null,
              resumeFile: null,
              certificatesFiles: [],
              notes: ''
            } : null}
          />
        )}
      </div>
    </div>
  );
}