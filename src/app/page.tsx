
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  MoreVertical,
  Eye,
  TrendingDown
} from "lucide-react";
import Link from 'next/link';
import SalesChart from "@/components/dashboard/SalesChart";
import ExpensesChart from "@/components/dashboard/ExpensesChart";
import { PageHeader } from '@/components/shared';
import { useTenant } from '@/lib/tenant';

interface Stats {
  totalProducts: number;
  lowStockItems: number;
  totalSales: number;
  salesChange: number;
  totalRevenue: number;
  revenueChange: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface Activity {
  id: string;
  type: 'sale' | 'stock' | 'customer';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  icon: React.ElementType;
}

const MOCK_SALES_DATA = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 7500 },
];

export default function DashboardPage() {
  const { tenant } = useTenant();
  const [userName, setUserName] = useState("User"); 
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockItems: 0,
    totalSales: 0,
    salesChange: 0,
    totalRevenue: 0,
    revenueChange: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('month');

  useEffect(() => {
    fetchDashboardData();
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            // In a real app, you'd fetch the user's profile name from your 'users' table
            setUserName(user.email?.split('@')[0] || "User");
        }
    }
    getUser();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [ 
        { data: revenueData, error: revenueError },
        { count: salesCount, error: salesError },
        { count: productsCount, error: productsError },
        { count: customersCount, error: customersError },
        { data: lowStockData, error: lowStockError },
        { count: pendingOrdersCount, error: pendingOrdersError },
        { data: recentSales, error: recentSalesError },
        { data: recentStock, error: recentStockError },
        { data: recentCustomers, error: recentCustomersError },
      ] = await Promise.all([
        supabase.from('sales_invoices').select('total_amount').eq('payment_status', 'Paid'),
        supabase.from('sales_invoices').select('*' , { count: 'exact' }),
        supabase.from('products').select('*' , { count: 'exact' }),
        supabase.from('customers').select('*' , { count: 'exact' }),
        supabase.from('products').select('id').lte('stock_quantity', 10), // Assuming reorder_point is 10
        supabase.from('sales_invoices').select('*' , { count: 'exact' }).eq('payment_status', 'Unpaid'),
        supabase.from('sales_invoices').select('id, created_at, total_amount, invoice_number').order('created_at', { ascending: false }).limit(5),
        supabase.from('stock_movements').select('id, created_at, movement_type, quantity, products(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('customers').select('id, created_at, name').order('created_at', { ascending: false }).limit(5),
      ]);

      if (revenueError || salesError || productsError || customersError || lowStockError || pendingOrdersError || recentSalesError || recentStockError || recentCustomersError) {
        console.error({
          revenueError, salesError, productsError, customersError, lowStockError, pendingOrdersError, recentSalesError, recentStockError, recentCustomersError
        });
      }

      const totalRevenue = revenueData?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;

      const formattedActivities: Activity[] = [
        ...(recentSales || []).map(sale => ({ id: sale.id, type: 'sale' as const, title: 'New Sale', description: `Invoice #${sale.invoice_number}`, amount: sale.total_amount, timestamp: new Date(sale.created_at).toLocaleDateString(), icon: ShoppingCart })),
        ...(recentStock || []).map(stock => ({ id: stock.id, type: 'stock' as const, title: `Stock ${stock.movement_type}`, description: `${stock.quantity} of ${stock.products.name}`, timestamp: new Date(stock.created_at).toLocaleDateString(), icon: Package })),
        ...(recentCustomers || []).map(customer => ({ id: customer.id, type: 'customer' as const, title: 'New Customer', description: customer.name, timestamp: new Date(customer.created_at).toLocaleDateString(), icon: Users })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setStats({
        totalRevenue,
        totalSales: salesCount || 0,
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        lowStockItems: lowStockData?.length || 0,
        pendingOrders: pendingOrdersCount || 0,
        salesChange: 12.5, // Placeholder
        revenueChange: 8.3, // Placeholder
      });

      setRecentActivities(formattedActivities);

    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.revenueChange,
      icon: DollarSign,
    },
    {
      title: 'Total Sales',
      value: stats.totalSales.toString(),
      change: stats.salesChange,
      icon: ShoppingCart,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: 5.2,
      icon: Package,
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      change: 3.1,
      icon: Users,
    },
  ];

  const getActivityIcon = (activity: Activity) => {
    const Icon = activity.icon;
    const iconColors: Record<Activity['type'], string> = {
      sale: 'bg-emerald-100 text-emerald-600',
      stock: 'bg-blue-100 text-blue-600',
      customer: 'bg-amber-100 text-amber-600',
    };
    
    return (
      <div className={`p-3 rounded-lg ${iconColors[activity.type]}`}>
        <Icon className="w-5 h-5" />
      </div>
    );
  };


  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${tenant?.name || 'Your'} Dashboard`}
        description={`Welcome back, ${userName}! Here's a summary of your business.`}
      >
        <Tabs defaultValue="month" onValueChange={(value) => setTimeRange(value as any)}>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline ml-2">Refresh</span>
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;

          return (
            <Card key={card.title} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                 <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                    </div>
                     <div className="flex items-center gap-2">
                        {card.change !== 0 && (
                            <div
                            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                                isPositive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                            >
                            {isPositive ? (
                                <ArrowUp className="w-3 h-3" />
                            ) : (
                                <ArrowDown className="w-3 h-3" />
                            )}
                            {Math.abs(card.change)}%
                            </div>
                        )}
                        <Link href={card.title === 'Total Revenue' || card.title === 'Total Sales' ? '/sales' : card.title === 'Total Products' ? '/inventory' : '/customers'}>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                              <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </Link>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">{card.title}</h3>
                <p className="text-2xl font-bold mb-2">{card.value}</p>
                <p className="text-xs text-muted-foreground">
                    {isPositive ? 'Increase' : 'Decrease'} from last {timeRange}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Link href="/audit-log">
                  <Button variant="link" className="text-sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors group"
                >
                  {getActivityIcon(activity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {activity.amount && (
                      <p className="text-sm font-semibold text-green-600 whitespace-nowrap">
                        +${activity.amount.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.timestamp}</p>
                     <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Your sales performance over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <SalesChart data={MOCK_SALES_DATA} />
            </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Alerts & Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {stats.lowStockItems > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <TrendingDown className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-900">Low Stock Alert</p>
                            <p className="text-xs text-amber-700 mt-1">{stats.lowStockItems} products are below their minimum stock level.</p>
                            <Link href="/inventory">
                              <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-amber-600">View Products →</Button>
                            </Link>
                        </div>
                        </div>
                    )}
                    
                    {stats.pendingOrders > 0 && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Pending Orders</p>
                            <p className="text-xs text-blue-700 mt-1">{stats.pendingOrders} sales orders await processing.</p>
                             <Link href="/sales">
                               <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-blue-600">Process Orders →</Button>
                             </Link>
                        </div>
                        </div>
                    )}
                    
                    <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                        <p className="text-sm font-medium text-emerald-900">Sales Performance</p>
                        <p className="text-xs text-emerald-700 mt-1">Revenue increased by {stats.revenueChange}% this {timeRange}.</p>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-emerald-600">View Report →</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                     {[
                        { label: 'New Sale', icon: ShoppingCart, color: 'bg-emerald-500', href: '/sales/new' },
                        { label: 'Add Product', icon: Package, color: 'bg-blue-500', href: '/inventory' },
                        { label: 'New Customer', icon: Users, color: 'bg-amber-500', href: '/customers' },
                        { label: 'View Reports', icon: TrendingUp, color: 'bg-slate-500', href: '/reports/balance-sheet' },
                    ].map((action, index) => (
                        <Link key={index} href={action.href}>
                          <Button variant="outline" className="flex-col h-24 gap-2 w-full">
                               <div className={`${action.color} p-2 rounded-lg`}>
                                  <action.icon className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">{action.label}</span>
                          </Button>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
