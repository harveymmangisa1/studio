

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Package, CalendarIcon, Save, CheckCircle, AlertCircle, 
  DollarSign, Warehouse, ClipboardList, Check,
  ShoppingCart, Pill, Utensils, Store, Briefcase, Wrench
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getMergedIndustryDefaults } from '@/config/industryDefaults';

const STORAGE_KEY = 'productFormDraft';

// Industry-specific configurations
const INDUSTRY_CONFIGS = {
  retail: {
    name: 'Retail',
    icon: ShoppingCart,
    fields: {
      warrantyPeriod: { 
        label: 'Warranty Period (Months)', 
        type: 'number', 
        default: 12,
        helpText: 'Manufacturer warranty duration'
      },
      returnPolicy: { 
        label: 'Return Policy (Days)', 
        type: 'number', 
        default: 30,
        helpText: 'Number of days for customer returns'
      },
      serialNumber: { 
        label: 'Serial Number Tracking', 
        type: 'boolean', 
        default: false,
        helpText: 'Track individual item serial numbers'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price'],
    defaultCategory: 'General Merchandise'
  },
  
  pharmacy: {
    name: 'Pharmacy/Pharmaceutical',
    icon: Pill,
    fields: {
      expiryDate: { 
        label: 'Expiry Date', 
        type: 'date', 
        required: true,
        helpText: 'Required for pharmaceutical products'
      },
      batchNumber: { 
        label: 'Batch/Lot Number', 
        type: 'text', 
        required: true,
        helpText: 'Manufacturer batch identification'
      },
      prescriptionRequired: { 
        label: 'Prescription Required', 
        type: 'boolean', 
        default: false,
        helpText: 'Whether this medication requires a prescription'
      },
      temperatureControl: { 
        label: 'Cold Chain Storage', 
        type: 'boolean', 
        default: false,
        helpText: 'Requires refrigerated storage'
      },
      supplierLicense: { 
        label: 'Supplier License Number', 
        type: 'text', 
        required: true,
        helpText: 'Licensed pharmaceutical supplier'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price', 'expiryDate', 'batchNumber', 'supplierLicense'],
    defaultCategory: 'Medications'
  },
  
  restaurant: {
    name: 'Restaurant/Food Service',
    icon: Utensils,
    fields: {
      expiryDate: { 
        label: 'Best Before Date', 
        type: 'date', 
        required: true,
        helpText: 'Food safety expiry date'
      },
      allergenInfo: { 
        label: 'Allergen Information', 
        type: 'text', 
        helpText: 'List of potential allergens'
      },
      storageTemp: { 
        label: 'Storage Temperature', 
        type: 'select', 
        options: ['Ambient', 'Refrigerated', 'Frozen'],
        default: 'Ambient',
        helpText: 'Required storage conditions'
      },
      preparationTime: { 
        label: 'Prep Time (Minutes)', 
        type: 'number', 
        default: 0,
        helpText: 'Average preparation time'
      }
    },
    requiredFields: ['name', 'category', 'cost', 'price', 'expiryDate'],
    defaultCategory: 'Food Items'
  },
  
  wholesale: {
    name: 'Wholesale Distribution',
    icon: Store,
    fields: {
      minimumOrder: { 
        label: 'Minimum Order Quantity', 
        type: 'number', 
        default: 1,
        helpText: 'Minimum units per order'
      },
      bulkPricing: { 
        label: 'Bulk Pricing Tiers', 
        type: 'boolean', 
        default: true,
        helpText: 'Enable quantity-based pricing'
      },
      leadTime: { 
        label: 'Lead Time (Days)', 
        type: 'number', 
        default: 7,
        helpText: 'Average delivery time'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price'],
    defaultCategory: 'Wholesale Goods'
  },
  
  services: {
    name: 'Professional Services',
    icon: Briefcase,
    fields: {
      serviceDuration: { 
        label: 'Service Duration (Hours)', 
        type: 'number', 
        default: 1,
        helpText: 'Typical service time required'
      },
      qualifiedStaff: { 
        label: 'Qualified Staff Required', 
        type: 'boolean', 
        default: false,
        helpText: 'Service requires certified professionals'
      },
      recurringBilling: { 
        label: 'Recurring Billing', 
        type: 'boolean', 
        default: false,
        helpText: 'Service is billed on recurring basis'
      }
    },
    requiredFields: ['name', 'category', 'price'],
    defaultCategory: 'Professional Services'
  },
  
  manufacturing: {
    name: 'Manufacturing',
    icon: Wrench,
    fields: {
      rawMaterials: { 
        label: 'Raw Material Tracking', 
        type: 'boolean', 
        default: true,
        helpText: 'Track raw material inventory'
      },
      productionTime: { 
        label: 'Production Time (Days)', 
        type: 'number', 
        default: 1,
        helpText: 'Time required to manufacture'
      },
      qualityCheck: { 
        label: 'Quality Control Required', 
        type: 'boolean', 
        default: true,
        helpText: 'Item requires quality inspection'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price'],
    defaultCategory: 'Manufactured Goods'
  }
} as const;

type IndustryType = keyof typeof INDUSTRY_CONFIGS;

const isValidIndustry = (value: any): value is IndustryType => {
  return typeof value === 'string' && Object.keys(INDUSTRY_CONFIGS).includes(value);
};

type IndustryFieldConfig = {
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select';
  required?: boolean;
  default?: any;
  helpText?: string;
  options?: string[];
};

// Dynamic schema based on selected industry
const createProductSchema = (industry: string) => {
  const industryConfig = INDUSTRY_CONFIGS[industry as IndustryType];
  
  let schemaObject = {
    id: z.string().optional(),
    name: z.string().min(1, 'Product name is required').min(2, 'Product name must be at least 2 characters'),
    category: z.string().min(1, 'Category is required'),
    sku: z.string().min(1, 'SKU is required').regex(/^[A-Za-z0-9-]+$/, 'SKU can only contain letters, numbers, and hyphens'),
    cost: z.coerce.number().min(0, 'Cost price must be non-negative').max(1000000, 'Cost price seems too high'),
    price: z.coerce.number().min(0, 'Selling price must be non-negative'),
    quantity: z.coerce.number().int().min(0, 'Stock quantity must be non-negative').max(1000000, 'Quantity seems too high'),
    minStock: z.coerce.number().int().min(0, 'Min. stock must be non-negative').max(10000, 'Min stock seems too high').optional(),
    industry: z.string().min(1, 'Industry is required'),
    industryFields: z.record(z.any()).optional(),
  };

  const baseSchema = z.object(schemaObject);

  const finalSchema = baseSchema.superRefine((data, ctx) => {
    // Price vs Cost validation
    if (data.price < data.cost) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Selling price should be greater than or equal to cost price",
        path: ["price"],
      });
    }

    // Industry-specific validations
    if (industryConfig) {
      Object.entries(industryConfig.fields).forEach(([field, config]) => {
        if ((config as IndustryFieldConfig).required && (config as IndustryFieldConfig).type !== 'boolean') {
          if (!data.industryFields?.[field]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `${(config as IndustryFieldConfig).label} is required for ${industryConfig.name} products`,
              path: ["industryFields", field],
            });
          }
        }
      });
    }
  });

  return finalSchema;
};

export type Product = z.infer<ReturnType<typeof createProductSchema>>;

interface ProductFormProps {
  product: Product | null;
  onSuccess: (product: Product) => void;
  onCancel?: () => void;
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  helpText?: string;
  isValid?: boolean;
}

const FormField = ({ label, error, children, required, helpText, isValid }: FormFieldProps) => (
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
    {isValid && !error && (
      <div className="flex items-center gap-1 text-green-500 text-sm">
        <Check className="w-4 h-4" />
        Looks good!
      </div>
    )}
  </div>
);

interface PriceComparisonProps {
  cost: number;
  price: number;
}

const PriceComparison = ({ cost, price }: PriceComparisonProps) => {
  const profit = price - cost;
  const margin = cost > 0 ? ((profit / cost) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
      <div className="text-center">
        <div className="font-semibold text-gray-600">Cost</div>
        <div className="text-red-600">${cost.toFixed(2)}</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-600">Profit</div>
        <div className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
          ${profit.toFixed(2)}
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-600">Margin</div>
        <div className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
          {margin.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

interface StockStatusProps {
  quantity: number;
  minStock: number;
}

const StockStatus = ({ quantity, minStock }: StockStatusProps) => {
  const status = quantity === 0 ? 'out-of-stock' : 
                 quantity <= minStock ? 'low-stock' : 'in-stock';
  
  const statusConfig = {
    'out-of-stock': { color: 'text-red-600', bg: 'bg-red-50', label: 'Out of Stock' },
    'low-stock': { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Low Stock' },
    'in-stock': { color: 'text-green-600', bg: 'bg-green-50', label: 'In Stock' }
  };

  const config = statusConfig[status];

  return (
    <div className={`${config.bg} ${config.color} px-3 py-2 rounded-lg text-sm font-medium`}>
      {config.label} ({quantity} units)
      {status === 'low-stock' && (
        <div className="text-xs mt-1">
          Below minimum stock level of {minStock}
        </div>
      )}
    </div>
  );
};

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>(() => 
    isValidIndustry(product?.industry) ? product!.industry : 'retail'
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const industryConfig = INDUSTRY_CONFIGS[selectedIndustry];
  const IndustryIcon = industryConfig?.icon || Package;

  const computeDefaultsForIndustry = (industry: IndustryType) => getMergedIndustryDefaults(industry);

  // Initialize industry fields with defaults
  const initializeIndustryFields = (industry: IndustryType) => {
    const config = INDUSTRY_CONFIGS[industry];
    const defaultIndustryFields: Record<string, any> = {};
    
    if (config?.fields) {
      Object.entries(config.fields).forEach(([key, fieldConfig]) => {
        defaultIndustryFields[key] = fieldConfig.default ?? '';
      });
    }
    
    return defaultIndustryFields;
  };

  const form = useForm<Product>({
    resolver: zodResolver(createProductSchema(selectedIndustry)),
    defaultValues: product || {
      name: '',
      category: industryConfig?.defaultCategory || '',
      sku: '',
      cost: 0,
      price: 0,
      quantity: 0,
      minStock: 10,
      industry: selectedIndustry,
      industryFields: initializeIndustryFields(selectedIndustry),
    },
  });

  const industry = form.watch('industry') as IndustryType;
  const cost = form.watch('cost') || 0;
  const price = form.watch('price') || 0;
  const quantity = form.watch('quantity') || 0;
  const minStock = form.watch('minStock') || 0;
  const industryFields = form.watch('industryFields') || {};

  // Update form validation when industry changes
  useEffect(() => {
    if (industry !== selectedIndustry) {
      if (isValidIndustry(industry)) {
        setSelectedIndustry(industry);
        const newConfig = INDUSTRY_CONFIGS[industry];
        
        // Reset industry-specific fields
        const defaultIndustryFields = initializeIndustryFields(industry);

        form.setValue('industryFields', defaultIndustryFields);
        form.setValue('category', newConfig?.defaultCategory || '');
      } else {
        // an invalid industry value was introduced in the form, probably from a draft.
        // reset it to the current selectedIndustry which is guaranteed to be valid.
        form.setValue('industry', selectedIndustry);
      }
    }
  }, [industry, form, selectedIndustry]);

  // Load draft on component mount
  useEffect(() => {
    if (!product) {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          if (confirm('You have unsaved product changes. Would you like to resume?')) {
            form.reset(draft.formData);
            setSelectedIndustry(draft.formData.industry);
          }
        } catch (error) {
          console.error('Error loading draft:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [product, form]);

  // Save draft when form changes
  useEffect(() => {
    if (!showSuccess && form.formState.isDirty) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData: form.getValues(),
      }));
      setHasChanges(true);
    }
  }, [form, showSuccess]);

  const handleIndustryFieldChange = (field: string, value: any) => {
    form.setValue('industryFields', {
      ...industryFields,
      [field]: value
    }, { shouldDirty: true });
  };

  const renderIndustryField = (key: string, fieldConfig: IndustryFieldConfig) => {
    const value = industryFields[key];
    const error = form.formState.errors.industryFields?.[key] as { message?: string } | undefined;

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
            type="button"
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
          {error && (
            <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
              <AlertCircle className="w-4 h-4" />
              {error.message}
            </div>
          )}
        </div>
      );
    }

    if (fieldConfig.type === 'date') {
      return (
        <FormField 
          key={key}
          label={fieldConfig.label}
          error={error?.message}
          helpText={fieldConfig.helpText}
          required={fieldConfig.required}
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !value && "text-muted-foreground"
                )}
              >
                {value ? (
                  format(new Date(value), "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleIndustryFieldChange(key, date)}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </FormField>
      );
    }

    if (fieldConfig.type === 'select') {
      return (
        <FormField 
          key={key}
          label={fieldConfig.label}
          error={error?.message}
          helpText={fieldConfig.helpText}
          required={fieldConfig.required}
        >
          <Select 
            value={value || ''} 
            onValueChange={(val) => handleIndustryFieldChange(key, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      );
    }

    return (
      <FormField 
        key={key}
        label={fieldConfig.label}
        error={error?.message}
        helpText={fieldConfig.helpText}
        required={fieldConfig.required}
        isValid={value && !error}
      >
        <Input
          type={fieldConfig.type}
          value={value || ''}
          onChange={(e) => {
            const newValue = fieldConfig.type === 'number' ? 
              (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
            handleIndustryFieldChange(key, newValue);
          }}
          placeholder={fieldConfig.helpText}
          className={error ? 'border-red-500' : value ? 'border-green-500' : ''}
        />
      </FormField>
    );
  };

  const handleSubmit = async (data: Product) => {
    try {
      setShowSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        onSuccess(data);
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error saving the product. Please try again.');
    }
  };

  const handleSaveDraft = () => {
    const formData = form.getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData }));
    alert('Product draft saved successfully! You can resume later.');
  };

  if (showSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            {product ? 'Product Updated!' : 'Product Created!'}
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            {form.getValues().name} has been {product ? 'updated' : 'added'} to your inventory.
          </p>
          <div className="space-y-2">
            <Button onClick={() => onSuccess(form.getValues())} className="w-full">
              View Product
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              {product ? 'Edit Another' : 'Create Another'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white rounded-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-7 h-7 md:w-8 md:h-8" />
                {product ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {activeTab === 'basic' && "Enter basic product information and industry classification"}
                {activeTab === 'pricing' && "Set pricing, costs, and profit margins"}
                {activeTab === 'inventory' && "Configure stock levels and inventory management"}
                {activeTab === 'industry' && industryConfig && `Configure ${industryConfig.name}-specific settings`}
                {activeTab === 'review' && "Review all product details before saving"}
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
                onClick={handleSaveDraft}
                variant="outline"
                type="button"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="border-b border-gray-200 w-full justify-start bg-white rounded-lg p-1 overflow-x-auto">
            <TabsTrigger value="basic" className="gap-2">
              <Package className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Warehouse className="w-4 h-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="industry" className="gap-2">
              <IndustryIcon className="w-4 h-4" />
              {industryConfig?.name} Settings
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Review
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Industry" 
                    required 
                    error={form.formState.errors.industry?.message}
                    helpText="Select the primary industry for this product"
                  >
                    <Select 
                      value={form.watch('industry')} 
                      onValueChange={(value) => form.setValue('industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(INDUSTRY_CONFIGS).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="w-4 h-4" />
                              {config.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField 
                    label="Product Category" 
                    required 
                    error={form.formState.errors.category?.message}
                    helpText="Specific category within the industry"
                    isValid={!!form.watch('category')}
                  >
                    <Input
                      placeholder={industryConfig?.defaultCategory}
                      {...form.register('category')}
                      className={form.formState.errors.category ? 'border-red-500' : form.watch('category') ? 'border-green-500' : ''}
                    />
                  </FormField>
                </div>

                <FormField 
                  label="Product Name" 
                  required 
                    error={form.formState.errors.name?.message}
                  helpText="Descriptive name that customers will see"
                  isValid={form.watch('name')?.length >= 2}
                >
                  <Input
                    placeholder="e.g., Logitech MX Master 3S"
                    {...form.register('name')}
                    className={form.formState.errors.name ? 'border-red-500' : form.watch('name')?.length >= 2 ? 'border-green-500' : ''}
                  />
                </FormField>

                <FormField 
                  label="SKU (Stock Keeping Unit)" 
                  required 
                  error={form.formState.errors.sku?.message}
                  helpText="Unique identifier for internal tracking"
                  isValid={!!form.watch('sku') && /^[A-Za-z0-9-]+$/.test(form.watch('sku'))}
                >
                  <Input
                    placeholder="LOG-MXM3S-BLK"
                    {...form.register('sku')}
                    className={form.formState.errors.sku ? 'border-red-500' : form.watch('sku') && /^[A-Za-z0-9-]+$/.test(form.watch('sku')) ? 'border-green-500' : ''}
                  />
                </FormField>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Product Pricing</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Cost Price" 
                    required 
                    error={form.formState.errors.cost?.message}
                    helpText="Your cost to acquire one unit"
                    isValid={cost >= 0 && cost < 1000000}
                  >
                    <Input
                      type="number"
                      placeholder="15.00"
                      {...form.register('cost')}
                      className={form.formState.errors.cost ? 'border-red-500' : cost >= 0 ? 'border-green-500' : ''}
                    />
                  </FormField>

                  <FormField 
                    label="Selling Price" 
                    required 
                    error={form.formState.errors.price?.message}
                    helpText="The price customers will pay"
                    isValid={price >= cost && price >= 0}
                  >
                    <Input
                      type="number"
                      placeholder="29.99"
                      {...form.register('price')}
                      className={form.formState.errors.price ? 'border-red-500' : price >= cost && price >= 0 ? 'border-green-500' : ''}
                    />
                  </FormField>
                </div>

                <PriceComparison cost={cost || 0} price={price || 0} />

                {price < cost && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Warning: Selling below cost</span>
                    </div>
                    <p className="text-amber-700 text-sm mt-1">
                      You are selling this product for less than it costs. This will result in a loss.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="mt-6">
            <Card className="border-gray-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Stock Management</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="Opening Stock Quantity" 
                    required 
                    error={form.formState.errors.quantity?.message}
                    helpText="Current available stock on hand"
                    isValid={quantity >= 0 && quantity < 1000000}
                  >
                    <Input
                      type="number"
                      placeholder="150"
                      {...form.register('quantity')}
                      className={form.formState.errors.quantity ? 'border-red-500' : quantity >= 0 ? 'border-green-500' : ''}
                    />
                  </FormField>

                  <FormField 
                    label="Minimum Stock Level" 
                    error={form.formState.errors.minStock?.message}
                    helpText="Get an alert when stock drops to this level"
                    isValid={minStock >= 0 && minStock < 10000}
                  >
                    <Input
                      type="number"
                      placeholder="10"
                      {...form.register('minStock')}
                      value={minStock || ''}
                      className={form.formState.errors.minStock ? 'border-red-500' : minStock >= 0 ? 'border-green-500' : ''}
                    />
                  </FormField>
                </div>

                <StockStatus quantity={quantity || 0} minStock={minStock || 10} />

                {quantity <= minStock && quantity > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Low Stock Alert</span>
                    </div>
                    <p className="text-amber-700 text-sm mt-1">
                      Stock level is at or below minimum. Consider reordering soon.
                    </p>
                  </div>
                )}

                {quantity === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Out of Stock</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      This product is currently out of stock. Update quantity when available.
                    </p>
                  </div>
                )}
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
                    <CardTitle className="text-lg">{industryConfig?.name} Settings</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure settings specific to {industryConfig?.name.toLowerCase()} products
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {industryConfig?.fields && 
                  Object.entries(industryConfig.fields).map(([key, fieldConfig]) => 
                    renderIndustryField(key, fieldConfig as IndustryFieldConfig)
                  )
                }

                {/* Required Fields Info */}
                {industryConfig?.requiredFields && (
                  <div className="border-t pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Information</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 mb-2">
                        The following fields are required for {industryConfig.name.toLowerCase()} products:
                      </p>
                      <ul className="space-y-1">
                        {industryConfig.requiredFields.map((field, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-blue-900">
                            <Check className="w-4 h-4 text-blue-600" />
                            {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="mt-6">
            <div className="space-y-6">
              <Card className="border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <p><span className="text-gray-500 font-medium">Industry:</span> {industryConfig?.name}</p>
                      <p><span className="text-gray-500 font-medium">Name:</span> {form.watch('name')}</p>
                      <p><span className="text-gray-500 font-medium">Category:</span> {form.watch('category')}</p>
                      <p><span className="text-gray-500 font-medium">SKU:</span> {form.watch('sku')}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('basic')}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <p><span className="text-gray-500 font-medium">Cost Price:</span> ${Number(form.watch('cost') || 0).toFixed(2)}</p>
                      <p><span className="text-gray-500 font-medium">Selling Price:</span> ${Number(form.watch('price') || 0).toFixed(2)}</p>
                      <p><span className="text-gray-500 font-medium">Profit Margin:</span> 
                        {cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : '0'}%
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('pricing')}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader className="border-b border-gray-200">
                  <CardTitle className="text-lg">Inventory</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <p><span className="text-gray-500 font-medium">Stock Quantity:</span> {form.watch('quantity')}</p>
                      <p><span className="text-gray-500 font-medium">Min Stock Level:</span> {form.watch('minStock') || 10}</p>
                      <div className="mt-2">
                        <StockStatus quantity={quantity} minStock={minStock} />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('inventory')}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {industryConfig?.fields && Object.keys(industryFields).length > 0 && (
                <Card className="border-gray-200">
                  <CardHeader className="border-b border-gray-200">
                    <CardTitle className="text-lg">{industryConfig.name} Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        {Object.entries(industryConfig.fields).map(([key, fieldConfig]) => {
                          const value = industryFields[key];
                          const config = fieldConfig as IndustryFieldConfig;
                          if (config.type === 'boolean') {
                            return (
                              <p key={key}>
                                <span className="text-gray-500 font-medium">{config.label}:</span> {value ? 'Yes' : 'No'}
                              </p>
                            );
                          }
                          if (config.type === 'date' && value) {
                            return (
                              <p key={key}>
                                <span className="text-gray-500 font-medium">{config.label}:</span> {format(new Date(value), "PPP")}
                              </p>
                            );
                          }
                          return (
                            <p key={key}>
                              <span className="text-gray-500 font-medium">{config.label}:</span> {value || 'Not set'}
                            </p>
                          );
                        })}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('industry')}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Navigation Buttons */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-white rounded-lg p-4 md:p-6 border border-gray-200 gap-4">
          <div>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} type="button">
                Cancel
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            {activeTab !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['basic', 'pricing', 'inventory', 'industry', 'review'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
                type="button"
              >
                Previous
              </Button>
            )}
            
            {activeTab !== 'review' ? (
              <Button 
                onClick={() => {
                  const tabs = ['basic', 'pricing', 'inventory', 'industry', 'review'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex + 1]);
                }}
                type="button"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={form.handleSubmit(handleSubmit)}
                className="bg-green-600 hover:bg-green-700"
                type="button"
              >
                <Check className="mr-2 h-4 w-4" />
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
