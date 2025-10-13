'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ProductForm, Product } from './ProductForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const initialProducts: Product[] = [
  { id: '1', name: 'Wireless Mouse', category: 'Electronics', sku: 'WM-001', cost: 15.00, price: 29.99, quantity: 150 },
  { id: '2', name: 'Mechanical Keyboard', category: 'Electronics', sku: 'MK-001', cost: 55.00, price: 99.99, quantity: 75 },
  { id: '3', name: 'Ergonomic Chair', category: 'Furniture', sku: 'EC-001', cost: 120.00, price: 249.99, quantity: 30 },
  { id: '4', name: 'Desk Lamp', category: 'Furniture', sku: 'DL-001', cost: 20.00, price: 45.00, quantity: 8 },
  { id: '5', name: 'Coffee Mug', category: 'Kitchenware', sku: 'CM-001', cost: 5.00, price: 12.99, quantity: 200 },
  { id: '6', name: 'Laptop Stand', category: 'Accessories', sku: 'LS-001', cost: 25.00, price: 59.99, quantity: 12 },
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
        setProducts(products.filter(p => p.id !== id));
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage your products and stock levels.</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setEditingProduct(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm product={editingProduct} onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>


      <Card>
        <CardHeader>
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.quantity > 10 ? 'outline' : 'destructive'}>
                      {product.quantity > 10 ? 'In Stock' : 'Low Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.category}</TableCell>
                  <TableCell className="text-right">${product.cost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
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
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(product.id!)}>
                           <Trash2 className="mr-2 h-4 w-4" />
                           <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
