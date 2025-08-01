'use client';

import { Pie, PieChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

const chartData = [
  { category: 'Supplies', expenses: 11000, fill: 'var(--color-supplies)' },
  { category: 'Salaries', expenses: 8000, fill: 'var(--color-salaries)' },
  { category: 'Marketing', expenses: 7480, fill: 'var(--color-marketing)' },
  { category: 'Utilities', expenses: 6920, fill: 'var(--color-utilities)' },
  { category: 'Rent', expenses: 3600, fill: 'var(--color-rent)' },
];

const chartConfig = {
  expenses: {
    label: 'Expenses',
  },
  supplies: {
    label: 'Supplies',
    color: 'hsl(var(--chart-1))',
  },
  salaries: {
    label: 'Salaries',
    color: 'hsl(var(--chart-2))',
  },
  marketing: {
    label: 'Marketing',
    color: 'hsl(var(--chart-3))',
  },
  utilities: {
    label: 'Utilities',
    color: 'hsl(var(--chart-4))',
  },
  rent: {
    label: 'Rent',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export default function ExpensesChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="expenses"
          nameKey="category"
          innerRadius={60}
          strokeWidth={5}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="category" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
