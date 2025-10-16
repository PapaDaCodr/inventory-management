/**
 * Currency utility functions for Ghana Cedi (GHS) formatting
 */

/**
 * Format a number as Ghana Cedi currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string, 
  options: {
    showSymbol?: boolean
    decimals?: number
    locale?: string
  } = {}
): string {
  const {
    showSymbol = true,
    decimals = 2,
    locale = 'en-GH'
  } = options

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) {
    return showSymbol ? 'GHS 0.00' : '0.00'
  }

  const formatted = numericAmount.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })

  return showSymbol ? `GHS ${formatted}` : formatted
}

/**
 * Format currency with Ghana Cedi symbol (₵)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with ₵ symbol
 */
export function formatCurrencyWithSymbol(amount: number | string, decimals: number = 2): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) {
    return '₵0.00'
  }

  return `₵${numericAmount.toLocaleString('en-GH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`
}

/**
 * Parse currency string to number
 * @param currencyString - Currency string to parse (e.g., "GHS 1,234.56" or "₵1,234.56")
 * @returns Numeric value
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0
  
  // Remove currency symbols and spaces, keep only numbers, commas, and decimal points
  const cleanString = currencyString
    .replace(/[GHS₵\s]/g, '')
    .replace(/,/g, '')
  
  const parsed = parseFloat(cleanString)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Currency constants
 */
export const CURRENCY = {
  CODE: 'GHS',
  SYMBOL: '₵',
  NAME: 'Ghana Cedi',
  LOCALE: 'en-GH'
} as const

/**
 * Default currency formatter (GHS with symbol)
 */
export const currency = (amount: number | string): string => formatCurrency(amount)

/**
 * Currency formatter with ₵ symbol
 */
export const currencySymbol = (amount: number | string): string => formatCurrencyWithSymbol(amount)
