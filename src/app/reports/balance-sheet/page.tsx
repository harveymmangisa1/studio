'use client';

import { useState, useEffect } from 'react';
import { calculateBalanceSheet } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BalanceSheetData {
  assets: number;
  liabilities: number;
  equity: number;
}

export default function BalanceSheetPage() {
  const [balanceSheetData, setBalanceSheetData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await calculateBalanceSheet();
      setBalanceSheetData(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalanceSheet();
  }, []);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
          <CardDescription>A snapshot of your company's financial health at a specific point in time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchBalanceSheet} disabled={loading} className="mb-4">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>

          {error && <p className="text-red-500">{error}</p>}

          {balanceSheetData && (
            <div className="space-y-4">
              <div className="font-bold text-lg">Assets</div>
              <div className="flex justify-between">
                <span>Total Assets</span>
                <span>${balanceSheetData.assets.toFixed(2)}</span>
              </div>

              <div className="font-bold text-lg mt-4">Liabilities & Equity</div>
              <div className="flex justify-between">
                <span>Total Liabilities</span>
                <span>${balanceSheetData.liabilities.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Equity</span>
                <span>${balanceSheetData.equity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Liabilities & Equity</span>
                <span>${(balanceSheetData.liabilities + balanceSheetData.equity).toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
