'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  PlusCircle, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Filter,
  Download,
  Upload,
  Package,
  AlertTriangle,
  Eye,
  Copy,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProductForm, Product } from './ProductForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { useTenant } from '@/lib/tenant';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });
import { toCsv } from '@/lib/utils';
const initialProducts: Product[] = [
  { id: '1', name: 'Wireless Mouse', category: 'Electronics', sku: 'WM-001', cost: 15.00, price: 29.99, quantity: 150, minStock: 10 },
  { id: '2', name: 'Mechanical Keyboard', category: 'Electronics', sku: 'MK-001', cost: 55.00, price: 99.99, quantity: 75, minStock: 5 },
  { id: '3', name: 'Ergonomic Chair', category: 'Furniture', sku: 'EC-001', cost: 120.00, price: 249.99, quantity: 30, minStock: 5 },
  { id: '4', name: 'Desk Lamp', category: 'Furniture', sku: 'DL-001', cost: 20.00, price: 45.00, quantity: 8, minStock: 15 },
  { id: '5', name: 'Coffee Mug', category: 'Kitchenware', sku: 'CM-001', cost: 5.00, price: 12.99, quantity: 200, minStock: 25 },
  { id: '6', name: 'Laptop Stand', category: 'Accessories', sku: 'LS-001', cost: 25.00, price: 59.99, quantity: 12, minStock: 10 },
  { id: '7', name: 'USB-C Cable', category: 'Electronics', sku: 'UC-001', cost: 8.00, price: 19.99, quantity: 3, minStock: 20 },
  { id: '8', name: 'Monitor Stand', category: 'Furniture', sku: 'MS-001', cost: 35.00, price: 79.99, quantity: 45, minStock: 8 },
];

export default function InventoryPage() {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenant?.id || '');
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleFormSuccess = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: (products.length + 1).toString() }]);
    }
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('tenant_id', tenant?.id || '')
          .eq('id', id);
        if (error) throw error;
        fetchProducts(); // Re-fetch products to update the list
      } catch (error: any) {
        setError(error.message);
      }
    }
  }

  const handleDuplicate = (product: Product) => {
    const duplicatedProduct = {
      ...product,
      id: (products.length + 1).toString(),
      sku: `${product.sku}-COPY`,
      name: `${product.name} (Copy)`
    };
    setProducts([...products, duplicatedProduct]);
  };

  const getStockStatus = (quantity: number, minStock: number = 10) => {
    if (quantity === 0) return { status: 'out-of-stock', label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= minStock) return { status: 'low-stock', label: 'Low Stock', variant: 'destructive' as const };
    if (quantity <= minStock * 2) return { status: 'medium-stock', label: 'Medium Stock', variant: 'outline' as const };
    return { status: 'in-stock', label: 'In Stock', variant: 'success' as const };
  };

  const getStockStatusCounts = () => {
    const counts = {
      all: products.length,
      'out-of-stock': products.filter(p => p.quantity === 0).length,
      'low-stock': products.filter(p => p.quantity > 0 && p.quantity <= (p.minStock || 10)).length,
      'in-stock': products.filter(p => p.quantity > (p.minStock || 10)).length
    };
    return counts;
  };

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  const stockStatusCounts = getStockStatusCounts();

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    const stockStatus = getStockStatus(product.quantity, product.minStock).status;
    const matchesStock = stockFilter === 'all' || stockStatus === stockFilter;
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track, manage, and analyze your product inventory.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => {
            const columns = ['id', 'name', 'category', 'sku', 'cost', 'price', 'quantity', 'minStock'];
            const csv = toCsv(filteredProducts, columns);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', 'products.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Dialog for Product Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm product={editingProduct} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Filter and Search Section */}
      {/* <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search by name, category, or SKU..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stockStatusCounts).map(([status, count]) => (
                    <SelectItem key={status} value={status}>
                      {status.replace('-', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ({count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => {
                const stockInfo = getStockStatus(product.quantity, product.minStock);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(product)}>
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/inventory/${product.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>View Details</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id!)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}