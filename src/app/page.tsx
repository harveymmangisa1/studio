import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, PackageSearch, TrendingUp, TrendingDown, Users } from "lucide-react";
import SalesChart from "@/components/dashboard/SalesChart";
import ExpensesChart from "@/components/dashboard/ExpensesChart";

export default function DashboardPage() {
  const kpis = [
    { title: "Total Revenue", value: "$45,231.89", icon: DollarSign, change: "+20.1% from last month" },
    { title: "Total Expenses", value: "$21,112.45", icon: TrendingDown, change: "+12.3% from last month" },
    { title: "Net Profit", value: "$24,119.44", icon: TrendingUp, change: "+35.2% from last month" },
    { title: "Low Stock Items", value: "12", icon: PackageSearch, change: "2 items need immediate reorder" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's a summary of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
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
