'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/shared';

interface ReportCard {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
  stats?: {
    value: string;
    change: number;
    trend: 'up' | 'down';
  };
}

export default function ReportsPage() {
  const [reportStats, setReportStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      const [
        { data: revenueData },
        { count: salesCount },
        { count: productsCount },
        { count: customersCount },
      ] = await Promise.all([
        supabase.from('sales_invoices').select('total_amount').eq('payment_status', 'Paid'),
        supabase.from('sales_invoices').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('customers').select('*', { count: 'exact' }),
      ]);

      const totalRevenue = revenueData?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;

      setReportStats({
        totalRevenue,
        totalSales: salesCount || 0,
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching report stats:', error);
    }
  };

  const reportCards: ReportCard[] = [
    {
      title: 'Profit & Loss',
      description: 'Revenue, expenses, and profitability analysis',
      icon: TrendingUp,
      href: '/reports/profit-loss',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      stats: {
        value: `$${reportStats.totalRevenue.toLocaleString()}`,
        change: 12.5,
        trend: 'up'
      }
    },
    {
      title: 'Balance Sheet',
      description: 'Assets, liabilities, and equity overview',
      icon: FileText,
      href: '/reports/balance-sheet',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      stats: {
        value: `${reportStats.totalProducts} items`,
        change: 8.2,
        trend: 'up'
      }
    },
    {
      title: 'Sales Analytics',
      description: 'Sales trends, top products, and performance',
      icon: BarChart3,
      href: '/reports/sales-analytics',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      stats: {
        value: `${reportStats.totalSales} orders`,
        change: -2.1,
        trend: 'down'
      }
    },
    {
      title: 'Inventory Report',
      description: 'Stock levels, movements, and valuation',
      icon: Package,
      href: '/reports/inventory',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      stats: {
        value: `${reportStats.totalProducts} products`,
        change: 5.7,
        trend: 'up'
      }
    },
    {
      title: 'Customer Analytics',
      description: 'Customer insights and behavior analysis',
      icon: Users,
      href: '/reports/customers',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      stats: {
        value: `${reportStats.totalCustomers} customers`,
        change: 15.3,
        trend: 'up'
      }
    },
    {
      title: 'AR Aging Report',
      description: 'Outstanding receivables by age',
      icon: Calendar,
      href: '/reports/ar-aging',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      stats: {
        value: '$12,450',
        change: -8.9,
        trend: 'down'
      }
    },
    {
      title: 'Cash Flow',
      description: 'Money in and out analysis',
      icon: Activity,
      href: '/reports/cash-flow',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      stats: {
        value: '$8,750',
        change: 22.1,
        trend: 'up'
      }
    },
    {
      title: 'Tax Reports',
      description: 'Tax-ready reports and summaries',
      icon: PieChart,
      href: '/reports/tax',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      stats: {
        value: 'Q4 2024',
        change: 0,
        trend: 'up'
      }
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down') => {
    return trend === 'up' ? ArrowUpRight : ArrowDownRight;
  };

  const getTrendColor = (trend: 'up' | 'down') => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive business insights and financial reports"
      >
        <Button variant="outline" data-tour-id="reports-entry">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
        <Button>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Report
        </Button>
      </PageHeader>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reportStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalSales}</div>
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3 h-3" />
              -2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalProducts}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +5.7% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.totalCustomers}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3" />
              +15.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => {
          const Icon = report.icon;
          const TrendIcon = getTrendIcon(report.stats?.trend || 'up');
          
          return (
            <Link key={index} href={report.href}>
              <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${report.bgColor}`}>
                      <Icon className={`w-6 h-6 ${report.color}`} />
                    </div>
                    {report.stats && (
                      <div className="text-right">
                        <div className="text-sm font-medium">{report.stats.value}</div>
                        <div className={`text-xs flex items-center gap-1 ${getTrendColor(report.stats.trend)}`}>
                          <TrendIcon className="w-3 h-3" />
                          {Math.abs(report.stats.change)}%
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {report.description}
                  </p>
                  <div className="flex items-center text-sm text-primary group-hover:underline">
                    View Report
                    <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Monthly P&L Report - December 2024', date: '2024-12-15', type: 'Profit & Loss', size: '2.3 MB' },
              { name: 'Inventory Valuation Report', date: '2024-12-14', type: 'Inventory', size: '1.8 MB' },
              { name: 'Customer Analytics - Q4 2024', date: '2024-12-13', type: 'Customer Analytics', size: '3.1 MB' },
              { name: 'AR Aging Report', date: '2024-12-12', type: 'AR Aging', size: '1.2 MB' },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.type} • {report.date} • {report.size}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
