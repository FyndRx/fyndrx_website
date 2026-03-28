/**
 * Formats a number or string as Ghana Cedis (GH₵)
 * @param value The numeric value to format
 * @param includeSymbol Whether to include the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string | undefined | null, includeSymbol: boolean = true): string => {
  if (value === undefined || value === null) return includeSymbol ? 'GH₵ 0.00' : '0.00';
  
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(amount)) return includeSymbol ? 'GH₵ 0.00' : '0.00';
  
  const formatted = new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return includeSymbol ? `GH₵ ${formatted}` : formatted;
};
