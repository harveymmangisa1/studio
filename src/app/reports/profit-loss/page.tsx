'use client';

import { useState, useEffect } from 'react';
import { calculateProfitAndLoss } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PNLData {
  revenue: number;
  cogs: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
}

export default function ProfitLossPage() {
  const [pnlData, setPnlData] = useState<PNLData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchPNL = async () => {
    if (!startDate || !endDate) {
      setError('Please select a start and end date.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await calculateProfitAndLoss(startDate, endDate);
      setPnlData(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Profit & Loss Statement</CardTitle>
          <CardDescription>Analyze your company's financial performance over a period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <Button onClick={fetchPNL} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {pnlData && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Revenue</span>
                <span>${pnlData.revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost of Goods Sold (COGS)</span>
                <span>${pnlData.cogs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Gross Profit</span>
                <span>${pnlData.gross_profit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Operating Expenses</span>
                <span>${pnlData.expenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Net Profit</span>
                <span>${pnlData.net_profit.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
