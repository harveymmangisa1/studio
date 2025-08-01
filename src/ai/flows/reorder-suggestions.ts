// src/ai/flows/reorder-suggestions.ts
'use server';
/**
 * @fileOverview Provides AI-powered reorder suggestions for inventory management.
 *
 * - getReorderSuggestions - A function that returns reorder suggestions.
 * - ReorderSuggestionsInput - The input type for the getReorderSuggestions function.
 * - ReorderSuggestionsOutput - The return type for the getReorderSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReorderSuggestionsInputSchema = z.object({
  historicalSalesData: z.string().describe('Historical sales data, as a JSON string, including product name, date, and quantity sold.'),
  currentStockLevels: z.string().describe('Current stock levels for each product, as a JSON string, including product name and quantity.'),
  supplierLeadTimes: z.string().describe('Supplier lead times for each product, in days, as a JSON string, including product name and lead time.'),
  seasonality: z.string().describe('Seasonal sales trends, as a JSON string, including product name, month, and sales percentage compared to average.'),
});
export type ReorderSuggestionsInput = z.infer<typeof ReorderSuggestionsInputSchema>;

const ReorderSuggestionsOutputSchema = z.object({
  reorderSuggestions: z.array(
    z.object({
      productName: z.string().describe('The name of the product.'),
      quantityToReorder: z.number().describe('The quantity of the product to reorder.'),
      reason: z.string().describe('The reason for the reorder suggestion, based on sales data, stock levels, lead times, and seasonality.'),
    })
  ).describe('An array of reorder suggestions for each product.'),
});
export type ReorderSuggestionsOutput = z.infer<typeof ReorderSuggestionsOutputSchema>;

export async function getReorderSuggestions(input: ReorderSuggestionsInput): Promise<ReorderSuggestionsOutput> {
  return reorderSuggestionsFlow(input);
}

const reorderSuggestionsPrompt = ai.definePrompt({
  name: 'reorderSuggestionsPrompt',
  input: {schema: ReorderSuggestionsInputSchema},
  output: {schema: ReorderSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides reorder suggestions for a retail business. Analyze the provided data to determine which products need to be reordered and in what quantity.

Consider the following factors:
- Historical sales data: {{{historicalSalesData}}}
- Current stock levels: {{{currentStockLevels}}}
- Supplier lead times: {{{supplierLeadTimes}}}
- Seasonality: {{{seasonality}}}

Based on this information, provide a list of reorder suggestions, including the product name, quantity to reorder, and a brief explanation for each suggestion.  The output MUST be valid JSON.
`,
});

const reorderSuggestionsFlow = ai.defineFlow(
  {
    name: 'reorderSuggestionsFlow',
    inputSchema: ReorderSuggestionsInputSchema,
    outputSchema: ReorderSuggestionsOutputSchema,
  },
  async input => {
    try {
      const {output} = await reorderSuggestionsPrompt(input);
      return output!;
    } catch (error) {
      console.error('Error in reorderSuggestionsFlow:', error);
      throw error;
    }
  }
);

