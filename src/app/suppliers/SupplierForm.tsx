'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  payment_terms: string;
  created_at: string;
}

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSave: (supplier: Supplier) => void;
  onCancel: () => void;
}

export function SupplierForm({ supplier, onSave, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    payment_terms: 'Net 30',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        payment_terms: supplier.payment_terms,
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supplierData: Supplier = {
        id: supplier?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        payment_terms: formData.payment_terms,
        created_at: supplier?.created_at || new Date().toISOString(),
      };

      onSave(supplierData);
    } catch (error) {
      console.error('Error saving supplier:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentTermsOptions = [
    'Net 15',
    'Net 30',
    'Net 45',
    'Net 60',
    'Due on Receipt',
    '2/10 Net 30',
    '1/10 Net 30',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter company name"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="supplier@company.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1-555-0123"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Address Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="address">Full Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Street address, city, state, postal code, country"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Terms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="payment_terms">Payment Terms</Label>
            <Select 
              value={formData.payment_terms} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                {paymentTermsOptions.map(term => (
                  <SelectItem key={term} value={term}>
                    {term}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Standard payment terms for this supplier
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name || !formData.email}>
          {loading ? 'Saving...' : supplier ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
}
