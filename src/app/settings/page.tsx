'use client'
import React, { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
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
  ShoppingCart, Pill, Wrench, Utensils, Briefcase, Store
} from 'lucide-react';

const INDUSTRY_CONFIGS = {
  retail: {
    name: 'Retail',
    icon: ShoppingCart,
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
  const { tenant, updateTenantSettings } = useTenant();
  const [activeTab, setActiveTab] = useState('business');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('retail');
  const [settings, setSettings] = useState({
    companyName: '',
    industry: 'retail',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    logo: null,
    primaryColor: '#171717',
    accentColor: '#3B82F6',
    invoicePrefix: 'INV',
    invoiceFooter: '',
    termsAndConditions: '',
    currency: 'USD',
    taxRate: 0,
    taxType: 'inclusive',
    fiscalYearEnd: '12-31',
    sessionTimeout: 30,
    passwordExpiry: 90,
    industryFields: {}
  });

  useEffect(() => {
    if (tenant) {
      const [address, city, country] = tenant.address?.split(', ') || ['', '', ''];
      setSettings({
        companyName: tenant.name || '',
        industry: (tenant as any).industry || 'retail',
        taxId: tenant.settings?.taxId || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: address,
        city: city,
        country: country,
        logo: tenant.logo_url || null,
        primaryColor: tenant.settings?.primaryColor || '#171717',
        accentColor: tenant.settings?.accentColor || '#3B82F6',
        invoicePrefix: tenant.settings?.invoicePrefix || 'INV',
        invoiceFooter: tenant.settings?.invoiceFooter || '',
        termsAndConditions: tenant.settings?.termsAndConditions || '',
        currency: tenant.settings?.currency || 'USD',
        taxRate: tenant.settings?.taxRate || 0,
        taxType: tenant.settings?.taxType || 'inclusive',
        fiscalYearEnd: tenant.settings?.fiscalYearEnd || '12-31',
        sessionTimeout: tenant.settings?.sessionTimeout || 30,
        passwordExpiry: tenant.settings?.passwordExpiry || 90,
        industryFields: tenant.settings?.industryFields || {}
      });
      setSelectedIndustry((tenant as any).industry || 'retail');
    }
  }, [tenant]);

  useEffect(() => {
    const config = INDUSTRY_CONFIGS[selectedIndustry];
    const defaultFields = {};
    
    if (config?.fields) {
      Object.entries(config.fields).forEach(([key, fieldConfig]) => {
        defaultFields[key] = fieldConfig.default ?? '';
      });
    }
    
    setSettings(prev => ({
      ...prev,
      industry: selectedIndustry,
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
      return;
    }
    
    await updateTenantSettings(settings);

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
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-sm text-gray-500">
                Configure your business information and industry-specific preferences
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
                Save Changes
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
              Business Info
            </TabsTrigger>
            <TabsTrigger value="industry" className="gap-2">
              <IndustryIcon className="w-4 h-4" />
              Industry Settings
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <Receipt className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Business Info Tab */}
          <TabsContent value="business" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg" data-tour-id="settings-company">Company Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Company Name">
                    <Input
                      value={settings.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="Acme Corporation"
                    />
                  </FormField>

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
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <FormField label="Email Address">
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Phone Number">
                    <Input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Tax ID / Registration Number">
                  <Input
                    value={settings.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                  />
                </FormField>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Business Address</h3>
                  <FormField label="Street Address">
                    <Input
                      value={settings.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField label="City">
                      <Input
                        value={settings.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Country">
                      <Select value={settings.country} onValueChange={(value) => handleChange('country', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                           <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="mw">Malawi</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
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
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Compliance Requirements</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <ul className="space-y-2">
                        {currentIndustryConfig.compliance.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-blue-900">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
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
                <CardTitle className="text-lg">Brand Identity</CardTitle>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Document Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FormField label="Invoice Prefix">
                  <Input
                    value={settings.invoicePrefix}
                    onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                    className="w-32"
                  />
                </FormField>

                <FormField label="Invoice Footer">
                  <Textarea
                    value={settings.invoiceFooter}
                    onChange={(e) => handleChange('invoiceFooter', e.target.value)}
                    rows={2}
                  />
                </FormField>

                <FormField label="Terms and Conditions">
                  <Textarea
                    value={settings.termsAndConditions}
                    onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                    rows={4}
                  />
                </FormField>
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
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Tax Rate (%)">
                    <Input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                    />
                  </FormField>
                </div>

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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FormField label="Session Timeout (minutes)">
                  <Input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                    className="w-32"
                  />
                </FormField>

                <FormField label="Password Expiry (days)">
                  <Input
                    type="number"
                    value={settings.passwordExpiry}
                    onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
                    className="w-32"
                  />
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}