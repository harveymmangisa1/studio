"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ArrowLeft, ArrowRight, Check, AlertCircle, Save, CheckCircle, Package } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const STORAGE_KEY = 'productFormDraft';

// Enhanced schema with better validation
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Product name is required').min(2, 'Product name must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required').regex(/^[A-Za-z0-9-]+$/, 'SKU can only contain letters, numbers, and hyphens'),
  cost: z.coerce.number().min(0, 'Cost price must be non-negative').max(1000000, 'Cost price seems too high'),
  price: z.coerce.number().min(0, 'Selling price must be non-negative'),
  quantity: z.coerce.number().int().min(0, 'Stock quantity must be non-negative').max(1000000, 'Quantity seems too high'),
  minStock: z.coerce.number().int().min(0, 'Min. stock must be non-negative').max(10000, 'Min stock seems too high').optional(),
  industryCategory: z.string().min(1, 'Industry category is required'),
  expiryDate: z.date().optional(),
}).refine((data) => data.price >= data.cost, {
  message: "Selling price should be greater than or equal to cost price",
  path: ["price"],
});

export type Product = z.infer<typeof productSchema>;

interface ProductFormProps {
  product: Product | null;
  onSuccess: (product: Product) => void;
  onCancel?: () => void;
}

const ProgressBar = ({ currentStep, completedSteps }) => {
  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Pricing' },
    { number: 3, label: 'Inventory' },
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

const FormField = ({ label, error, children, required, helpText, isValid }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
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

const PriceComparison = ({ cost, price }) => {
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

const StockStatus = ({ quantity, minStock }) => {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: '',
      category: '',
      sku: '',
      cost: 0,
      price: 0,
      quantity: 0,
      minStock: 10,
      industryCategory: 'General Retail',
    },
  });

  const industryCategory = form.watch('industryCategory');
  const cost = form.watch('cost');
  const price = form.watch('price');
  const quantity = form.watch('quantity');
  const minStock = form.watch('minStock') || 0;

  useEffect(() => {
    if (!product) {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (confirm('You have unsaved product changes. Would you like to resume?')) {
          form.reset(draft.formData);
          setCurrentStep(draft.currentStep);
          setCompletedSteps(draft.completedSteps);
        }
      }
    }
  }, [product, form]);

  useEffect(() => {
    if (!showSuccess) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        formData: form.getValues(),
        currentStep,
        completedSteps
      }));
    }
  }, [form, currentStep, completedSteps, showSuccess]);

  const validateStep = (step: number): boolean => {
    const values = form.getValues();
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!values.name || values.name.length < 2) {
        errors.name = 'Product name must be at least 2 characters';
      }
      if (!values.category) {
        errors.category = 'Category is required';
      }
      if (!values.sku) {
        errors.sku = 'SKU is required';
      } else if (!/^[A-Za-z0-9-]+$/.test(values.sku)) {
        errors.sku = 'SKU can only contain letters, numbers, and hyphens';
      }
    }

    if (step === 2) {
      if (values.cost < 0) errors.cost = 'Cost must be non-negative';
      if (values.price < 0) errors.price = 'Price must be non-negative';
      if (values.price < values.cost) errors.price = 'Price should be greater than cost';
    }

    if (step === 3) {
      if (values.quantity < 0) errors.quantity = 'Quantity must be non-negative';
      if (values.minStock && values.minStock < 0) errors.minStock = 'Min stock must be non-negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      const result = await form.handleSubmit((data) => {
        setShowSuccess(true);
        localStorage.removeItem(STORAGE_KEY);
        setTimeout(() => {
          onSuccess(data);
        }, 2000);
      })();
      return result;
    }
  };

  const handleSaveDraft = () => {
    alert('Product draft saved successfully! You can resume later.');
  };

  if (showSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center py-12">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {product ? 'Product Updated!' : 'Product Created!'}
          </h3>
          <p className="text-gray-600 mb-6">
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
    <Card className="w-full max-w-2xl mx-auto border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          {product ? 'Edit Product' : 'Add New Product'}
        </CardTitle>
        <CardDescription>
          {currentStep === 1 && "Enter basic product information and categorization"}
          {currentStep === 2 && "Set pricing and profit margins"}
          {currentStep === 3 && "Configure inventory levels and stock management"}
          {currentStep === 4 && "Review all product details before saving"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

        <form onSubmit={form.handleSubmit(onSuccess)} className="space-y-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField 
                    label="Product Name" 
                    required 
                    error={formErrors.name}
                    helpText="Descriptive name that customers will see"
                    isValid={form.watch('name')?.length >= 2}
                  >
                    <Input
                      placeholder="e.g., Logitech MX Master 3S"
                      {...form.register('name')}
                      className={formErrors.name ? 'border-red-500' : form.watch('name')?.length >= 2 ? 'border-green-500' : ''}
                    />
                  </FormField>

                  <FormField 
                    label="SKU (Stock Keeping Unit)" 
                    required 
                    error={formErrors.sku}
                    helpText="Unique identifier for internal tracking"
                    isValid={!!form.watch('sku') && /^[A-Za-z0-9-]+$/.test(form.watch('sku'))}
                  >
                    <Input
                      placeholder="LOG-MXM3S-BLK"
                      {...form.register('sku')}
                      className={formErrors.sku ? 'border-red-500' : form.watch('sku') && /^[A-Za-z0-9-]+$/.test(form.watch('sku')) ? 'border-green-500' : ''}
                    />
                  </FormField>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categorization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField 
                    label="Industry Category" 
                    required 
                    error={formErrors.industryCategory}
                    helpText="Select the primary industry for this product"
                    isValid={!!form.watch('industryCategory')}
                  >
                    <Select
                      value={form.watch('industryCategory')}
                      onValueChange={(value) => form.setValue('industryCategory', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Retail">General Retail</SelectItem>
                        <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                        <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                  <FormField 
                    label="Product Category" 
                    required 
                    error={formErrors.category}
                    helpText="Specific category within the industry"
                    isValid={!!form.watch('category')}
                  >
                    <Input
                      placeholder="e.g., Computer Accessories"
                      {...form.register('category')}
                      className={formErrors.category ? 'border-red-500' : form.watch('category') ? 'border-green-500' : ''}
                    />
                  </FormField>
                  {industryCategory === 'Pharmacy' && (
                    <FormField 
                      label="Expiry Date" 
                      helpText="Required for pharmaceutical products"
                    >
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !form.watch('expiryDate') && "text-muted-foreground"
                            )}
                          >
                            {form.watch('expiryDate') ? (
                              format(form.watch('expiryDate')!, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={form.watch('expiryDate')}
                            onSelect={(date) => form.setValue('expiryDate', date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormField>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Pricing */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      label="Cost Price" 
                      required 
                      error={formErrors.cost}
                      helpText="Your cost to acquire one unit of the product."
                      isValid={cost >= 0 && cost < 1000000}
                    >
                      <Input
                        type="number"
                        placeholder="15.00"
                        {...form.register('cost')}
                        className={formErrors.cost ? 'border-red-500' : cost >= 0 ? 'border-green-500' : ''}
                      />
                    </FormField>

                    <FormField 
                      label="Selling Price" 
                      required 
                      error={formErrors.price}
                      helpText="The price customers will pay."
                      isValid={price >= cost && price >= 0}
                    >
                      <Input
                        type="number"
                        placeholder="29.99"
                        {...form.register('price')}
                        className={formErrors.price ? 'border-red-500' : price >= cost && price >= 0 ? 'border-green-500' : ''}
                      />
                    </FormField>
                  </div>

                  <PriceComparison cost={cost || 0} price={price || 0} />

                  {price < cost && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
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
            </div>
          )}

          {/* Step 3: Inventory */}
          {currentStep === 3 && (
            <div className="space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Stock Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField 
                      label="Opening Stock Quantity" 
                      required 
                      error={formErrors.quantity}
                      helpText="Current available stock on hand."
                      isValid={quantity >= 0 && quantity < 1000000}
                    >
                      <Input
                        type="number"
                        placeholder="150"
                        {...form.register('quantity')}
                        className={formErrors.quantity ? 'border-red-500' : quantity >= 0 ? 'border-green-500' : ''}
                      />
                    </FormField>

                    <FormField 
                      label="Minimum Stock Level" 
                      error={formErrors.minStock}
                      helpText="Get an alert when stock drops to this level."
                      isValid={minStock >= 0 && minStock < 10000}
                    >
                      <Input
                        type="number"
                        placeholder="10"
                        {...form.register('minStock')}
                        value={minStock || ''}
                        className={formErrors.minStock ? 'border-red-500' : minStock >= 0 ? 'border-green-500' : ''}
                      />
                    </FormField>
                  </div>

                  <StockStatus quantity={quantity || 0} minStock={minStock || 10} />

                  {quantity <= minStock && quantity > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
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
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
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
                  <p><span className="text-gray-500">Industry:</span> {form.watch('industryCategory')}</p>
                  <p><span className="text-gray-500">Name:</span> {form.watch('name')}</p>
                  <p><span className="text-gray-500">Category:</span> {form.watch('category')}</p>
                  <p><span className="text-gray-500">SKU:</span> {form.watch('sku')}</p>
                  {form.watch('expiryDate') && (
                    <p><span className="text-gray-500">Expiry:</span> {format(form.watch('expiryDate')!, "PPP")}</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Pricing</h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>Edit</Button>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Cost Price:</span> ${form.watch('cost')?.toFixed(2)}</p>
                  <p><span className="text-gray-500">Selling Price:</span> ${form.watch('price')?.toFixed(2)}</p>
                  <p><span className="text-gray-500">Profit Margin:</span> 
                    {cost > 0 ? (((price - cost) / cost) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Inventory</h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>Edit</Button>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Stock Quantity:</span> {form.watch('quantity')}</p>
                  <p><span className="text-gray-500">Min Stock Level:</span> {form.watch('minStock') || 10}</p>
                  <div className="mt-2">
                    <StockStatus quantity={quantity} minStock={minStock} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {onCancel && currentStep === 1 && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Check className="mr-2 h-4 w-4" />
                {product ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
