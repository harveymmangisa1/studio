
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
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import { useTenant } from '@/lib/tenant';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });
import { toCsv } from '@/lib/utils';
import { PageHeader } from '@/components/shared';

export default function InventoryPage() {
  const { tenant } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!tenant) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('tenant_id', tenant.id);
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenant) {
      fetchProducts();
    }
  }, [tenant]);

  const handleFormSuccess = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, { ...product, id: (products.length + 1).toString() }]);
    }
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts(); // Refresh list from DB
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id).eq('tenant_id', tenant!.id);
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
    return { status: 'in-stock', label: 'In Stock', variant: 'default' as const };
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
    await fetchProducts();
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Inventory Management"
          description="Track, manage, and analyze your product inventory."
        >
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
          <Button data-tour-id="inventory-add" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </PageHeader>

        {/* Dialog for Product Form */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-6 -mr-6">
              <ProductForm product={editingProduct} onSuccess={handleFormSuccess} />
            </div>
          </DialogContent>
        </Dialog>

         {/* Products Table */}
         <Card>
           <CardHeader>
             <CardTitle>All Products</CardTitle>
           </CardHeader>
           <CardContent>
             {/* Mobile Cards View */}
             <div className="md:hidden space-y-4">
               {filteredProducts.map(product => {
                 const stockInfo = getStockStatus(product.quantity, product.minStock);
                 return (
                   <div key={product.id} className="border rounded-lg p-4 space-y-3">
                     <div className="flex justify-between items-start">
                       <div>
                         <h3 className="font-medium">{product.name}</h3>
                         <p className="text-sm text-muted-foreground">{product.sku}</p>
                       </div>
                       <Badge variant={stockInfo.variant as any}>{stockInfo.label}</Badge>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                       <div>
                         <span className="text-muted-foreground">Category:</span>
                         <p>{product.category}</p>
                       </div>
                       <div>
                         <span className="text-muted-foreground">Price:</span>
                         <p>${product.price.toFixed(2)}</p>
                       </div>
                       <div>
                         <span className="text-muted-foreground">Stock:</span>
                         <p>{product.quantity}</p>
                       </div>
                       <div>
                         <span className="text-muted-foreground">Expiry:</span>
                         <p>
                           {product.industryFields?.expiryDate
                             ? new Date(product.industryFields.expiryDate).toLocaleDateString() 
                             : 'N/A'
                           }
                         </p>
                       </div>
                     </div>
                     <div className="flex justify-end">
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
                     </div>
                   </div>
                 );
               })}
             </div>

             {/* Desktop Table View */}
             <div className="hidden md:block">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead>Product</TableHead>
                     <TableHead>SKU</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Expiry Date</TableHead>
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
                         <TableCell>
                           {product.industryFields?.expiryDate
                             ? new Date(product.industryFields.expiryDate).toLocaleDateString() 
                             : <span className="text-muted-foreground/50">N/A</span>
                           }
                         </TableCell>
                         <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                         <TableCell className="text-center">{product.quantity}</TableCell>
                         <TableCell className="text-center">
                           <Badge variant={stockInfo.variant as any}>{stockInfo.label}</Badge>
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
             </div>
           </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
