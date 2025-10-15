'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface ProductDetails {
  id: string;
  name: string;
  sku: string;
  category: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  reorder_point: number;
  created_at: string;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setProduct(data);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading product details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">{product.name}</h1>
          <p className="text-muted-foreground">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{product.category}</Badge>
          <Button variant="outline">Edit</Button>
        </div>
      </div>

      {/* Product Details */}
      <Card>
        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <h3 className="font-semibold">Pricing</h3>
            <div className="text-muted-foreground">
              <p><strong>Cost Price:</strong> ${product.cost_price.toFixed(2)}</p>
              <p><strong>Selling Price:</strong> ${product.selling_price.toFixed(2)}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <h3 className="font-semibold">Stock</h3>
            <div className="text-muted-foreground">
              <p><strong>Stock Quantity:</strong> {product.stock_quantity}</p>
              <p><strong>Reorder Point:</strong> {product.reorder_point}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add more cards for other details like stock movements, sales history, etc. */}
    </div>
  );
}
