'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/lib/tenant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id: string;
  name: string;
  selling_price: number;
}

interface ProductSelectorProps {
  control: any;
  index: number;
}

export function ProductSelector({ control, index }: ProductSelectorProps) {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, selling_price')
          .eq('tenant_id', tenant?.id || '');
        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      control.setValue(`line_items.${index}.product_id`, productId);
      control.setValue(`line_items.${index}.unit_price`, product.selling_price);
    }
  };

  return (
    <Select onValueChange={handleProductChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a product" />
      </SelectTrigger>
      <SelectContent>
        {products.map(product => (
          <SelectItem key={product.id} value={product.id}>
            {product.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
