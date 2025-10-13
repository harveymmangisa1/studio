import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, PackageSearch, TrendingUp, TrendingDown, Users, ShoppingCart, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import SalesChart from "@/components/dashboard/SalesChart";
import ExpensesChart from "@/components/dashboard/ExpensesChart";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {

  const stats = {
    totalRevenue: 45231.89,
    revenueChange: 20.1,
    totalSales: 1250,
    salesChange: -12.3,
    netProfit: 24119.44,
    profitChange: 35.2,
    lowStockItems: 12,
    pendingOrders: 5,
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.revenueChange,
      icon: DollarSign,
    },
    {
      title: 'Net Profit',
      value: `$${stats.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.profitChange,
      icon: TrendingUp,
    },
    {
      title: 'Total Sales',
      value: stats.totalSales.toString(),
      change: stats.salesChange,
      icon: ShoppingCart,
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      change: 0,
      icon: PackageSearch,
    },
  ];

  const recentActivity = [
      { id: 1, type: 'Sale', description: 'New sale to John Doe', amount: 250.00, time: '1 hour ago' },
      { id: 2, type: 'Stock', description: 'Stock updated for Wireless Mouse', amount: -5, time: '2 hours ago' },
      { id: 3, type: 'Expense', description: 'Marketing expense logged', amount: -150.00, time: '3 hours ago' },
      { id: 4, type: 'Sale', description: 'New sale to Jane Smith', amount: 99.99, time: '5 hours ago' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business performance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;

          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                {card.change !== 0 && (
                     <p className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                       {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                       {Math.abs(card.change)}% from last month
                    </p>
                )}
                 {card.change === 0 && <p className="text-xs text-muted-foreground">&nbsp;</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

       <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
             {stats.lowStockItems > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Low Stock Alert</p>
                    <p className="text-xs text-destructive/80">{stats.lowStockItems} products are running low on stock.</p>
                  </div>
                </div>
            )}
             {stats.pendingOrders > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-blue-500/10 p-3">
                    <ShoppingCart className="mt-0.5 h-5 w-5 text-blue-500" />
                    <div>
                        <p className="text-sm font-medium text-blue-600">Pending Orders</p>
                        <p className="text-xs text-blue-600/80">{stats.pendingOrders} sales orders are awaiting processing.</p>
                    </div>
                </div>
            )}
             <div className="flex items-start gap-3 rounded-lg bg-primary/10 p-3">
                <TrendingUp className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-primary">Sales Performance</p>
                  <p className="text-xs text-primary/80">Revenue increased by {stats.revenueChange}% this month.</p>
                </div>
              </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {activity.type === 'Sale' && <ShoppingCart className="h-5 w-5 text-muted-foreground" />}
                    {activity.type === 'Stock' && <PackageSearch className="h-5 w-5 text-muted-foreground" />}
                    {activity.type === 'Expense' && <DollarSign className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                 <p className={`text-sm font-semibold ${activity.amount > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {activity.amount > 0 ? `+$${activity.amount.toFixed(2)}` : (activity.type === 'Expense' ? `-$${Math.abs(activity.amount).toFixed(2)}` : `${activity.amount} units`)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Your sales performance over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
             <CardDescription>How your expenses are distributed across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensesChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
