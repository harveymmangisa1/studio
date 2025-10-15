'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Package,
  Calculator,
  Calendar,
  Building2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_name: string;
  status: 'Pending' | 'Received' | 'Cancelled';
  total_amount: number;
  order_date: string;
  expected_delivery: string;
  created_at: string;
  line_items?: PurchaseOrderLineItem[];
}

export interface PurchaseOrderLineItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface PurchaseOrderFormProps {
  order?: PurchaseOrder | null;
  onSave: (order: PurchaseOrder) => void;
  onCancel: () => void;
}

export function PurchaseOrderForm({ order, onSave, onCancel }: PurchaseOrderFormProps) {
  const [formData, setFormData] = useState({
    po_number: '',
    supplier_name: '',
    status: 'Pending' as const,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<PurchaseOrderLineItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setFormData({
        po_number: order.po_number,
        supplier_name: order.supplier_name,
        status: order.status,
        order_date: order.order_date,
        expected_delivery: order.expected_delivery,
        notes: '',
      });
      setLineItems(order.line_items || []);
    } else {
      // Generate PO number
      const poNumber = `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData(prev => ({ ...prev, po_number: poNumber }));
    }
  }, [order]);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, cost_price')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const addLineItem = () => {
    const newItem: PurchaseOrderLineItem = {
      id: Date.now().toString(),
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof PurchaseOrderLineItem, value: any) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updated.total_price = updated.quantity * updated.unit_price;
        }
        if (field === 'product_id') {
          const product = products.find(p => p.id === value);
          updated.product_name = product?.name || '';
          updated.unit_price = product?.cost_price || 0;
          updated.total_price = updated.quantity * updated.unit_price;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = calculateTotal();
      const purchaseOrder: PurchaseOrder = {
        id: order?.id || Date.now().toString(),
        po_number: formData.po_number,
        supplier_name: formData.supplier_name,
        status: formData.status,
        total_amount: totalAmount,
        order_date: formData.order_date,
        expected_delivery: formData.expected_delivery,
        created_at: order?.created_at || new Date().toISOString(),
        line_items: lineItems,
      };

      onSave(purchaseOrder);
    } catch (error) {
      console.error('Error saving purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="po_number">PO Number</Label>
            <Input
              id="po_number"
              value={formData.po_number}
              onChange={(e) => setFormData(prev => ({ ...prev, po_number: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="supplier_name">Supplier</Label>
            <Select 
              value={formData.supplier_name} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, supplier_name: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(supplier => (
                  <SelectItem key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="order_date">Order Date</Label>
            <Input
              id="order_date"
              type="date"
              value={formData.order_date}
              onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="expected_delivery">Expected Delivery</Label>
            <Input
              id="expected_delivery"
              type="date"
              value={formData.expected_delivery}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_delivery: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Line Items
            </CardTitle>
            <Button type="button" onClick={addLineItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Select 
                      value={item.product_id} 
                      onValueChange={(value) => updateLineItem(item.id, 'product_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-muted-foreground" />
                      ${item.total_price.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {lineItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No line items added yet</p>
              <p className="text-sm">Click "Add Item" to start building your purchase order</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <div className="text-right">
              <div className="text-2xl font-bold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || lineItems.length === 0}>
          {loading ? 'Saving...' : order ? 'Update Order' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
}
