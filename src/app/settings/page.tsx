'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Building2
} from "lucide-react";
import { FormField, SuccessCard, PageHeader } from '@/components/shared';
import { useTenant, Tenant } from '@/lib/tenant';

export default function SettingsPage() {
  const { tenant, setTenant } = useTenant();
  const [currentTab, setCurrentTab] = useState('general');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const [settings, setSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    timezone: '',
    currency: 'USD',
    emailNotifications: true,
    lowStockAlerts: true,
    paymentReminders: true,
    weeklyReports: false,
    twoFactorAuth: false,
    sessionTimeout: 30,
    theme: 'light',
    autoBackup: true,
    backupFrequency: 'daily'
  });

  useEffect(() => {
    if (tenant) {
      setSettings(prev => ({
        ...prev,
        companyName: tenant.name,
      }));
    }
  }, [tenant]);

  const validateSettings = () => {
    const newErrors: Record<string,string> = {};
    
    if (!settings.companyName || settings.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }
    if (settings.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateSettings()) {
      if (tenant) {
        setTenant({ ...tenant, name: settings.companyName });
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleFieldChange = (field: keyof typeof settings, value: any) => {
    setSettings({ ...settings, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Backup', icon: Database },
  ];

  if (showSuccess) {
    return (
      <SuccessCard
        title="Settings Saved!"
        description="Your settings have been updated successfully."
        buttonText="Continue"
        onButtonClick={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your application preferences and configuration."
      >
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={currentTab === tab.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setCurrentTab(tab.id)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {tabs.find(tab => tab.id === currentTab)?.label} Settings
              </CardTitle>
              <CardDescription>
                {currentTab === 'general' && "Configure your company information and basic settings"}
                {currentTab === 'notifications' && "Manage your notification preferences"}
                {currentTab === 'security' && "Configure security settings and access controls"}
                {currentTab === 'appearance' && "Customize the look and feel of your application"}
                {currentTab === 'data' && "Manage data backup and retention policies"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              {currentTab === 'general' && (
                <div className="space-y-4">
                  <FormField label="Company Name" required error={errors.companyName} helpText="This will appear on invoices and reports">
                    <Input
                      placeholder="Your Company Name"
                      value={settings.companyName}
                      onChange={(e) => handleFieldChange('companyName', e.target.value)}
                      className={errors.companyName ? 'border-red-500' : ''}
                    />
                  </FormField>

                  <FormField label="Company Email" error={errors.companyEmail} helpText="Used for sending invoices and notifications">
                    <Input
                      type="email"
                      placeholder="contact@yourcompany.com"
                      value={settings.companyEmail}
                      onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                      className={errors.companyEmail ? 'border-red-500' : ''}
                    />
                  </FormField>

                  <FormField label="Company Phone" helpText="Contact number for customer support">
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={settings.companyPhone}
                      onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Company Address" helpText="Your business address">
                    <Textarea
                      placeholder="123 Business Street, City, State 12345"
                      value={settings.companyAddress}
                      onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                      rows={3}
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Timezone" helpText="Your local timezone">
                      <Select value={settings.timezone} onValueChange={(value) => handleFieldChange('timezone', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Currency" helpText="Default currency for transactions">
                      <Select value={settings.currency} onValueChange={(value) => handleFieldChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {currentTab === 'notifications' && (
                <div className="space-y-4">
                  <FormField label="Email Notifications" helpText="Receive notifications via email">
                    <div className="space-y-2">
                      {[
                        { key: 'emailNotifications', label: 'General email notifications' },
                        { key: 'lowStockAlerts', label: 'Low stock alerts' },
                        { key: 'paymentReminders', label: 'Payment reminders' },
                        { key: 'weeklyReports', label: 'Weekly summary reports' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={item.key}
                            checked={settings[item.key as keyof typeof settings]}
                            onCheckedChange={(checked) => handleFieldChange(item.key as keyof typeof settings, checked)}
                          />
                          <Label htmlFor={item.key}>{item.label}</Label>
                        </div>
                      ))}
                    </div>
                  </FormField>
                </div>
              )}

              {/* Security Settings */}
              {currentTab === 'security' && (
                <div className="space-y-4">
                  <FormField label="Two-Factor Authentication" helpText="Add an extra layer of security to your account">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="twoFactorAuth"
                        checked={settings.twoFactorAuth}
                        onCheckedChange={(checked) => handleFieldChange('twoFactorAuth', checked)}
                      />
                      <Label htmlFor="twoFactorAuth">Enable two-factor authentication</Label>
                    </div>
                  </FormField>

                  <FormField label="Session Timeout" helpText="Automatically log out after inactivity">
                    <Select value={settings.sessionTimeout.toString()} onValueChange={(value) => handleFieldChange('sessionTimeout', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              )}

              {/* Appearance Settings */}
              {currentTab === 'appearance' && (
                <div className="space-y-4">
                  <FormField label="Theme" helpText="Choose your preferred color scheme">
                    <RadioGroup value={settings.theme} onValueChange={(value) => handleFieldChange('theme', value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light">Light</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark">Dark</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system">System</Label>
                      </div>
                    </RadioGroup>
                  </FormField>
                </div>
              )}

              {/* Data Settings */}
              {currentTab === 'data' && (
                <div className="space-y-4">
                  <FormField label="Automatic Backup" helpText="Automatically backup your data">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="autoBackup"
                        checked={settings.autoBackup}
                        onCheckedChange={(checked) => handleFieldChange('autoBackup', checked)}
                      />
                      <Label htmlFor="autoBackup">Enable automatic backups</Label>
                    </div>
                  </FormField>

                  <FormField label="Backup Frequency" helpText="How often to create backups">
                    <Select value={settings.backupFrequency} onValueChange={(value) => handleFieldChange('backupFrequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
