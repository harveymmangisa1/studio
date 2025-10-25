
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
  RefreshCw,
  Search,
  Users,
  CreditCard,
  Printer,
  Barcode,
  Warehouse,
  FileText,
  Link,
  Backpack,
  DownloadCloud,
  UploadCloud,
  Cpu,
  Network,
  ShieldCheck,
  UserCheck,
  Clock,
  Smartphone,
  Mail,
  MessageCircle,
  BarChart3,
  Activity,
  FileDown,
  FileUp,
  Copy,
  Key,
  Webhook,
  Server,
  Store,
  Truck,
  Calculator,
  Receipt,
  Scan,
  QrCode,
  SmartphoneCharging,
  Wifi,
  WifiOff,
  Cloud,
  HardDrive,
  History,
  UserCog,
  Building,
  MapPin
} from "lucide-react";
import { FormField, SuccessCard, PageHeader } from '@/components/shared';
import { useTenant } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';

// Enhanced Types
interface BusinessSettings {
  // Core Business Info
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  businessType: 'retail' | 'wholesale' | 'courier' | 'construction' | 'multi-vendor' | 'other';
  taxId: string;
  currency: string;
  timezone: string;
  
  // Branding
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  receiptHeader: string;
  receiptFooter: string;
  
  // Branches & Warehouses
  branches: Array<{
    id: string;
    name: string;
    address: string;
    phone: string;
    isActive: boolean;
    warehouseEnabled: boolean;
  }>;
  
  // Tax & Pricing
  taxRates: Array<{
    id: string;
    name: string;
    rate: number;
    type: 'inclusive' | 'exclusive';
    isDefault: boolean;
  }>;
  
  discountRules: Array<{
    id: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    minAmount: number;
    applicableTo: string[];
  }>;
  
  invoicePrefix: string;
}

interface POSSettings {
  // Terminal Configuration
  terminals: Array<{
    id: string;
    name: string;
    branchId: string;
    deviceType: 'desktop' | 'tablet' | 'mobile';
    peripherals: {
      receiptPrinter: boolean;
      barcodeScanner: boolean;
      cardReader: boolean;
      cashDrawer: boolean;
    };
    ipAddress: string;
    isActive: boolean;
  }>;
  
  // Payment Methods
  paymentMethods: Array<{
    id: string;
    name: string;
    type: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'credit';
    isEnabled: boolean;
    processingFee: number;
    requiresApproval: boolean;
  }>;
  
  // Receipt Settings
  receiptSettings: {
    autoPrint: boolean;
    printCustomerCopy: boolean;
    printKitchenCopy: boolean;
    includeLogo: boolean;
    digitalCopy: boolean;
    emailReceipt: boolean;
    smsReceipt: boolean;
    headerText: string;
    footerText: string;
  };
  
  // Operational Settings
  operationalSettings: {
    syncMode: 'online' | 'offline';
    loyaltyEnabled: boolean;
    rewardPointsRate: number;
    dailySalesLimit: number;
    floatCash: number;
    autoShiftClose: boolean;
    shiftCloseTime: string;
    sessionTimeout: number;
  };
  
  // Security
  security: {
    requireManagerApproval: boolean;
    approvalAmount: number;
    refundApprovalRequired: boolean;
    voidApprovalRequired: boolean;
  };
}

interface SecuritySettings {
  // Authentication
  authentication: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireNumbers: boolean;
      requireSymbols: boolean;
      expireAfter: number; // days
    };
  };
  
  // Access Control
  accessControl: {
    roleBasedAccess: boolean;
    ipWhitelisting: boolean;
    allowedIPs: string[];
    deviceRestrictions: boolean;
    maxDevicesPerUser: number;
  };
  
  // Sessions
  sessions: {
    maxConcurrentSessions: number;
    autoLogoutInactive: boolean;
    logoutAfterHours: number;
  };
  
  // Audit
  audit: {
    enableAuditTrail: boolean;
    logRetentionDays: number;
    trackSettingsChanges: boolean;
    trackFinancialChanges: boolean;
  };
}

interface NotificationSettings {
  // Sales & Inventory
  salesThresholdAlerts: boolean;
  salesThresholdAmount: number;
  lowStockAlerts: boolean;
  lowStockThreshold: number;
  stockAgingAlerts: boolean;
  stockAgingDays: number;
  
  // POS & Operations
  shiftClosureAlerts: boolean;
  cashDrawerAlerts: boolean;
  refundAlerts: boolean;
  voidAlerts: boolean;
  
  // Financial
  paymentReminders: boolean;
  dailySalesReports: boolean;
  weeklyPerformanceReports: boolean;
  monthlyFinancialReports: boolean;
  
  // Delivery Methods
  emailNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  pushNotifications: boolean;
  
  // Recipients
  recipients: {
    admins: boolean;
    managers: boolean;
    accountants: boolean;
    customEmails: string[];
  };
}

interface IntegrationSettings {
  // API Management
  apiKeys: Array<{
    id: string;
    name: string;
    key: string;
    permissions: string[];
    createdAt: string;
    lastUsed: string;
    isActive: boolean;
  }>;
  
  // Webhooks
  webhooks: Array<{
    id: string;
    name: string;
    url: string;
    events: string[];
    isActive: boolean;
    secret: string;
  }>;
  
  // Accounting Integration
  accounting: {
    quickbooks: boolean;
    xero: boolean;
    sage: boolean;
    custom: boolean;
    syncFrequency: 'realtime' | 'hourly' | 'daily';
  };
  
  // Payment Gateways
  paymentGateways: {
    stripe: boolean;
    paypal: boolean;
    square: boolean;
    custom: boolean;
  };
  
  // AI & Analytics
  aiAnalytics: {
    enabled: boolean;
    pricingSuggestions: boolean;
    reorderSuggestions: boolean;
    fraudDetection: boolean;
    salesForecasting: boolean;
  };
}

interface DataBackupSettings {
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionPeriod: number; // days
  
  // Storage
  storage: {
    local: boolean;
    cloud: boolean;
    cloudProvider: 'aws' | 'google' | 'azure' | 'supabase';
    encryption: boolean;
  };
  
  // Data Management
  dataManagement: {
    autoPurge: boolean;
    purgeAfterMonths: number;
    exportOlderThan: number;
  };
  
  // Export/Import
  exportSettings: {
    format: 'json' | 'csv' | 'xml';
    includeSensitiveData: boolean;
    compressFiles: boolean;
  };
}

interface RoleSettings {
  roles: Array<{
    id: string;
    name: string;
    description: string;
    permissions: {
      settings: string[];
      pos: string[];
      inventory: string[];
      reports: string[];
      customers: string[];
    };
    isCustom: boolean;
  }>;
  
  templates: {
    retail: boolean;
    warehouse: boolean;
    accounting: boolean;
    driver: boolean;
  };
}

interface SystemLogs {
  loginHistory: Array<{
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    ipAddress: string;
    device: string;
    status: 'success' | 'failed';
  }>;
  
  settingsChanges: Array<{
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    setting: string;
    oldValue: string;
    newValue: string;
  }>;
  
  systemHealth: {
    lastBackup: string;
    syncQueue: number;
    activeSessions: number;
    storageUsage: number;
    uptime: number;
  };
}

// Main Settings Interface
interface AppSettings {
  business: BusinessSettings;
  pos: POSSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
  backup: DataBackupSettings;
  roles: RoleSettings;
  logs: SystemLogs;
}

interface ValidationErrors {
  [key: string]: string | undefined;
}

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  category: 'business' | 'operations' | 'security' | 'integrations' | 'data';
  completed?: boolean;
  roles?: string[]; // Which roles can access this section
}

export default function UnifiedSettingsCenter() {
  const { tenant, setTenant, theme, setTheme } = useTenant();
  const [currentSection, setCurrentSection] = useState('business-profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [activeSessions, setActiveSessions] = useState(3);

  // Enhanced Settings State
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    business: {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      companyAddress: '',
      businessType: 'retail',
      taxId: '',
      currency: 'USD',
      timezone: 'UTC',
      logo: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      receiptHeader: 'Thank you for your business!',
      receiptFooter: 'Returns accepted within 30 days',
      branches: [],
      taxRates: [],
      discountRules: [],
      invoicePrefix: 'INV'
    },
    pos: {
      terminals: [],
      paymentMethods: [],
      receiptSettings: {
        autoPrint: true,
        printCustomerCopy: true,
        printKitchenCopy: false,
        includeLogo: true,
        digitalCopy: true,
        emailReceipt: false,
        smsReceipt: false,
        headerText: '',
        footerText: ''
      },
      operationalSettings: {
        syncMode: 'online',
        loyaltyEnabled: false,
        rewardPointsRate: 1,
        dailySalesLimit: 10000,
        floatCash: 500,
        autoShiftClose: true,
        shiftCloseTime: '22:00',
        sessionTimeout: 30
      },
      security: {
        requireManagerApproval: true,
        approvalAmount: 100,
        refundApprovalRequired: true,
        voidApprovalRequired: true
      }
    },
    security: {
      authentication: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireNumbers: true,
          requireSymbols: true,
          expireAfter: 90
        }
      },
      accessControl: {
        roleBasedAccess: true,
        ipWhitelisting: false,
        allowedIPs: [],
        deviceRestrictions: false,
        maxDevicesPerUser: 3
      },
      sessions: {
        maxConcurrentSessions: 5,
        autoLogoutInactive: true,
        logoutAfterHours: 8
      },
      audit: {
        enableAuditTrail: true,
        logRetentionDays: 365,
        trackSettingsChanges: true,
        trackFinancialChanges: true
      }
    },
    notifications: {
      salesThresholdAlerts: true,
      salesThresholdAmount: 5000,
      lowStockAlerts: true,
      lowStockThreshold: 10,
      stockAgingAlerts: false,
      stockAgingDays: 90,
      shiftClosureAlerts: true,
      cashDrawerAlerts: true,
      refundAlerts: true,
      voidAlerts: true,
      paymentReminders: true,
      dailySalesReports: false,
      weeklyPerformanceReports: true,
      monthlyFinancialReports: true,
      emailNotifications: true,
      smsNotifications: false,
      whatsappNotifications: false,
      pushNotifications: true,
      recipients: {
        admins: true,
        managers: true,
        accountants: false,
        customEmails: []
      }
    },
    integrations: {
      apiKeys: [],
      webhooks: [],
      accounting: {
        quickbooks: false,
        xero: false,
        sage: false,
        custom: false,
        syncFrequency: 'daily'
      },
      paymentGateways: {
        stripe: false,
        paypal: false,
        square: false,
        custom: false
      },
      aiAnalytics: {
        enabled: false,
        pricingSuggestions: false,
        reorderSuggestions: false,
        fraudDetection: false,
        salesForecasting: false
      }
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      retentionPeriod: 30,
      storage: {
        local: true,
        cloud: false,
        cloudProvider: 'supabase',
        encryption: true
      },
      dataManagement: {
        autoPurge: false,
        purgeAfterMonths: 24,
        exportOlderThan: 12
      },
      exportSettings: {
        format: 'json',
        includeSensitiveData: false,
        compressFiles: true
      }
    },
    roles: {
      roles: [],
      templates: {
        retail: true,
        warehouse: false,
        accounting: false,
        driver: false
      }
    },
    logs: {
      loginHistory: [],
      settingsChanges: [],
      systemHealth: {
        lastBackup: '',
        syncQueue: 0,
        activeSessions: 0,
        storageUsage: 0,
        uptime: 0
      }
    }
  });

  // Enhanced Sections Configuration
  const sections: SettingsSection[] = [
    // Business Category
    {
      id: 'business-profile',
      label: 'Business Profile',
      icon: Building2,
      description: 'Company information, branding, and basic configuration',
      category: 'business',
      roles: ['admin', 'owner']
    },
    {
      id: 'branches-warehouses',
      label: 'Branches & Warehouses',
      icon: MapPin,
      description: 'Manage business locations and inventory storage',
      category: 'business',
      roles: ['admin', 'manager']
    },
    {
      id: 'tax-discounts',
      label: 'Tax & Discounts',
      icon: Calculator,
      description: 'Configure tax rates and discount rules',
      category: 'business',
      roles: ['admin', 'accountant']
    },

    // Operations Category
    {
      id: 'pos-configuration',
      label: 'POS Configuration',
      icon: CreditCard,
      description: 'Point of Sale terminals and payment settings',
      category: 'operations',
      roles: ['admin', 'manager', 'cashier']
    },
    {
      id: 'receipt-settings',
      label: 'Receipt & Printing',
      icon: Receipt,
      description: 'Customize receipts and printing options',
      category: 'operations',
      roles: ['admin', 'manager']
    },
    {
      id: 'inventory-management',
      label: 'Inventory Settings',
      icon: Warehouse,
      description: 'Stock management and reordering rules',
      category: 'operations',
      roles: ['admin', 'manager', 'warehouse']
    },

    // Security Category
    {
      id: 'authentication',
      label: 'Authentication',
      icon: ShieldCheck,
      description: 'Login security and password policies',
      category: 'security',
      roles: ['admin']
    },
    {
      id: 'access-control',
      label: 'Access Control',
      icon: UserCheck,
      description: 'Role-based permissions and IP restrictions',
      category: 'security',
      roles: ['admin']
    },
    {
      id: 'sessions-devices',
      label: 'Sessions & Devices',
      icon: Smartphone,
      description: 'Manage active sessions and device limits',
      category: 'security',
      roles: ['admin', 'manager']
    },

    // Integrations Category
    {
      id: 'api-keys',
      label: 'API Keys',
      icon: Key,
      description: 'Manage API access and permissions',
      category: 'integrations',
      roles: ['admin', 'developer']
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      icon: Webhook,
      description: 'Configure real-time data integrations',
      category: 'integrations',
      roles: ['admin', 'developer']
    },
    {
      id: 'accounting-payments',
      label: 'Accounting & Payments',
      icon: FileText,
      description: 'Connect accounting software and payment gateways',
      category: 'integrations',
      roles: ['admin', 'accountant']
    },

    // Data Category
    {
      id: 'backup-settings',
      label: 'Backup Settings',
      icon: Backpack,
      description: 'Automated backups and data retention',
      category: 'data',
      roles: ['admin']
    },
    {
      id: 'export-import',
      label: 'Export & Import',
      icon: DownloadCloud,
      description: 'Data migration and configuration transfer',
      category: 'data',
      roles: ['admin']
    },
    {
      id: 'system-logs',
      label: 'System Logs',
      icon: History,
      description: 'Audit trails and system activity',
      category: 'data',
      roles: ['admin', 'manager']
    }
  ];

  // Filter sections based on search and user role
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          section.description.toLowerCase().includes(searchQuery.toLowerCase());
      // In real app, check user role against section.roles
      return matchesSearch;
    });
  }, [searchQuery]);

  // Group sections by category
  const groupedSections = useMemo(() => {
    const groups = {
      business: filteredSections.filter(s => s.category === 'business'),
      operations: filteredSections.filter(s => s.category === 'operations'),
      security: filteredSections.filter(s => s.category === 'security'),
      integrations: filteredSections.filter(s => s.category === 'integrations'),
      data: filteredSections.filter(s => s.category === 'data')
    };
    return groups;
  }, [filteredSections]);

  // Calculate setup progress
  const progress = useMemo(() => {
    const completedSections = sections.filter(section => section.completed).length;
    return Math.round((completedSections / sections.length) * 100);
  }, [sections]);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      if (!tenant) return;

      try {
        const { data, error } = await supabase
          .from('tenant_settings')
          .select('settings')
          .eq('tenant_id', tenant.id)
          .single();

        if (!error && data?.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, [tenant]);

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

  const validateSettings = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Business validation
    if (!settings.business?.companyName) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (settings.business?.companyEmail && 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.business.companyEmail)) {
      newErrors.companyEmail = 'Please enter a valid email address';
    }

    // Add more validations as needed...

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!tenant || !validateSettings()) return;
  
    setIsLoading(true);
  
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update({ name: settings.business?.companyName })
        .eq('id', tenant.id)
        .select()
        .single();
  
      if (error) throw error;
  
      if (data) {
        setTenant(data);
      }
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setHasUnsavedChanges(false);
  
    } catch (error: any) {
      console.error('Error saving settings:', error);
      alert(`Failed to save settings: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
    
    setHasUnsavedChanges(true);
  };

  const simulateBackup = async () => {
    setBackupProgress(0);
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setBackupProgress(i);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `octet-settings-${tenant?.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const revokeSession = (sessionId: string) => {
    // Implementation for revoking sessions
    setActiveSessions(prev => prev - 1);
  };

  if (showSuccess) {
    return (
      <SuccessCard
        title="Settings Saved Successfully!"
        description="All your configuration changes have been applied."
        buttonText="Back to Settings"
        onButtonClick={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Unified Settings Center"
        description="Configure your Octet Systems platform with intelligent, role-based settings management"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              Unsaved changes
            </div>
          )}
          
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !hasUnsavedChanges}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </PageHeader>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{progress}%</div>
                <div className="text-blue-100 text-sm">Setup Complete</div>
              </div>
              <Settings className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{activeSessions}</div>
                <div className="text-green-100 text-sm">Active Sessions</div>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-purple-100 text-sm">System Uptime</div>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">2.4GB</div>
                <div className="text-orange-100 text-sm">Storage Used</div>
              </div>
              <Database className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Settings Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(groupedSections).map(([category, categorySections]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-1">
                  {categorySections.map((section) => {
                    const Icon = section.icon;
                    const isActive = currentSection === section.id;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => setCurrentSection(section.id)}
                        className={`
                          w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left
                          ${isActive 
                            ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <div className={`
                          p-2 rounded-lg transition-colors
                          ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                        `}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{section.label}</div>
                          <div className="text-xs text-gray-500 truncate">{section.description}</div>
                        </div>
                        <ChevronRight className={`
                          h-4 w-4 transition-transform
                          ${isActive ? 'text-blue-600 rotate-90' : 'text-gray-400'}
                        `} />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Settings Content */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {sections.find(s => s.id === currentSection)?.label}
                    <Badge variant="outline" className="ml-2">
                      {sections.find(s => s.id === currentSection)?.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {sections.find(s => s.id === currentSection)?.description}
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unsaved
                    </Badge>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={handleExportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Business Profile Section */}
              {currentSection === 'business-profile' && (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField 
                      label="Company Name" 
                      required 
                      error={errors.companyName}
                    >
                      <Input
                        placeholder="Your Company Name"
                        value={settings.business?.companyName || ''}
                        onChange={(e) => handleFieldChange('business.companyName', e.target.value)}
                      />
                    </FormField>

                    <FormField 
                      label="Business Type" 
                      required
                    >
                      <Select 
                        value={settings.business?.businessType} 
                        onValueChange={(value: any) => handleFieldChange('business.businessType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                          <SelectItem value="courier">Courier Service</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="multi-vendor">Multi-Vendor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField label="Primary Color">
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={settings.business?.primaryColor}
                          onChange={(e) => handleFieldChange('business.primaryColor', e.target.value)}
                          className="w-20"
                        />
                        <Input
                          value={settings.business?.primaryColor}
                          onChange={(e) => handleFieldChange('business.primaryColor', e.target.value)}
                        />
                      </div>
                    </FormField>

                    <FormField label="Currency">
                      <Select 
                        value={settings.business?.currency} 
                        onValueChange={(value) => handleFieldChange('business.currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                          <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                          <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Receipt Header">
                    <Textarea
                      placeholder="Custom header text for receipts..."
                      value={settings.business?.receiptHeader}
                      onChange={(e) => handleFieldChange('business.receiptHeader', e.target.value)}
                      rows={2}
                    />
                  </FormField>
                </div>
              )}

              {/* POS Configuration Section */}
              {currentSection === 'pos-configuration' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Payment Methods</h4>
                    <div className="space-y-3">
                      {[
                        { type: 'cash', label: 'Cash', default: true },
                        { type: 'card', label: 'Card Payment' },
                        { type: 'mobile_money', label: 'Mobile Money' },
                        { type: 'bank_transfer', label: 'Bank Transfer' },
                      ].map((method) => (
                        <div key={method.type} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <Label className="font-medium">{method.label}</Label>
                            <p className="text-sm text-gray-600">
                              {method.default ? 'Always enabled' : 'Enable this payment method'}
                            </p>
                          </div>
                          <Switch 
                            defaultChecked={method.default}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField label="Sync Mode">
                      <RadioGroup 
                        value={settings.pos?.operationalSettings?.syncMode} 
                        onValueChange={(value) => handleFieldChange('pos.operationalSettings.syncMode', value)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="online" id="online" />
                          <Label htmlFor="online" className="cursor-pointer flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <Wifi className="h-4 w-4 text-green-600" />
                              Online Mode
                            </div>
                            <div className="text-sm text-gray-600">Real-time sync with cloud</div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="offline" id="offline" />
                          <Label htmlFor="offline" className="cursor-pointer flex-1">
                            <div className="font-medium flex items-center gap-2">
                              <WifiOff className="h-4 w-4 text-amber-600" />
                              Offline Mode
                            </div>
                            <div className="text-sm text-gray-600">Sync when connection available</div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormField>

                    <FormField label="Daily Sales Limit">
                      <Input
                        type="number"
                        value={settings.pos?.operationalSettings?.dailySalesLimit}
                        onChange={(e) => handleFieldChange('pos.operationalSettings.dailySalesLimit', parseFloat(e.target.value))}
                        prefix="$"
                      />
                    </FormField>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <Label className="font-medium">Customer Loyalty System</Label>
                      <p className="text-sm text-gray-600">Enable reward points and customer retention features</p>
                    </div>
                    <Switch 
                      checked={settings.pos?.operationalSettings?.loyaltyEnabled}
                      onCheckedChange={(checked) => handleFieldChange('pos.operationalSettings.loyaltyEnabled', checked)}
                    />
                  </div>
                </div>
              )}

              {/* Security & Sessions Section */}
              {currentSection === 'sessions-devices' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Active Sessions ({activeSessions})</h4>
                    <div className="space-y-3">
                      {[
                        { id: '1', device: 'Chrome on Windows', location: 'New York, USA', lastActive: '2 minutes ago' },
                        { id: '2', device: 'Safari on iPhone', location: 'Nairobi, Kenya', lastActive: '1 hour ago' },
                        { id: '3', device: 'Android App', location: 'Lagos, Nigeria', lastActive: '5 minutes ago' },
                      ].map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-8 w-8 text-gray-400" />
                            <div>
                              <div className="font-medium">{session.device}</div>
                              <div className="text-sm text-gray-600">{session.location} • {session.lastActive}</div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField label="Maximum Concurrent Sessions">
                      <Select 
                        value={settings.security?.sessions?.maxConcurrentSessions?.toString()} 
                        onValueChange={(value) => handleFieldChange('security.sessions.maxConcurrentSessions', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Device</SelectItem>
                          <SelectItem value="3">3 Devices</SelectItem>
                          <SelectItem value="5">5 Devices</SelectItem>
                          <SelectItem value="10">10 Devices</SelectItem>
                          <SelectItem value="0">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Auto Logout After">
                      <Select 
                        value={settings.security?.sessions?.logoutAfterHours?.toString()} 
                        onValueChange={(value) => handleFieldChange('security.sessions.logoutAfterHours', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">4 Hours</SelectItem>
                          <SelectItem value="8">8 Hours</SelectItem>
                          <SelectItem value="12">12 Hours</SelectItem>
                          <SelectItem value="24">24 Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Backup & Data Management Section */}
              {currentSection === 'backup-settings' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Automated Backup</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label className="font-medium">Enable Automatic Backup</Label>
                          <p className="text-sm text-gray-600">Regularly backup your data automatically</p>
                        </div>
                        <Switch 
                          checked={settings.backup?.autoBackup}
                          onCheckedChange={(checked) => handleFieldChange('backup.autoBackup', checked)}
                        />
                      </div>

                      {settings.backup?.autoBackup && (
                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField label="Backup Frequency">
                            <Select 
                              value={settings.backup?.backupFrequency} 
                              onValueChange={(value) => handleFieldChange('backup.backupFrequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hourly">Every Hour</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          <FormField label="Backup Time">
                            <Input
                              type="time"
                              value={settings.backup?.backupTime}
                              onChange={(e) => handleFieldChange('backup.backupTime', e.target.value)}
                            />
                          </FormField>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField label="Storage Location">
                    <RadioGroup 
                      value={settings.backup?.storage?.cloud ? 'cloud' : 'local'} 
                      onValueChange={(value) => handleFieldChange('backup.storage.cloud', value === 'cloud')}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="local" id="local" />
                        <Label htmlFor="local" className="cursor-pointer flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Local Storage
                          </div>
                          <div className="text-sm text-gray-600">Store backups on this device</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="cloud" id="cloud" />
                        <Label htmlFor="cloud" className="cursor-pointer flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            Cloud Storage
                          </div>
                          <div className="text-sm text-gray-600">Secure cloud backup</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={simulateBackup} variant="outline" className="h-auto py-4">
                      <Backpack className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Backup Now</div>
                        <div className="text-sm text-gray-600">Create immediate backup</div>
                      </div>
                    </Button>

                    <Button onClick={handleExportSettings} variant="outline" className="h-auto py-4">
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Export Settings</div>
                        <div className="text-sm text-gray-600">Download configuration</div>
                      </div>
                    </Button>
                  </div>

                  {backupProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Backup progress</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${backupProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Add more sections for other settings categories... */}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    