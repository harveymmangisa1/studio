'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, Palette, Receipt, DollarSign, Shield, 
  Upload, X, Save, AlertCircle, CheckCircle, Image,
  ShoppingCart, Pill, Wrench, Utensils, Briefcase, Store,
  Users, MapPin, Plus, Trash2, Building, Globe, Calendar
} from 'lucide-react';

const INDUSTRY_CONFIGS = {
  retail: {
    name: 'Retail',
    icon: ShoppingCart,
    departments: ['Sales', 'Inventory', 'Customer Service', 'Marketing', 'Store Operations'],
    fields: {
      returnPolicy: { label: 'Return Policy (Days)', type: 'number', default: 30, helpText: 'Number of days for returns' },
      loyaltyProgram: { label: 'Loyalty Program', type: 'boolean', default: false },
      multipleLocations: { label: 'Multiple Store Locations', type: 'boolean', default: false },
      warrantyPeriod: { label: 'Default Warranty (Months)', type: 'number', default: 12 }
    },
    taxFields: ['salesTax', 'vatNumber'],
    compliance: ['Consumer Protection Act', 'Sales Tax Compliance']
  },
  
  pharmacy: {
    name: 'Pharmacy/Pharmaceutical',
    icon: Pill,
    departments: ['Dispensary', 'Prescription Management', 'Inventory Control', 'Quality Assurance', 'Customer Consultation'],
    fields: {
      pharmacyLicense: { label: 'Pharmacy License Number', type: 'text', required: true, helpText: 'Required for pharmaceutical sales' },
      pharmacistName: { label: 'Licensed Pharmacist', type: 'text', required: true },
      pharmacistLicense: { label: 'Pharmacist License Number', type: 'text', required: true },
      controlledSubstanceLicense: { label: 'DEA/Controlled Substance License', type: 'text', helpText: 'Required for controlled medications' },
      expiryTracking: { label: 'Enable Expiry Date Tracking', type: 'boolean', default: true },
      batchTracking: { label: 'Enable Batch/Lot Tracking', type: 'boolean', default: true },
      prescriptionRequired: { label: 'Prescription Management', type: 'boolean', default: true },
      temperatureControl: { label: 'Cold Chain Storage Required', type: 'boolean', default: false, helpText: 'For vaccines and biologics' }
    },
    taxFields: ['vatNumber', 'healthTax'],
    compliance: ['FDA Regulations', 'HIPAA Compliance', 'Drug Enforcement Administration', 'Good Distribution Practice (GDP)']
  },
  
  restaurant: {
    name: 'Restaurant/Food Service',
    icon: Utensils,
    departments: ['Kitchen', 'Front of House', 'Bar', 'Delivery', 'Catering', 'Management'],
    fields: {
      foodLicense: { label: 'Food Service License', type: 'text', required: true },
      healthPermit: { label: 'Health Department Permit', type: 'text', required: true },
      alcoholLicense: { label: 'Liquor License Number', type: 'text', helpText: 'If serving alcohol' },
      tableTurnaroundTime: { label: 'Avg Table Turnover (min)', type: 'number', default: 45 },
      deliveryService: { label: 'Delivery Service', type: 'boolean', default: false },
      allergenTracking: { label: 'Allergen Tracking', type: 'boolean', default: true },
      menuRotation: { label: 'Seasonal Menu Changes', type: 'boolean', default: false }
    },
    taxFields: ['salesTax', 'alcoholTax', 'serviceTax'],
    compliance: ['Food Safety Regulations', 'Health Department Standards', 'Alcohol Control Board']
  },
  
  wholesale: {
    name: 'Wholesale Distribution',
    icon: Store,
    departments: ['Procurement', 'Warehouse', 'Sales', 'Logistics', 'Account Management'],
    fields: {
      minimumOrder: { label: 'Minimum Order Amount', type: 'number', default: 0, helpText: 'Minimum order value' },
      bulkPricing: { label: 'Bulk Pricing Tiers', type: 'boolean', default: true },
      creditTerms: { label: 'Default Credit Terms (Days)', type: 'number', default: 30 },
      tradeDiscount: { label: 'Default Trade Discount (%)', type: 'number', default: 0 },
      dropShipping: { label: 'Drop Shipping Available', type: 'boolean', default: false }
    },
    taxFields: ['vatNumber', 'resaleCertificate'],
    compliance: ['Trade License', 'Import/Export Permits', 'Wholesale Distribution License']
  },
  
  services: {
    name: 'Professional Services',
    icon: Briefcase,
    departments: ['Consulting', 'Client Services', 'Project Management', 'Administration', 'Business Development'],
    fields: {
      professionalLicense: { label: 'Professional License Number', type: 'text', helpText: 'If required for your profession' },
      hourlyRate: { label: 'Standard Hourly Rate', type: 'number', default: 0 },
      projectBased: { label: 'Project-Based Billing', type: 'boolean', default: true },
      retainerAgreements: { label: 'Retainer Agreements', type: 'boolean', default: false },
      consultationFee: { label: 'Consultation Fee', type: 'number', default: 0 }
    },
    taxFields: ['vatNumber', 'serviceTax'],
    compliance: ['Professional License', 'Service Contract Standards', 'Data Protection']
  },
  
  manufacturing: {
    name: 'Manufacturing',
    icon: Wrench,
    departments: ['Production', 'Quality Control', 'Supply Chain', 'Maintenance', 'Research & Development'],
    fields: {
      manufacturingLicense: { label: 'Manufacturing License', type: 'text', required: true },
      qualityCertification: { label: 'Quality Certification (ISO, etc.)', type: 'text', helpText: 'e.g., ISO 9001' },
      productionCapacity: { label: 'Monthly Production Capacity', type: 'number', default: 0 },
      leadTime: { label: 'Standard Lead Time (Days)', type: 'number', default: 14 },
      rawMaterialTracking: { label: 'Raw Material Tracking', type: 'boolean', default: true },
      qualityControl: { label: 'Quality Control Process', type: 'boolean', default: true }
    },
    taxFields: ['vatNumber', 'exciseTax', 'importDuty'],
    compliance: ['Manufacturing License', 'Environmental Permits', 'Quality Standards (ISO)', 'Safety Regulations']
  }
};

const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Africa/Johannesburg',
  'Africa/Blantyre', 'Australia/Sydney'
];

const FormField = ({ label, error, children, helpText, required }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
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

const LogoUpload = ({ logo, onLogoChange, onLogoRemove }) => (
  <div className="space-y-3">
    <Label className="text-sm font-medium text-gray-700">Company Logo</Label>
    
    {!logo ? (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <label className="cursor-pointer">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700">Upload Logo</span>
            <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg,image/jpg"
            onChange={onLogoChange}
          />
        </label>
      </div>
    ) : (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">company-logo.png</p>
            <p className="text-xs text-gray-500 mb-3">Uploaded</p>
            <Button variant="outline" size="sm" onClick={onLogoRemove}>
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default function DynamicSettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('retail');
  const [settings, setSettings] = useState({
    // Company Info
    companyName: '',
    legalName: '',
    industry: 'retail',
    foundedDate: '',
    taxId: '',
    registrationNumber: '',
    email: '',
    phone: '',
    website: '',
    
    // Headquarters
    hqAddress: '',
    hqCity: '',
    hqState: '',
    hqPostalCode: '',
    hqCountry: '',
    timezone: 'UTC',
    
    // Departments & Services
    departments: [],
    
    // Initial User (Setup Administrator)
    adminFirstName: '',
    adminLastName: '',
    adminEmail: '',
    adminPhone: '',
    adminTitle: 'System Administrator',
    
    // Branding
    logo: null,
    primaryColor: '#171717',
    accentColor: '#3B82F6',
    
    // Documents
    invoicePrefix: 'INV',
    quotePrefix: 'QUO',
    purchaseOrderPrefix: 'PO',
    invoiceFooter: '',
    termsAndConditions: '',
    
    // Financial
    currency: 'USD',
    taxRate: 0,
    taxType: 'inclusive',
    fiscalYearEnd: '12-31',
    fiscalYearStart: '01-01',
    
    // Operational
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    
    // Security
    sessionTimeout: 30,
    passwordExpiry: 90,
    twoFactorAuth: false,
    
    // System
    languagePreference: 'en',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    
    industryFields: {}
  });

  useEffect(() => {
    const config = INDUSTRY_CONFIGS[selectedIndustry];
    const defaultFields = {};
    
    if (config?.fields) {
      Object.entries(config.fields).forEach(([key, fieldConfig]) => {
        defaultFields[key] = fieldConfig.default ?? '';
      });
    }
    
    // Set default departments based on industry
    const defaultDepartments = config?.departments?.slice(0, 3).map((name, idx) => ({
      id: `dept-${idx}`,
      name,
      description: '',
      headOfDepartment: '',
      active: true
    })) || [];
    
    setSettings(prev => ({
      ...prev,
      industry: selectedIndustry,
      departments: prev.departments.length === 0 ? defaultDepartments : prev.departments,
      industryFields: { ...defaultFields, ...prev.industryFields }
    }));
  }, [selectedIndustry]);

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleIndustryFieldChange = (field, value) => {
    setSettings({
      ...settings,
      industryFields: { ...settings.industryFields, [field]: value }
    });
    setHasChanges(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      handleChange('logo', file);
    }
  };

  const addDepartment = () => {
    const newDept = {
      id: `dept-${Date.now()}`,
      name: '',
      description: '',
      headOfDepartment: '',
      active: true
    };
    setSettings({
      ...settings,
      departments: [...settings.departments, newDept]
    });
    setHasChanges(true);
  };

  const updateDepartment = (id, field, value) => {
    setSettings({
      ...settings,
      departments: settings.departments.map(dept =>
        dept.id === id ? { ...dept, [field]: value } : dept
      )
    });
    setHasChanges(true);
  };

  const removeDepartment = (id) => {
    setSettings({
      ...settings,
      departments: settings.departments.filter(dept => dept.id !== id)
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    const config = INDUSTRY_CONFIGS[selectedIndustry];
    let hasErrors = false;
    
    if (config?.fields) {
      Object.entries(config.fields).forEach(([key, fieldConfig]) => {
        if (fieldConfig.required && !settings.industryFields[key]) {
          hasErrors = true;
        }
      });
    }
    
    if (hasErrors) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Here you would call your API to save settings
    console.log('Saving settings:', settings);

    setShowSuccess(true);
    setHasChanges(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const renderIndustryField = (key, fieldConfig) => {
    const value = settings.industryFields[key];
    
    if (fieldConfig.type === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldConfig.helpText && (
              <p className="text-xs text-gray-500 mt-1">{fieldConfig.helpText}</p>
            )}
          </div>
          <button
            onClick={() => handleIndustryFieldChange(key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-gray-900' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      );
    }
    
    return (
      <FormField 
        key={key}
        label={fieldConfig.label} 
        helpText={fieldConfig.helpText}
        required={fieldConfig.required}
      >
        <Input
          type={fieldConfig.type}
          value={value || ''}
          onChange={(e) => handleIndustryFieldChange(key, e.target.value)}
          placeholder={fieldConfig.helpText}
        />
      </FormField>
    );
  };

  const currentIndustryConfig = INDUSTRY_CONFIGS[selectedIndustry];
  const IndustryIcon = currentIndustryConfig?.icon || Building2;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Setup</h1>
              <p className="mt-2 text-sm text-gray-500">
                Complete your business profile and configure system settings
              </p>
            </div>
            <div className="flex gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges}
                className="bg-gray-900 hover:bg-gray-800"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Settings saved successfully!</p>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-gray-200 w-full justify-start bg-white rounded-lg p-1">
            <TabsTrigger value="business" className="gap-2">
              <Building2 className="w-4 h-4" />
              Company Info
            </TabsTrigger>
            <TabsTrigger value="headquarters" className="gap-2">
              <MapPin className="w-4 h-4" />
              Headquarters
            </TabsTrigger>
            <TabsTrigger value="departments" className="gap-2">
              <Users className="w-4 h-4" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="administrator" className="gap-2">
              <Shield className="w-4 h-4" />
              Administrator
            </TabsTrigger>
            <TabsTrigger value="industry" className="gap-2">
              <IndustryIcon className="w-4 h-4" />
              Industry
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="operational" className="gap-2">
              <Calendar className="w-4 h-4" />
              Operations
            </TabsTrigger>
          </TabsList>

          {/* Business Info Tab */}
          <TabsContent value="business" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Company Name" required>
                    <Input
                      value={settings.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Acme Corporation"
                    />
                  </FormField>

                  <FormField label="Legal Business Name">
                    <Input
                      value={settings.legalName}
                      onChange={(e) => handleChange('legalName', e.target.value)}
                      placeholder="Acme Corporation Ltd."
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Industry Type" required>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Founded Date">
                    <Input
                      type="date"
                      value={settings.foundedDate}
                      onChange={(e) => handleChange('foundedDate', e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Tax ID / EIN" required>
                    <Input
                      value={settings.taxId}
                      onChange={(e) => handleChange('taxId', e.target.value)}
                      placeholder="XX-XXXXXXX"
                    />
                  </FormField>

                  <FormField label="Business Registration Number">
                    <Input
                      value={settings.registrationNumber}
                      onChange={(e) => handleChange('registrationNumber', e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <FormField label="Email Address" required>
                      <Input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="info@company.com"
                      />
                    </FormField>

                    <FormField label="Phone Number" required>
                      <Input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </FormField>

                    <FormField label="Website">
                      <Input
                        type="url"
                        value={settings.website}
                        onChange={(e) => handleChange('website', e.target.value)}
                        placeholder="https://company.com"
                      />
                    </FormField>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Headquarters Tab */}
          <TabsContent value="headquarters" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-gray-700" />
                  <div>
                    <CardTitle className="text-lg">Headquarters Location</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Primary business location and administrative center
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FormField label="Street Address" required>
                  <Input
                    value={settings.hqAddress}
                    onChange={(e) => handleChange('hqAddress', e.target.value)}
                    placeholder="123 Main Street, Suite 100"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="City" required>
                    <Input
                      value={settings.hqCity}
                      onChange={(e) => handleChange('hqCity', e.target.value)}
                      placeholder="New York"
                    />
                  </FormField>

                  <FormField label="State / Province">
                    <Input
                      value={settings.hqState}
                      onChange={(e) => handleChange('hqState', e.target.value)}
                      placeholder="NY"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Postal Code" required>
                    <Input
                      value={settings.hqPostalCode}
                      onChange={(e) => handleChange('hqPostalCode', e.target.value)}
                      placeholder="10001"
                    />
                  </FormField>

                  <FormField label="Country" required>
                    <Select value={settings.hqCountry} onValueChange={(value) => handleChange('hqCountry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="mw">Malawi</SelectItem>
                        <SelectItem value="za">South Africa</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField label="Timezone" required helpText="Used for scheduling and time-based operations">
                  <Select value={settings.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Departments & Services</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Define your organizational structure and service areas
                    </p>
                  </div>
                  <Button onClick={addDepartment} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {settings.departments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No departments added yet</p>
                    <Button onClick={addDepartment} variant="outline" size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Department
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {settings.departments.map((dept, index) => (
                      <div key={dept.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {dept.name || 'New Department'}
                            </h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDepartment(dept.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Department Name" required>
                            <Input
                              value={dept.name}                               onChange={(e) => updateDepartment(dept.id, 'name', e.target.value)}
                              placeholder="e.g., Sales Department"
                            />
                          </FormField>
                          
                          <FormField label="Head of Department">
                            <Input
                              value={dept.headOfDepartment}
                              onChange={(e) => updateDepartment(dept.id, 'headOfDepartment', e.target.value)}
                              placeholder="Name of department head"
                            />
                          </FormField>
                        </div>
                        
                        <FormField label="Description & Functions" className="mt-3">
                          <Textarea
                            value={dept.description}
                            onChange={(e) => updateDepartment(dept.id, 'description', e.target.value)}
                            placeholder="Describe the department's responsibilities and functions..."
                            rows={3}
                          />
                        </FormField>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateDepartment(dept.id, 'active', !dept.active)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                dept.active ? 'bg-green-500' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  dept.active ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className="text-sm text-gray-600">
                              {dept.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            Department {index + 1} of {settings.departments.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentIndustryConfig?.departments && settings.departments.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      💡 Industry Department Suggestions
                    </h4>
                    <p className="text-xs text-blue-700 mb-2">
                      Based on your industry ({currentIndustryConfig.name}), consider adding these departments:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentIndustryConfig.departments
                        .filter(deptName => !settings.departments.some(d => d.name === deptName))
                        .map((deptName, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const newDept = {
                                id: `suggested-${Date.now()}-${idx}`,
                                name: deptName,
                                description: `${deptName} department for ${currentIndustryConfig.name.toLowerCase()} operations`,
                                headOfDepartment: '',
                                active: true
                              };
                              setSettings({
                                ...settings,
                                departments: [...settings.departments, newDept]
                              });
                              setHasChanges(true);
                            }}
                            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                          >
                            + Add {deptName}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Administrator Tab */}
          <TabsContent value="administrator" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-gray-700" />
                  <div>
                    <CardTitle className="text-lg">System Administrator</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Initial system administrator with full access rights
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 mb-1">
                        Primary System Administrator
                      </p>
                      <p className="text-xs text-amber-700">
                        This user will have full system access and will be based at the headquarters.
                        You can add more users after initial setup.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="First Name" required>
                    <Input
                      value={settings.adminFirstName}
                      onChange={(e) => handleChange('adminFirstName', e.target.value)}
                      placeholder="John"
                    />
                  </FormField>
                  
                  <FormField label="Last Name" required>
                    <Input
                      value={settings.adminLastName}
                      onChange={(e) => handleChange('adminLastName', e.target.value)}
                      placeholder="Doe"
                    />
                  </FormField>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <FormField label="Email Address" required>
                    <Input
                      type="email"
                      value={settings.adminEmail}
                      onChange={(e) => handleChange('adminEmail', e.target.value)}
                      placeholder="admin@company.com"
                    />
                  </FormField>
                  
                  <FormField label="Phone Number">
                    <Input
                      type="tel"
                      value={settings.adminPhone}
                      onChange={(e) => handleChange('adminPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </FormField>
                </div>
                
                <div className="mt-4">
                  <FormField label="Job Title" required>
                    <Select value={settings.adminTitle} onValueChange={(value) => handleChange('adminTitle', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="System Administrator">System Administrator</SelectItem>
                        <SelectItem value="IT Manager">IT Manager</SelectItem>
                        <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                        <SelectItem value="Business Owner">Business Owner</SelectItem>
                        <SelectItem value="General Manager">General Manager</SelectItem>
                        <SelectItem value="Finance Director">Finance Director</SelectItem>
                        <SelectItem value="Custom">Custom Title</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  
                  {settings.adminTitle === 'Custom' && (
                    <div className="mt-3">
                      <Input
                        value={settings.customAdminTitle || ''}
                        onChange={(e) => handleChange('customAdminTitle', e.target.value)}
                        placeholder="Enter custom job title"
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Administrator Access Summary</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Full system access and configuration rights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>User management and permissions control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>System settings and security configuration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Access to all departments and modules</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industry-Specific Tab */}
          <TabsContent value="industry" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <IndustryIcon className="w-6 h-6 text-gray-700" />
                  <div>
                    <CardTitle className="text-lg">{currentIndustryConfig.name} Settings</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure settings specific to your industry
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {currentIndustryConfig.fields && 
                  Object.entries(currentIndustryConfig.fields).map(([key, fieldConfig]) => 
                    renderIndustryField(key, fieldConfig)
                  )
                }

                {/* Compliance Requirements */}
                {currentIndustryConfig.compliance && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Industry Compliance Requirements</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {currentIndustryConfig.compliance.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-blue-900">
                            <Shield className="w-4 h-4 text-blue-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-blue-700 mt-3">
                        Ensure your business complies with these regulations. Some may require specific documentation.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Brand Identity & Documents</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <LogoUpload
                  logo={settings.logo}
                  onLogoChange={handleLogoChange}
                  onLogoRemove={() => handleChange('logo', null)}
                />

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Brand Colors</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Primary Color">
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.primaryColor}
                          onChange={(e) => handleChange('primaryColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </FormField>

                    <FormField label="Accent Color">
                      <div className="flex gap-3">
                        <Input
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) => handleChange('accentColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={settings.accentColor}
                          onChange={(e) => handleChange('accentColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </FormField>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Document Prefixes</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField label="Invoice Prefix">
                      <Input
                        value={settings.invoicePrefix}
                        onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                        className="text-center"
                      />
                    </FormField>
                    
                    <FormField label="Quote Prefix">
                      <Input
                        value={settings.quotePrefix}
                        onChange={(e) => handleChange('quotePrefix', e.target.value)}
                        className="text-center"
                      />
                    </FormField>
                    
                    <FormField label="Purchase Order Prefix">
                      <Input
                        value={settings.purchaseOrderPrefix}
                        onChange={(e) => handleChange('purchaseOrderPrefix', e.target.value)}
                        className="text-center"
                      />
                    </FormField>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    These prefixes will be used in document numbers (e.g., {settings.invoicePrefix}-001)
                  </p>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Document Content</h3>
                  <FormField label="Invoice Footer Text">
                    <Textarea
                      value={settings.invoiceFooter}
                      onChange={(e) => handleChange('invoiceFooter', e.target.value)}
                      rows={2}
                      placeholder="Thank you for your business!"
                    />
                  </FormField>

                  <FormField label="Terms and Conditions" className="mt-4">
                    <Textarea
                      value={settings.termsAndConditions}
                      onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                      rows={4}
                      placeholder="Payment terms, delivery terms, return policies, etc."
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Financial Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Default Currency">
                    <Select value={settings.currency} onValueChange={(value) => handleChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="MWK">MWK - Malawian Kwacha</SelectItem>
                        <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                        <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Tax Rate (%)">
                    <Input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                      step="0.01"
                      min="0"
                      max="100"
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Tax Type">
                    <Select value={settings.taxType} onValueChange={(value) => handleChange('taxType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inclusive">Tax Inclusive</SelectItem>
                        <SelectItem value="exclusive">Tax Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Fiscal Year Start">
                    <Select 
                      value={settings.fiscalYearStart} 
                      onValueChange={(value) => handleChange('fiscalYearStart', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01-01">January 1</SelectItem>
                        <SelectItem value="04-01">April 1</SelectItem>
                        <SelectItem value="07-01">July 1</SelectItem>
                        <SelectItem value="10-01">October 1</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField label="Fiscal Year End">
                  <Select 
                    value={settings.fiscalYearEnd} 
                    onValueChange={(value) => handleChange('fiscalYearEnd', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12-31">December 31</SelectItem>
                      <SelectItem value="03-31">March 31</SelectItem>
                      <SelectItem value="06-30">June 30</SelectItem>
                      <SelectItem value="09-30">September 30</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Terms</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Net 30 Days</Label>
                        <p className="text-xs text-gray-500">Payment due 30 days after invoice</p>
                      </div>
                      <button
                        onClick={() => handleChange('paymentTerms', 'net30')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paymentTerms === 'net30' ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paymentTerms === 'net30' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Net 15 Days</Label>
                        <p className="text-xs text-gray-500">Payment due 15 days after invoice</p>
                      </div>
                      <button
                        onClick={() => handleChange('paymentTerms', 'net15')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paymentTerms === 'net15' ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paymentTerms === 'net15' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Due on Receipt</Label>
                        <p className="text-xs text-gray-500">Payment due immediately</p>
                      </div>
                      <button
                        onClick={() => handleChange('paymentTerms', 'dueOnReceipt')}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.paymentTerms === 'dueOnReceipt' ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.paymentTerms === 'dueOnReceipt' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operational Tab */}
          <TabsContent value="operational" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Operational Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                {/* Business Hours */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Business Hours</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="Start Time">
                      <Input
                        type="time"
                        value={settings.businessHoursStart}
                        onChange={(e) => handleChange('businessHoursStart', e.target.value)}
                      />
                    </FormField>
                    
                    <FormField label="End Time">
                      <Input
                        type="time"
                        value={settings.businessHoursEnd}
                        onChange={(e) => handleChange('businessHoursEnd', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>

                {/* Operating Days */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Operating Days</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <div key={day} className="flex flex-col items-center">
                        <button
                          onClick={() => {
                            const newDays = settings.operatingDays.includes(day)
                              ? settings.operatingDays.filter(d => d !== day)
                              : [...settings.operatingDays, day];
                            handleChange('operatingDays', newDays);
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            settings.operatingDays.includes(day)
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {day.charAt(0)}
                        </button>
                        <span className="text-xs text-gray-600 mt-1">{day.slice(0, 3)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected days: {settings.operatingDays.join(', ')}
                  </p>
                </div>

                {/* System Preferences */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">System Preferences</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <FormField label="Language">
                      <Select 
                        value={settings.languagePreference} 
                        onValueChange={(value) => handleChange('languagePreference', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    
                    <FormField label="Date Format">
                      <Select 
                        value={settings.dateFormat} 
                        onValueChange={(value) => handleChange('dateFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                    
                    <FormField label="Number Format">
                      <Select 
                        value={settings.numberFormat} 
                        onValueChange={(value) => handleChange('numberFormat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">1,000.00</SelectItem>
                          <SelectItem value="de-DE">1.000,00</SelectItem>
                          <SelectItem value="fr-FR">1 000,00</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <FormField label="Session Timeout (minutes)" helpText="Automatically log out inactive users">
                      <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-32"
                        min="5"
                        max="240"
                      />
                    </FormField>

                    <FormField label="Password Expiry (days)" helpText="Require password change after this period">
                      <Input
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                        className="w-32"
                        min="30"
                        max="365"
                      />
                    </FormField>

                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Two-Factor Authentication</Label>
                        <p className="text-xs text-gray-500 mt-1">Require 2FA for all administrator accounts</p>
                      </div>
                      <button
                        onClick={() => handleChange('twoFactorAuth', !settings.twoFactorAuth)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.twoFactorAuth ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 -mx-6 -mb-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasChanges ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>You have unsaved changes</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>All changes saved</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!hasChanges}
                className="bg-gray-900 hover:bg-gray-800 px-8"
              >
                <Save className="mr-2 h-4 w-4" />
                Complete Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}