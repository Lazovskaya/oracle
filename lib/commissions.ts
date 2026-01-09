/**
 * Commission and Tax Record Type Definitions and Helper Functions
 */

export interface CommissionTaxRecord {
  id?: number;
  
  // User identification
  user_id: string;
  user_email?: string;
  
  // Transaction details
  payment_date: string; // ISO datetime
  payment_amount: number;
  payment_currency?: string;
  payment_method?: string;
  transaction_id?: string;
  
  // Subscription details
  subscription_type: string;
  subscription_start_date: string;
  subscription_end_date: string;
  billing_cycle?: string;
  
  // Geographic and tax information
  user_country: string;
  user_state?: string;
  user_city?: string;
  user_postal_code?: string;
  user_ip_address?: string;
  
  // Tax calculation fields
  tax_rate?: number;
  tax_amount?: number;
  vat_number?: string;
  is_reverse_charge?: boolean;
  
  // Commission tracking
  gross_amount?: number;
  payment_processor_fee?: number;
  net_amount?: number;
  platform_commission?: number;
  
  // Additional metadata
  invoice_number?: string;
  receipt_url?: string;
  refund_status?: 'none' | 'partial' | 'full';
  refund_amount?: number;
  refund_date?: string;
  
  // Audit fields
  created_at?: string;
  updated_at?: string;
  notes?: string;
}

/**
 * Tax rates by country (approximate - verify with accountant)
 * VAT rates for EU, GST for others
 */
export const TAX_RATES: Record<string, number> = {
  // European Union VAT rates
  AT: 0.20, // Austria
  BE: 0.21, // Belgium
  BG: 0.20, // Bulgaria
  HR: 0.25, // Croatia
  CY: 0.19, // Cyprus
  CZ: 0.21, // Czech Republic
  DK: 0.25, // Denmark
  EE: 0.20, // Estonia
  FI: 0.24, // Finland
  FR: 0.20, // France
  DE: 0.19, // Germany
  GR: 0.24, // Greece
  HU: 0.27, // Hungary
  IE: 0.23, // Ireland
  IT: 0.22, // Italy
  LV: 0.21, // Latvia
  LT: 0.21, // Lithuania
  LU: 0.17, // Luxembourg
  MT: 0.18, // Malta
  NL: 0.21, // Netherlands
  PL: 0.23, // Poland
  PT: 0.23, // Portugal
  RO: 0.19, // Romania
  SK: 0.20, // Slovakia
  SI: 0.22, // Slovenia
  ES: 0.21, // Spain
  SE: 0.25, // Sweden
  
  // Other countries
  GB: 0.20, // UK VAT
  US: 0.00, // Varies by state - handle separately
  CA: 0.05, // Federal GST only (provinces add PST/HST)
  AU: 0.10, // GST
  NZ: 0.15, // GST
  CH: 0.077, // Switzerland
  NO: 0.25, // Norway
  JP: 0.10, // Japan
  IN: 0.18, // India GST
  SG: 0.08, // Singapore
};

/**
 * Calculate tax amount based on country and gross amount
 */
export function calculateTax(
  countryCode: string,
  grossAmount: number,
  isB2B: boolean = false
): { taxRate: number; taxAmount: number } {
  // B2B reverse charge for EU
  if (isB2B && isEUCountry(countryCode)) {
    return { taxRate: 0, taxAmount: 0 };
  }
  
  const taxRate = TAX_RATES[countryCode] || 0;
  const taxAmount = Math.round(grossAmount * taxRate * 100) / 100;
  
  return { taxRate, taxAmount };
}

/**
 * Check if country is in EU
 */
export function isEUCountry(countryCode: string): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  return euCountries.includes(countryCode);
}

/**
 * Calculate platform commission after payment processor fees
 */
export function calculateCommission(
  grossAmount: number,
  processorFeePercentage: number = 0.029, // Stripe default 2.9%
  processorFeeFixed: number = 0.30 // Stripe $0.30 per transaction
): {
  processorFee: number;
  netAmount: number;
} {
  const processorFee = Math.round((grossAmount * processorFeePercentage + processorFeeFixed) * 100) / 100;
  const netAmount = Math.round((grossAmount - processorFee) * 100) / 100;
  
  return { processorFee, netAmount };
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get tax report for a date range
 */
export interface TaxReport {
  totalGross: number;
  totalTax: number;
  totalNet: number;
  totalProcessorFees: number;
  transactionCount: number;
  byCountry: Record<string, {
    gross: number;
    tax: number;
    count: number;
  }>;
}

export function generateTaxReport(records: CommissionTaxRecord[]): TaxReport {
  const report: TaxReport = {
    totalGross: 0,
    totalTax: 0,
    totalNet: 0,
    totalProcessorFees: 0,
    transactionCount: records.length,
    byCountry: {},
  };
  
  for (const record of records) {
    report.totalGross += record.gross_amount || record.payment_amount;
    report.totalTax += record.tax_amount || 0;
    report.totalNet += record.net_amount || 0;
    report.totalProcessorFees += record.payment_processor_fee || 0;
    
    const country = record.user_country;
    if (!report.byCountry[country]) {
      report.byCountry[country] = { gross: 0, tax: 0, count: 0 };
    }
    report.byCountry[country].gross += record.gross_amount || record.payment_amount;
    report.byCountry[country].tax += record.tax_amount || 0;
    report.byCountry[country].count += 1;
  }
  
  return report;
}
