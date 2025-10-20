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
  ShoppingBag,
  AlertTriangle,
  Eye,
  Copy,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PurchaseOrderForm, PurchaseOrder } from './PurchaseOrderForm';
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
import { toCsv } from '@/lib/utils';
import { PageHeader } from '@/components/shared';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });


const initialPurchaseOrders: PurchaseOrder[] = [
  { 
    id: '1', 
    po_number: 'PO-2024-001',
    supplier_name: 'ABC Electronics',
    status: 'Pending',
    total_amount: 2500.00,
    order_date: '2024-01-15',
    expected_delivery: '2024-01-25',
    created_at: '2024-01-15T10:30:00Z'
  },
  { 
    id: '2', 
    po_number: 'PO-2024-002',
    supplier_name: 'XYZ Supplies',
    status: 'Received',
    total_amount: 1800.00,
    order_date: '2024-01-10',
    expected_delivery: '2024-01-20',
    created_at: '2024-01-10T14:20:00Z'
  },
  { 
    id: '3', 
    po_number: 'PO-2024-003',
    supplier_name: 'Global Parts Co',
    status: 'Cancelled',
    total_amount: 3200.00,
    order_date: '2024-01-05',
    expected_delivery: '2024-01-15',
    created_at: '2024-01-05T09:15:00Z'
  },
];

export default function PurchasesPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, purchaseOrders]);

  const filterOrders = () => {
    let filtered = purchaseOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleSaveOrder = (order: PurchaseOrder) => {
    if(editingOrder) {
      setPurchaseOrders(purchaseOrders.map(o => o.id === order.id ? order : o));
    } else {
      setPurchaseOrders([order, ...purchaseOrders]);
    }
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  const handleEditOrder = (order: PurchaseOrder) => {
    setEditingOrder(order);
    setIsFormOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(order => order.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Received': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Cancelled': { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const exportToCsv = () => {
    const csvData = filteredOrders.map(order => ({
      'PO Number': order.po_number,
      'Supplier': order.supplier_name,
      'Status': order.status,
      'Total Amount': order.total_amount,
      'Order Date': order.order_date,
      'Expected Delivery': order.expected_delivery,
    }));
    
    const csv = toCsv(csvData, ['PO Number', 'Supplier', 'Status', 'Total Amount', 'Order Date', 'Expected Delivery']);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'purchase_orders.csv';
    a.click();
  };

  const totalValue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const pendingOrders = filteredOrders.filter(order => order.status === 'Pending').length;
  const receivedOrders = filteredOrders.filter(order => order.status === 'Received').length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Purchase Orders"
        description="Manage supplier orders and procurement"
      >
        <Button variant="outline" onClick={exportToCsv}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button onClick={() => { setEditingOrder(null); setIsFormOpen(true); } }>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Purchase Order
        </Button>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Received Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{receivedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search purchase orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.po_number}</TableCell>
                  <TableCell>{order.supplier_name}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>${order.total_amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(order.expected_delivery).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Purchase Order Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? 'Edit Purchase Order' : 'Create New Purchase Order'}
            </DialogTitle>
          </DialogHeader>
          <PurchaseOrderForm
            order={editingOrder}
            onSave={handleSaveOrder}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingOrder(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
