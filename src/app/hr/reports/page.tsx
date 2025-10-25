
'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { DashboardStats } from '@/components/hr/DashboardStats';
import { KPIChart } from '@/components/hr/KPIChart';
import { Users, Briefcase, DollarSign, TrendingUp } from 'lucide-react';

const stats = [
  {
    title: 'Total Employees',
    value: '124',
    change: '+2% from last month',
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'New Hires',
    value: '5',
    change: '+1 from last month',
    icon: <Briefcase className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Payroll Costs',
    value: '$85,230',
    change: '+5% from last month',
    icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
  },
  {
    title: 'Turnover Rate',
    value: '2.1%',
    change: '-0.5% from last month',
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
  },
];

const headcountData = [
  { month: 'Jan', count: 110 },
  { month: 'Feb', count: 112 },
  { month: 'Mar', count: 115 },
  { month: 'Apr', count: 118 },
  { month: 'May', count: 120 },
  { month: 'Jun', count: 124 },
];

const ReportsPage = () => {
  return (
    <div>
      <PageHeader title="Reports" description="Analytics and insights for your HR department." />
      <div className="mt-8 space-y-8">
        <DashboardStats stats={stats} />
        <div className="grid gap-8 md:grid-cols-2">
          <KPIChart data={headcountData} title="Headcount Growth" dataKey="count" xAxisKey="month" />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
