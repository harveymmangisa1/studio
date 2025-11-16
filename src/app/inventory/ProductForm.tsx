
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Package, CalendarIcon, Save, CheckCircle, AlertCircle, 
  DollarSign, Warehouse, ClipboardList, Check,
  ShoppingCart, Pill, Utensils, Store, Briefcase, Wrench,
  Truck, Scale, FileText, Barcode, Thermometer, Clock,
  Shield, Users, Zap, Cpu, TestTube
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const STORAGE_KEY = 'productFormDraft';

// Enhanced industry configurations with more comprehensive fields
const INDUSTRY_CONFIGS = {
  retail: {
    name: 'Retail',
    icon: ShoppingCart,
    fields: {
      warrantyPeriod: { 
        label: 'Warranty Period (Months)', 
        type: 'number', 
        default: 12,
        helpText: 'Manufacturer warranty duration in months',
        min: 0,
        max: 120
      },
      returnPolicy: { 
        label: 'Return Policy (Days)', 
        type: 'number', 
        default: 30,
        helpText: 'Number of days for customer returns',
        min: 0,
        max: 365
      },
      serialNumber: { 
        label: 'Serial Number Tracking', 
        type: 'boolean', 
        default: false,
        helpText: 'Track individual item serial numbers'
      },
      supplierCode: {
        label: 'Supplier Code',
        type: 'text',
        helpText: 'Internal supplier identification code',
        required: true
      },
      shippingWeight: {
        label: 'Shipping Weight (kg)',
        type: 'number',
        helpText: 'Product weight for shipping calculations',
        min: 0,
        max: 1000
      },
      dimensions: {
        label: 'Dimensions (L×W×H cm)',
        type: 'text',
        helpText: 'Product dimensions in centimeters',
        placeholder: '10×5×2'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price', 'supplierCode'],
    defaultCategory: 'General Merchandise'
  },
  
  pharmacy: {
    name: 'Pharmaceutical',
    icon: Pill,
    fields: {
      expiryDate: { 
        label: 'Expiry Date', 
        type: 'date', 
        required: true,
        helpText: 'Mandatory expiry date for medications'
      },
      batchNumber: { 
        label: 'Batch/Lot Number', 
        type: 'text', 
        required: true,
        helpText: 'Manufacturer batch identification number'
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
        helpText: 'Requires refrigerated storage (2-8°C)'
      },
      supplierLicense: { 
        label: 'Supplier License Number', 
        type: 'text', 
        required: true,
        helpText: 'Valid pharmaceutical supplier license number'
      },
      activeIngredients: {
        label: 'Active Ingredients',
        type: 'textarea',
        helpText: 'List of active pharmaceutical ingredients',
        required: true
      },
      dosageForm: {
        label: 'Dosage Form',
        type: 'select',
        options: ['Tablet', 'Capsule', 'Liquid', 'Injection', 'Cream', 'Ointment', 'Inhaler'],
        required: true,
        helpText: 'Pharmaceutical dosage form'
      },
      storageConditions: {
        label: 'Storage Conditions',
        type: 'textarea',
        helpText: 'Specific storage requirements and conditions'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price', 'expiryDate', 'batchNumber', 'supplierLicense', 'activeIngredients', 'dosageForm'],
    defaultCategory: 'Medications'
  },
  
  restaurant: {
    name: 'Food Service',
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
        type: 'textarea', 
        helpText: 'List of potential allergens (gluten, nuts, dairy, etc.)',
        required: true
      },
      storageTemp: { 
        label: 'Storage Temperature', 
        type: 'select', 
        options: ['Ambient (15-25°C)', 'Refrigerated (2-8°C)', 'Frozen (-18°C or below)'],
        default: 'Ambient (15-25°C)',
        helpText: 'Required storage temperature range'
      },
      preparationTime: { 
        label: 'Prep Time (Minutes)', 
        type: 'number', 
        default: 0,
        helpText: 'Average preparation time in minutes',
        min: 0,
        max: 480
      },
      nutritionInfo: {
        label: 'Nutritional Information',
        type: 'textarea',
        helpText: 'Calories, protein, carbs, fat per serving'
      },
      cookingInstructions: {
        label: 'Cooking Instructions',
        type: 'textarea',
        helpText: 'Preparation and cooking guidelines'
      },
      portionSize: {
        label: 'Portion Size',
        type: 'text',
        helpText: 'Serving size description (e.g., 200g, 1 plate)'
      }
    },
    requiredFields: ['name', 'category', 'cost', 'price', 'expiryDate', 'allergenInfo'],
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
        helpText: 'Minimum units per wholesale order',
        min: 1
      },
      bulkPricing: { 
        label: 'Bulk Pricing Tiers', 
        type: 'boolean', 
        default: true,
        helpText: 'Enable quantity-based pricing tiers'
      },
      leadTime: { 
        label: 'Lead Time (Days)', 
        type: 'number', 
        default: 7,
        helpText: 'Average delivery time in business days',
        min: 0,
        max: 90
      },
      palletQuantity: {
        label: 'Units per Pallet',
        type: 'number',
        helpText: 'Number of units that fit on a standard pallet',
        min: 1
      },
      caseQuantity: {
        label: 'Units per Case',
        type: 'number',
        helpText: 'Number of units per shipping case',
        min: 1
      },
      supplierTerms: {
        label: 'Supplier Payment Terms',
        type: 'select',
        options: ['Net 30', 'Net 60', 'Net 90', 'COD', '50% Advance'],
        default: 'Net 30',
        helpText: 'Payment terms with supplier'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price', 'minimumOrder'],
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
        helpText: 'Typical service time required in hours',
        min: 0.5,
        max: 100,
        step: 0.5
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
      },
      serviceType: {
        label: 'Service Type',
        type: 'select',
        options: ['Consultation', 'Implementation', 'Support', 'Training', 'Maintenance'],
        required: true,
        helpText: 'Type of professional service'
      },
      certificationRequired: {
        label: 'Certification Required',
        type: 'boolean',
        default: false,
        helpText: 'Service provider requires specific certifications'
      },
      serviceLevelAgreement: {
        label: 'SLA Included',
        type: 'boolean',
        default: false,
        helpText: 'Includes Service Level Agreement'
      }
    },
    requiredFields: ['name', 'category', 'price', 'serviceType'],
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
        helpText: 'Track raw material inventory for production'
      },
      productionTime: { 
        label: 'Production Time (Days)', 
        type: 'number', 
        default: 1,
        helpText: 'Time required to manufacture in days',
        min: 0,
        max: 365
      },
      qualityCheck: { 
        label: 'Quality Control Required', 
        type: 'boolean', 
        default: true,
        helpText: 'Item requires quality inspection before shipping'
      },
      bomRequired: {
        label: 'Bill of Materials',
        type: 'boolean',
        default: true,
        helpText: 'Product requires Bill of Materials'
      },
      complianceStandards: {
        label: 'Compliance Standards',
        type: 'textarea',
        helpText: 'Industry compliance standards (ISO, ASTM, etc.)'
      },
      equipmentRequirements: {
        label: 'Equipment Requirements',
        type: 'textarea',
        helpText: 'Specialized equipment needed for production'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price'],
    defaultCategory: 'Manufactured Goods'
  },

  logistics: {
    name: 'Logistics & Shipping',
    icon: Truck,
    fields: {
      hazardousMaterial: {
        label: 'Hazardous Material',
        type: 'boolean',
        default: false,
        helpText: 'Contains hazardous materials requiring special handling'
      },
      storageRequirements: {
        label: 'Storage Requirements',
        type: 'textarea',
        helpText: 'Special storage conditions and requirements'
      },
      handlingInstructions: {
        label: 'Handling Instructions',
        type: 'textarea',
        helpText: 'Special handling and safety instructions'
      },
      customsInfo: {
        label: 'Customs Information',
        type: 'textarea',
        helpText: 'Required customs documentation and codes'
      },
      insuranceRequired: {
        label: 'Insurance Required',
        type: 'boolean',
        default: false,
        helpText: 'Requires additional insurance coverage'
      }
    },
    requiredFields: ['name', 'category', 'cost', 'price'],
    defaultCategory: 'Logistics Services'
  },

  electronics: {
    name: 'Electronics',
    icon: Cpu,
    fields: {
      warrantyPeriod: {
        label: 'Warranty Period (Months)',
        type: 'number',
        default: 24,
        helpText: 'Manufacturer warranty duration',
        min: 0,
        max: 120
      },
      voltageRequirements: {
        label: 'Voltage Requirements',
        type: 'text',
        helpText: 'Input voltage range (e.g., 100-240V)'
      },
      certification: {
        label: 'Safety Certification',
        type: 'text',
        helpText: 'Safety certifications (CE, UL, FCC, etc.)'
      },
      technicalSpecs: {
        label: 'Technical Specifications',
        type: 'textarea',
        helpText: 'Detailed technical specifications and features'
      },
      compatibility: {
        label: 'Compatibility Information',
        type: 'textarea',
        helpText: 'Compatible devices and systems'
      }
    },
    requiredFields: ['name', 'category', 'sku', 'cost', 'price'],
    defaultCategory: 'Electronic Goods'
  }
} as const;

type IndustryType = keyof typeof INDUSTRY_CONFIGS;
type IndustryFieldConfig = {
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'textarea';
  required?: boolean;
  default?: any;
  helpText?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

// Enhanced validation schema with better industry-specific validation
const createProductSchema = (industry: string) => {
  const industryConfig = INDUSTRY_CONFIGS[industry as IndustryType];
  
  let baseSchema = z.object({
    id: z.string().optional(),
    name: z.string()
      .min(1, 'Product name is required')
      .min(2, 'Product name must be at least 2 characters')
      .max(200, 'Product name must be less than 200 characters'),
    description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
    category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters'),
    sku: z.string()
      .min(1, 'SKU is required')
      .max(50, 'SKU must be less than 50 characters')
      .regex(/^[A-Za-z0-9-_.]+$/, 'SKU can only contain letters, numbers, hyphens, underscores, and periods'),
    cost: z.coerce.number()
      .min(0, 'Cost price must be non-negative')
      .max(10000000, 'Cost price cannot exceed $10,000,000')
      .refine(val => !isNaN(val), 'Cost must be a valid number'),
    price: z.coerce.number()
      .min(0, 'Selling price must be non-negative')
      .max(10000000, 'Selling price cannot exceed $10,000,000')
      .refine(val => !isNaN(val), 'Price must be a valid number'),
    quantity: z.coerce.number()
      .int('Quantity must be a whole number')
      .min(0, 'Stock quantity must be non-negative')
      .max(10000000, 'Quantity cannot exceed 10,000,000'),
    minStock: z.coerce.number()
      .int('Minimum stock must be a whole number')
      .min(0, 'Minimum stock must be non-negative')
      .max(100000, 'Minimum stock cannot exceed 100,000')
      .optional(),
    industry: z.string().min(1, 'Industry is required'),
    industryFields: z.record(z.any()).optional(),
    barcode: z.string().max(100, 'Barcode must be less than 100 characters').optional(),
    supplier: z.string().max(200, 'Supplier name must be less than 200 characters').optional(),
  });

  // Add industry-specific validations
  if (industryConfig) {
    const industryFieldsSchema: Record<string, any> = {};
    
    Object.entries(industryConfig.fields).forEach(([field, config]) => {
      const fieldConfig = config as IndustryFieldConfig;
      
      let fieldSchema: z.ZodTypeAny;

      switch (fieldConfig.type) {
        case 'number':
          fieldSchema = z.coerce.number()
            .min(fieldConfig.min ?? 0, `${fieldConfig.label} must be at least ${fieldConfig.min ?? 0}`)
            .max(fieldConfig.max ?? 1000000, `${fieldConfig.label} cannot exceed ${fieldConfig.max ?? 1000000}`);
          break;
        case 'text':
        case 'textarea':
          fieldSchema = z.string();
          break;
        case 'date':
          fieldSchema = z.string();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.any();
      }

      if (fieldConfig.required) {
        if (fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(1, `${fieldConfig.label} is required`);
        }
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      industryFieldsSchema[field] = fieldSchema;
    });

    if (Object.keys(industryFieldsSchema).length > 0) {
      baseSchema = baseSchema.extend({
        industryFields: z.object(industryFieldsSchema)
      });
    }
  }

  // Apply refine at the end
  return baseSchema.refine((data) => data.price >= data.cost, {
    message: "Selling price should be greater than or equal to cost price",
    path: ["price"],
  });
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
  const margin = cost > 0 ? ((profit / cost) * 100) : price > 0 ? 100 : 0;

  return (
    <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-4 rounded-lg border">
      <div className="text-center">
        <div className="font-semibold text-gray-600">Cost</div>
        <div className="text-red-600 font-medium">${cost.toFixed(2)}</div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-600">Profit</div>
        <div className={profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
          ${profit.toFixed(2)}
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold text-gray-600">Margin</div>
        <div className={margin >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
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
    'out-of-stock': { 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      label: 'Out of Stock',
      icon: AlertCircle
    },
    'low-stock': { 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      label: 'Low Stock',
      icon: AlertCircle
    },
    'in-stock': { 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      label: 'In Stock',
      icon: CheckCircle
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`${config.bg} ${config.color} border ${config.border} px-4 py-3 rounded-lg`}>
      <div className="flex items-center gap-2 font-medium">
        <StatusIcon className="w-4 h-4" />
        {config.label} ({quantity.toLocaleString()} units)
      </div>
      {status === 'low-stock' && (
        <div className="text-sm mt-1 opacity-90">
          Below minimum stock level of {minStock.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>(product?.industry as IndustryType || 'retail');
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const industryConfig = INDUSTRY_CONFIGS[selectedIndustry];
  const IndustryIcon = industryConfig?.icon || Package;

  // Initialize industry fields with defaults
  const initializeIndustryFields = (industry: IndustryType) => {
    const config = INDUSTRY_CONFIGS[industry];
    const defaultIndustryFields: Record<string, any> = {};
    
    if (config?.fields) {
      Object.entries(config.fields).forEach(([key, fieldConfig]) => {
        const config = fieldConfig as IndustryFieldConfig;
        defaultIndustryFields[key] = product?.industryFields?.[key] ?? config.default ?? '';
      });
    }
    
    return defaultIndustryFields;
  };

  const form = useForm<Product>({
    resolver: zodResolver(createProductSchema(selectedIndustry)),
    defaultValues: product || {
      name: '',
      description: '',
      category: industryConfig?.defaultCategory || '',
      sku: '',
      barcode: '',
      supplier: '',
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
      setSelectedIndustry(industry);
      const newConfig = INDUSTRY_CONFIGS[industry];
      
      // Reset industry-specific fields
      const defaultIndustryFields = initializeIndustryFields(industry);

      form.setValue('industryFields', defaultIndustryFields);
      form.setValue('category', newConfig?.defaultCategory || '');
      
      // Update form validation schema
      form.setValue('industry', industry);
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
        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex-1">
            <Label className="text-sm font-medium text-gray-700">
              {fieldConfig.label}
              {fieldConfig.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {fieldConfig.helpText && (
              <p className="text-xs text-gray-500 mt-1">{fieldConfig.helpText}</p>
            )}
          </div>
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleIndustryFieldChange(key, checked)}
          />
          {error && (
            <div className="flex items-center gap-1 text-red-500 text-sm mt-1 col-span-2">
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
                  !value && "text-muted-foreground",
                  error && "border-red-500",
                  value && !error && "border-green-500"
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
                onSelect={(date) => handleIndustryFieldChange(key, date?.toISOString())}
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
            <SelectTrigger className={error ? 'border-red-500' : value ? 'border-green-500' : ''}>
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

    if (fieldConfig.type === 'textarea') {
      return (
        <FormField 
          key={key}
          label={fieldConfig.label}
          error={error?.message}
          helpText={fieldConfig.helpText}
          required={fieldConfig.required}
          isValid={value && !error}
        >
          <Textarea
            value={value || ''}
            onChange={(e) => handleIndustryFieldChange(key, e.target.value)}
            placeholder={fieldConfig.placeholder || fieldConfig.helpText}
            className={cn(
              "min-h-[80px]",
              error ? 'border-red-500' : value ? 'border-green-500' : ''
            )}
          />
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
          placeholder={fieldConfig.placeholder}
          min={fieldConfig.min}
          max={fieldConfig.max}
          step={fieldConfig.step}
          className={error ? 'border-red-500' : value ? 'border-green-500' : ''}
        />
      </FormField>
    );
  };

  const handleSubmit = async (data: Product) => {
    try {
      setIsSubmitting(true);
      setShowSuccess(true);
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => {
        onSuccess(data);
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error saving the product. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const formData = form.getValues();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData }));
    alert('Product draft saved successfully! You can resume later.');
  };

  const handleClearDraft = () => {
    if (confirm('Are you sure you want to clear your draft? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      form.reset();
      setHasChanges(false);
    }
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Package className="w-6 h-6 sm:w-8 sm:h-8" />
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
            <div className="flex flex-col sm:flex-row gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </div>
              )}
              <div className="flex gap-2">
                {hasChanges && (
                  <Button 
                    onClick={handleClearDraft}
                    variant="outline"
                    size="sm"
                    type="button"
                  >
                    Clear Draft
                  </Button>
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
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <TabsList className="w-full justify-start bg-transparent">
              <TabsTrigger value="basic" className="gap-2 flex-1 sm:flex-none">
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Basic Info</span>
              </TabsTrigger>
              <TabsTrigger value="pricing" className="gap-2 flex-1 sm:flex-none">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Pricing</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2 flex-1 sm:flex-none">
                <Warehouse className="w-4 h-4" />
                <span className="hidden sm:inline">Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="industry" className="gap-2 flex-1 sm:flex-none">
                <IndustryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{industryConfig?.name}</span>
              </TabsTrigger>
              <TabsTrigger value="review" className="gap-2 flex-1 sm:flex-none">
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Review</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
                <CardDescription>
                  Enter the basic details that identify your product across all systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField 
                  label="Industry" 
                  required 
                  error={form.formState.errors.industry?.message}
                  helpText="Select the primary industry for this product. This will determine available fields and requirements."
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <FormField 
                    label="Supplier"
                    error={form.formState.errors.supplier?.message}
                    helpText="Primary supplier or manufacturer"
                  >
                    <Input
                      placeholder="Supplier name"
                      {...form.register('supplier')}
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
                    placeholder="e.g., Logitech MX Master 3S Wireless Mouse"
                    {...form.register('name')}
                    className={form.formState.errors.name ? 'border-red-500' : form.watch('name')?.length >= 2 ? 'border-green-500' : ''}
                  />
                </FormField>

                <FormField 
                  label="Product Description"
                  error={form.formState.errors.description?.message}
                  helpText="Detailed description of the product features and benefits"
                >
                  <Textarea
                    placeholder="Describe your product in detail..."
                    {...form.register('description')}
                    className="min-h-[100px]"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    label="SKU (Stock Keeping Unit)" 
                    required 
                    error={form.formState.errors.sku?.message}
                    helpText="Unique identifier for internal tracking"
                    isValid={!!form.watch('sku') && /^[A-Za-z0-9-_.]+$/.test(form.watch('sku'))}
                  >
                    <Input
                      placeholder="LOG-MXM3S-BLK"
                      {...form.register('sku')}
                      className={form.formState.errors.sku ? 'border-red-500' : form.watch('sku') && /^[A-Za-z0-9-_.]+$/.test(form.watch('sku')) ? 'border-green-500' : ''}
                    />
                  </FormField>

                  <FormField 
                    label="Barcode (UPC/EAN)"
                    error={form.formState.errors.barcode?.message}
                    helpText="Scannable barcode for point of sale"
                  >
                    <Input
                      placeholder="123456789012"
                      {...form.register('barcode')}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Pricing</CardTitle>
                <CardDescription>
                  Set your pricing strategy and monitor profit margins
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField 
                    label="Cost Price" 
                    required 
                    error={form.formState.errors.cost?.message}
                    helpText="Your cost to acquire or produce one unit"
                    isValid={cost >= 0 && cost < 10000000}
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="15.00"
                        {...form.register('cost')}
                        className={`pl-8 ${form.formState.errors.cost ? 'border-red-500' : cost >= 0 ? 'border-green-500' : ''}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </FormField>

                  <FormField 
                    label="Selling Price" 
                    required 
                    error={form.formState.errors.price?.message}
                    helpText="The price customers will pay"
                    isValid={price >= cost && price >= 0}
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        type="number"
                        placeholder="29.99"
                        {...form.register('price')}
                        className={`pl-8 ${form.formState.errors.price ? 'border-red-500' : price >= cost && price >= 0 ? 'border-green-500' : ''}`}
                        step="0.01"
                        min="0"
                      />
                    </div>
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
                      You are selling this product for ${(cost - price).toFixed(2)} less than it costs. This will result in a loss on every sale.
                    </p>
                  </div>
                )}

                {price === cost && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Breaking Even</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      You are selling this product at cost price. Consider adding a margin to generate profit.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Management</CardTitle>
                <CardDescription>
                  Configure inventory levels and stock alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FormField 
                    label="Current Stock Quantity" 
                    required 
                    error={form.formState.errors.quantity?.message}
                    helpText="Current available stock on hand"
                    isValid={quantity >= 0 && quantity < 10000000}
                  >
                    <Input
                      type="number"
                      placeholder="150"
                      {...form.register('quantity')}
                      className={form.formState.errors.quantity ? 'border-red-500' : quantity >= 0 ? 'border-green-500' : ''}
                      min="0"
                    />
                  </FormField>

                  <FormField 
                    label="Minimum Stock Level" 
                    error={form.formState.errors.minStock?.message}
                    helpText="Get an alert when stock drops to this level"
                    isValid={minStock >= 0 && minStock < 100000}
                  >
                    <Input
                      type="number"
                      placeholder="10"
                      {...form.register('minStock')}
                      value={minStock || ''}
                      className={form.formState.errors.minStock ? 'border-red-500' : minStock >= 0 ? 'border-green-500' : ''}
                      min="0"
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
                      Stock level is at or below minimum. Consider reordering soon to avoid stockouts.
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
                      This product is currently out of stock. Update quantity when new stock arrives.
                    </p>
                  </div>
                )}

                {quantity > minStock * 2 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Healthy Stock Level</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Stock level is well above minimum. No immediate reordering needed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industry-Specific Tab */}
          <TabsContent value="industry" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <IndustryIcon className="w-6 h-6 text-gray-700" />
                  <div>
                    <CardTitle>{industryConfig?.name} Settings</CardTitle>
                    <CardDescription>
                      Configure settings specific to {industryConfig?.name.toLowerCase()} products
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {industryConfig.fields && 
                    Object.entries(industryConfig.fields).map(([key, fieldConfig]) => 
                      renderIndustryField(key, fieldConfig as IndustryFieldConfig)
                    )
                  }
                </div>

                {/* Required Fields Info */}
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Required Information for {industryConfig.name}</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 mb-2">
                      The following fields are required for {industryConfig.name.toLowerCase()} products to ensure compliance and proper management:
                    </p>
                    <ul className="space-y-2">
                      {industryConfig.requiredFields.map((field, idx) => {
                        const fieldLabel = field === 'industryFields' ? '' : 
                          field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
                        return (
                          <li key={idx} className="flex items-center gap-2 text-sm text-blue-900">
                            <Check className="w-4 h-4 text-blue-600" />
                            {fieldLabel || 'Industry-specific fields'}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Industry</p>
                          <p className="flex items-center gap-2">
                            <IndustryIcon className="w-4 h-4" />
                            {industryConfig.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Category</p>
                          <p>{form.watch('category')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Product Name</p>
                          <p className="font-medium">{form.watch('name')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">SKU</p>
                          <p className="font-mono">{form.watch('sku')}</p>
                        </div>
                        {form.watch('supplier') && (
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Supplier</p>
                            <p>{form.watch('supplier')}</p>
                          </div>
                        )}
                        {form.watch('barcode') && (
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Barcode</p>
                            <p className="font-mono">{form.watch('barcode')}</p>
                          </div>
                        )}
                      </div>
                      {form.watch('description') && (
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Description</p>
                          <p className="text-sm">{form.watch('description')}</p>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('basic')}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Cost Price</p>
                          <p className="text-lg font-semibold text-red-600">${form.watch('cost')?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Selling Price</p>
                          <p className="text-lg font-semibold text-green-600">${form.watch('price')?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Profit</p>
                          <p className={`text-lg font-semibold ${(price - cost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${((price || 0) - (cost || 0)).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Margin</p>
                          <p className={`text-lg font-semibold ${(price - cost) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : price > 0 ? '100' : '0'}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('pricing')}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Stock Quantity</p>
                          <p className="text-lg font-semibold">{form.watch('quantity')?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Min Stock Level</p>
                          <p className="text-lg font-semibold">{(form.watch('minStock') || 10)?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="max-w-md">
                        <StockStatus quantity={quantity} minStock={minStock} />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('inventory')}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {industryConfig.fields && Object.keys(industryFields).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>{industryConfig.name} Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(industryConfig.fields).map(([key, fieldConfig]) => {
                            const value = industryFields[key];
                            const config = fieldConfig as IndustryFieldConfig;
                            
                            if (config.type === 'boolean') {
                              return (
                                <div key={key}>
                                  <p className="text-sm text-gray-500 font-medium">{config.label}</p>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span>{value ? 'Yes' : 'No'}</span>
                                  </div>
                                </div>
                              );
                            }
                            
                            if (config.type === 'date' && value) {
                              return (
                                <div key={key}>
                                  <p className="text-sm text-gray-500 font-medium">{config.label}</p>
                                  <p>{format(new Date(value), "PPP")}</p>
                                </div>
                              );
                            }
                            
                            if (value) {
                              return (
                                <div key={key}>
                                  <p className="text-sm text-gray-500 font-medium">{config.label}</p>
                                  <p className={config.type === 'textarea' ? 'whitespace-pre-wrap' : ''}>
                                    {value}
                                  </p>
                                </div>
                              );
                            }
                            
                            return null;
                          }).filter(Boolean)}
                        </div>
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg p-6 border border-gray-200">
          <div>
            {onCancel && (
              <Button variant="outline" onClick={onCancel} type="button">
                Cancel
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {activeTab !== 'basic' && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ['basic', 'pricing', 'inventory', 'industry', 'review'];
                  const currentIndex = tabs.indexOf(activeTab);
                  setActiveTab(tabs[currentIndex - 1]);
                }}
                type="button"
                className="order-2 sm:order-1"
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
                className="order-1 sm:order-2"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={form.handleSubmit(handleSubmit)}
                className="bg-green-600 hover:bg-green-700 order-1 sm:order-2"
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    {product ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {product ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
