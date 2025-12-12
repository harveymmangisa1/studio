/**
 * Currency utility functions for consistent currency formatting across the application
 */

export interface CurrencyConfig {
  symbol: string;
  code: string;
  name: string;
  decimalPlaces: number;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  USD: {
    symbol: '$',
    code: 'USD',
    name: 'US Dollar',
    decimalPlaces: 2,
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    name: 'Euro',
    decimalPlaces: 2,
  },
  GBP: {
    symbol: '£',
    code: 'GBP',
    name: 'British Pound',
    decimalPlaces: 2,
  },
  MWK: {
    symbol: 'MK',
    code: 'MWK',
    name: 'Malawi Kwacha',
    decimalPlaces: 2,
  },
};

/**
 * Format currency amount with proper symbol and decimal places
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  options: {
    showSymbol?: boolean;
    decimalPlaces?: number;
  } = {}
): string {
  const currencyConfig = CURRENCIES[currency] || CURRENCIES.USD;
  const { showSymbol = true, decimalPlaces } = options;
  
  const formattedAmount = amount.toFixed(decimalPlaces ?? currencyConfig.decimalPlaces);
  
  if (showSymbol) {
    return `${currencyConfig.symbol}${formattedAmount}`;
  }
  
  return formattedAmount;
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
  return CURRENCIES[currency]?.symbol || CURRENCIES.USD.symbol;
}

/**
 * Format currency amount without symbol (for input fields)
 */
export function formatCurrencyValue(
  amount: number,
  currency: string = 'USD',
  decimalPlaces?: number
): string {
  return formatCurrency(amount, currency, { showSymbol: false, decimalPlaces });
}

/**
 * Parse currency string back to number
 */
export function parseCurrencyValue(value: string): number {
  // Remove currency symbols and formatting, then parse as number
  const cleanValue = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Get currency display name
 */
export function getCurrencyName(currency: string = 'USD'): string {
  return CURRENCIES[currency]?.name || CURRENCIES.USD.name;
}