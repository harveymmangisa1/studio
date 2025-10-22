'use client';

import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  CheckCircle,
  Building2,
  ChevronRight,
  Upload,
  Download,
  Eye,
  EyeOff,
  RefreshCw
} from "lucide-react";
import { FormField, SuccessCard, PageHeader } from '@/components/shared';
import { useTenant } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';

// Types
interface SettingsData {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  timezone: string;
  currency: string;
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  paymentReminders: boolean;
  weeklyReports: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  theme: string;
  autoBackup: boolean;
  backupFrequency: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  completed?: boolean;
}

export default function SettingsPage() {
  const { tenant, setTenant, theme, setTheme } = useTenant();
  const [currentTab, setCurrentTab] = useState('general');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);
  const [backupProgress, setBackupProgress] = useState(0);

  const [settings, setSettings] = useState<Partial<SettingsData>>({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    timezone: 'America/New_York',
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
      setSettings({
        ...settings,
        companyName: tenant.name,
        companyEmail: tenant.email,
        companyPhone: tenant.phone,
        companyAddress: tenant.address,
      });
    }
  }, [tenant]);

  useEffect(() => {
    if (theme) {
      setSettings(prev => ({...prev, theme}));
    }
  }, [theme]);


  // Tab configuration with completion status
  const tabs: TabConfig[] = [
    { 
      id: 'general', 
      label: 'General', 
      icon: Building2, 
      description: 'Configure your company information and basic settings',
      completed: !!settings.companyName && !!settings.companyEmail
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      description: 'Manage your notification preferences',
      completed: settings.emailNotifications || settings.lowStockAlerts
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: Shield, 
      description: 'Configure security settings and access controls',
      completed: settings.twoFactorAuth || (settings.sessionTimeout && settings.sessionTimeout > 15)
    },
    { 
      id: 'appearance', 
      label: 'Appearance', 
      icon: Palette, 
      description: 'Customize the look and feel of your application',
      completed: settings.theme !== 'light'
    },
    { 
      id: 'data', 
      label: 'Data & Backup', 
      icon: Database, 
      description: 'Manage data backup and retention policies',
      completed: settings.autoBackup
    },
  ];

  // Calculate overall progress
  useEffect(() => {
    const completedTabs = tabs.filter(tab => tab.completed).length;
    setProgress(Math.round((completedTabs / tabs.length) * 100));
  }, [settings]);

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

  const validateSettings = (tab?: string): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!tab || tab === 'general') {
      if (!settings.companyName || settings.companyName.length < 2) {
        newErrors.companyName = 'Company name must be at least 2 characters';
      }
      if (settings.companyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.companyEmail)) {
        newErrors.companyEmail = 'Please enter a valid email address';
      }
    }

    if (tab === 'security' && settings.twoFactorAuth) {
      if (!settings.password) {
        newErrors.password = 'Current password is required to enable 2FA';
      }
      if (settings.newPassword && settings.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (settings.newPassword !== settings.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!tenant || !validateSettings(currentTab)) return;

    setIsLoading(true);

    const updates = {
      name: settings.companyName,
      email: settings.companyEmail,
      phone: settings.companyPhone,
      address: settings.companyAddress,
      // In a real app, you would save other settings too
    };

    const { data, error } = await supabase
      .from('tenants')
      .update(updates)
      .eq('id', tenant.id)
      .select()
      .single();
    
    setIsLoading(false);

    if (error) {
      console.error('Error updating settings:', error);
      alert('Failed to save settings.');
    } else if (data) {
      setTenant(data);
      setHasUnsavedChanges(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleFieldChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    if (field === 'theme' && setTheme) {
      setTheme(value);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleTabChange = (tabId: string) => {
    if (hasUnsavedChanges) {
      const confirmChange = window.confirm(
        'You have unsaved changes. Are you sure you want to switch tabs?'
      );
      if (!confirmChange) return;
    }
    setCurrentTab(tabId);
  };

  const simulateBackup = async () => {
    setBackupProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setBackupProgress(i);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stockpaeasy-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !hasUnsavedChanges}
            className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Setup Progress</h3>
              <p className="text-slate-600">Complete your configuration</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{progress}%</span>
              <p className="text-sm text-slate-500">Complete</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
                    ${isActive 
                      ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`
                      p-2 rounded-lg transition-colors
                      ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}
                    `}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-medium flex-1">{tab.label}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {tab.completed && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    <ChevronRight className={`
                      h-4 w-4 transition-transform
                      ${isActive ? 'text-blue-600 rotate-90' : 'text-slate-400'}
                    `} />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {tabs.find(tab => tab.id === currentTab)?.label}
                    {tabs.find(tab => tab.id === currentTab)?.completed && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {tabs.find(tab => tab.id === currentTab)?.description}
                  </CardDescription>
                </div>
                {hasUnsavedChanges && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    Unsaved
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField 
                      label="Company Name" 
                      required 
                      error={errors.companyName} 
                      helpText="This will appear on invoices and reports"
                    >
                      <Input
                        placeholder="Your Company Name"
                        value={settings.companyName}
                        onChange={(e) => handleFieldChange('companyName', e.target.value)}
                        className={errors.companyName ? 'border-red-500' : ''}
                      />
                    </FormField>

                    <FormField 
                      label="Company Email" 
                      required 
                      error={errors.companyEmail} 
                      helpText="Used for sending invoices and notifications"
                    >
                      <Input
                        type="email"
                        placeholder="contact@yourcompany.com"
                        value={settings.companyEmail}
                        onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                        className={errors.companyEmail ? 'border-red-500' : ''}
                      />
                    </FormField>
                  </div>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {currentTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: 'General email notifications', description: 'Receive important system updates' },
                        { key: 'lowStockAlerts', label: 'Low stock alerts', description: 'Get notified when inventory is running low' },
                        { key: 'paymentReminders', label: 'Payment reminders', description: 'Automatic payment due reminders' },
                        { key: 'weeklyReports', label: 'Weekly summary reports', description: 'Weekly business performance reports' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                          <Checkbox
                            id={item.key}
                            checked={settings[item.key as keyof SettingsData] as boolean}
                            onCheckedChange={(checked) => handleFieldChange(item.key as keyof SettingsData, checked)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={item.key} className="font-medium cursor-pointer">
                              {item.label}
                            </Label>
                            <p className="text-sm text-slate-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Authentication</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="twoFactorAuth" className="font-medium cursor-pointer">
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                        </div>
                        <Checkbox
                          id="twoFactorAuth"
                          checked={settings.twoFactorAuth}
                          onCheckedChange={(checked) => handleFieldChange('twoFactorAuth', checked)}
                        />
                      </div>

                      {settings.twoFactorAuth && (
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="grid gap-4 md:grid-cols-2">
                            <FormField label="Current Password" error={errors.password}>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  value={settings.password || ''}
                                  onChange={(e) => handleFieldChange('password', e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormField>
                            <div className="space-y-4">
                              <FormField label="New Password" error={errors.newPassword}>
                                <Input
                                  type="password"
                                  value={settings.newPassword || ''}
                                  onChange={(e) => handleFieldChange('newPassword', e.target.value)}
                                />
                              </FormField>
                              <FormField label="Confirm Password" error={errors.confirmPassword}>
                                <Input
                                  type="password"
                                  value={settings.confirmPassword || ''}
                                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                />
                              </FormField>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField label="Session Timeout" helpText="Automatically log out after inactivity">
                    <Select value={settings.sessionTimeout?.toString()} onValueChange={(value) => handleFieldChange('sessionTimeout', parseInt(value))}>
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

              {currentTab === 'appearance' && (
                <div className="space-y-6">
                  <FormField label="Theme" helpText="Choose your preferred color scheme">
                    <RadioGroup value={settings.theme} onValueChange={(value) => handleFieldChange('theme', value)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { value: 'light', label: 'Light', description: 'Clean and bright' },
                        { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
                        { value: 'system', label: 'System', description: 'Follows your device' },
                      ].map((theme) => (
                        <div key={theme.value} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-slate-50 cursor-pointer">
                          <RadioGroupItem value={theme.value} id={theme.value} />
                          <Label htmlFor={theme.value} className="cursor-pointer flex-1">
                            <div className="font-medium">{theme.label}</div>
                            <div className="text-sm text-slate-600">{theme.description}</div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormField>
                </div>
              )}

              {currentTab === 'data' && (
                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Backup Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="autoBackup" className="font-medium cursor-pointer">
                            Automatic Backup
                          </Label>
                          <p className="text-sm text-slate-600">Automatically backup your data</p>
                        </div>
                        <Checkbox
                          id="autoBackup"
                          checked={settings.autoBackup}
                          onCheckedChange={(checked) => handleFieldChange('autoBackup', checked)}
                        />
                      </div>

                      {settings.autoBackup && (
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
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={simulateBackup} variant="outline" className="h-auto py-4">
                      <Download className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Backup Now</div>
                        <div className="text-sm text-slate-600">Create manual backup</div>
                      </div>
                    </Button>

                    <Button onClick={handleExportData} variant="outline" className="h-auto py-4">
                      <Upload className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Export Data</div>
                        <div className="text-sm text-slate-600">Download settings</div>
                      </div>
                    </Button>
                  </div>

                  {backupProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Backup progress</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${backupProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
