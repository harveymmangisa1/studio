'use client';

import { useState } from 'react';
import { getReorderSuggestions, ReorderSuggestionsOutput } from '@/ai/flows/reorder-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const historicalSalesData = JSON.stringify([
  {"productName": "Wireless Mouse", "date": "2023-09-01", "quantity": 50},
  {"productName": "Mechanical Keyboard", "date": "2023-09-15", "quantity": 30},
  {"productName": "Ergonomic Chair", "date": "2023-09-20", "quantity": 10},
  {"productName": "Laptop Stand", "date": "2023-09-25", "quantity": 25}
], null, 2);

const currentStockLevels = JSON.stringify([
  {"productName": "Wireless Mouse", "quantity": 25},
  {"productName": "Mechanical Keyboard", "quantity": 15},
  {"productName": "Ergonomic Chair", "quantity": 5},
  {"productName": "Laptop Stand", "quantity": 3}
], null, 2);

const supplierLeadTimes = JSON.stringify([
  {"productName": "Wireless Mouse", "leadTime": 7},
  {"productName": "Mechanical Keyboard", "leadTime": 14},
  {"productName": "Ergonomic Chair", "leadTime": 30},
  {"productName": "Laptop Stand", "leadTime": 10}
], null, 2);

const seasonality = JSON.stringify([
  {"productName": "Wireless Mouse", "month": "December", "salesPercentage": 150},
  {"productName": "Mechanical Keyboard", "month": "December", "salesPercentage": 120}
], null, 2);

export default function AiSuggestionsPage() {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ReorderSuggestionsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);
    
    const formData = new FormData(event.currentTarget);
    const input = {
      historicalSalesData: formData.get('historicalSalesData') as string,
      currentStockLevels: formData.get('currentStockLevels') as string,
      supplierLeadTimes: formData.get('supplierLeadTimes') as string,
      seasonality: formData.get('seasonality') as string,
    };

    try {
      const result = await getReorderSuggestions(input);
      setSuggestions(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">AI Reorder Suggestions</h1>
        <p className="text-muted-foreground">Let AI help you make smarter inventory decisions.</p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Generate Suggestions</CardTitle>
            <CardDescription>Provide the data below to get AI-powered reorder suggestions. The form is pre-filled with sample data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="historicalSalesData">Historical Sales Data (JSON)</Label>
                <Textarea id="historicalSalesData" name="historicalSalesData" rows={8} defaultValue={historicalSalesData} />
              </div>
              <div>
                <Label htmlFor="currentStockLevels">Current Stock Levels (JSON)</Label>
                <Textarea id="currentStockLevels" name="currentStockLevels" rows={8} defaultValue={currentStockLevels} />
              </div>
              <div>
                <Label htmlFor="supplierLeadTimes">Supplier Lead Times (JSON)</Label>
                <Textarea id="supplierLeadTimes" name="supplierLeadTimes" rows={8} defaultValue={supplierLeadTimes} />
              </div>
              <div>
                <Label htmlFor="seasonality">Seasonality (JSON)</Label>
                <Textarea id="seasonality" name="seasonality" rows={8} defaultValue={seasonality} />
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Suggestions
            </Button>
          </CardContent>
        </form>
      </Card>

      {error && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      {suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>Reorder Suggestions</CardTitle>
            <CardDescription>Based on the data provided, here are the AI-powered recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestions.reorderSuggestions.map((suggestion, index) => (
              <Card key={index} className="bg-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="text-primary" />
                    <span>{suggestion.productName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{suggestion.quantityToReorder}</p>
                  <p className="text-sm text-muted-foreground">units to reorder</p>
                  <p className="text-sm text-muted-foreground mt-4">{suggestion.reason}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
