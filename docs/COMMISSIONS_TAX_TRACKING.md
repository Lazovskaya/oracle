# Commissions and Tax Tracking System

This system tracks all payment transactions, commissions, and tax obligations for Oracle.

## Database Schema

The `commissions_taxes` table includes:

### User Information
- `user_id` - User identifier
- `user_email` - User email address

### Transaction Details
- `payment_date` - When payment was received
- `payment_amount` - Total amount paid
- `payment_currency` - Currency code (USD, EUR, etc.)
- `payment_method` - Payment processor (stripe, paypal, crypto)
- `transaction_id` - External payment ID

### Subscription Details
- `subscription_type` - Plan type (pro, premium, etc.)
- `subscription_start_date` - Subscription begins
- `subscription_end_date` - Subscription expires ("till when")
- `billing_cycle` - monthly, yearly, lifetime

### Geographic Information (for tax calculation)
- `user_country` - ISO country code (US, GB, DE, etc.)
- `user_state` - State/province (for US/Canada)
- `user_city` - City name
- `user_postal_code` - ZIP/postal code
- `user_ip_address` - IP for verification

### Tax Calculation
- `tax_rate` - Applicable tax rate (e.g., 0.20 for 20%)
- `tax_amount` - Calculated tax in transaction currency
- `vat_number` - EU VAT number for B2B
- `is_reverse_charge` - EU B2B reverse charge flag

### Commission Tracking
- `gross_amount` - Amount before fees
- `payment_processor_fee` - Stripe/PayPal fees deducted
- `net_amount` - Amount after processor fees
- `platform_commission` - Your commission amount

### Additional Metadata
- `invoice_number` - Generated invoice ID
- `receipt_url` - Link to receipt/invoice
- `refund_status` - none, partial, full
- `refund_amount` - Amount refunded
- `refund_date` - When refunded
- `notes` - Additional information

## Setup

1. Run the migration to create the table:
```bash
node scripts/migrate-commissions-table.js
```

2. The table will be created with indexes for efficient querying.

## API Endpoints

### Record a Commission
`POST /api/commissions/record`

```json
{
  "user_id": "user_123",
  "user_email": "user@example.com",
  "payment_amount": 29.99,
  "payment_currency": "USD",
  "payment_method": "stripe",
  "transaction_id": "ch_1234567890",
  "subscription_type": "pro",
  "subscription_start_date": "2024-01-01T00:00:00Z",
  "subscription_end_date": "2024-02-01T00:00:00Z",
  "billing_cycle": "monthly",
  "user_country": "US",
  "user_state": "CA",
  "user_city": "San Francisco",
  "user_postal_code": "94102",
  "user_ip_address": "192.168.1.1",
  "receipt_url": "https://stripe.com/receipt/xyz",
  "notes": "First payment"
}
```

The system automatically calculates:
- Tax rate and amount based on country
- Payment processor fees (default 2.9% + $0.30)
- Net amount after fees
- Invoice number

### Get Commission Records
`GET /api/commissions/record?user_id=user_123`

Query parameters:
- `user_id` - Filter by user
- `start_date` - Filter from date (ISO format)
- `end_date` - Filter to date (ISO format)
- `country` - Filter by country code

### Generate Tax Report
`GET /api/commissions/tax-report?start_date=2024-01-01&end_date=2024-12-31`

Returns comprehensive report including:
- Total gross revenue
- Total tax collected
- Total processor fees
- Net revenue
- Breakdown by country
- Top countries by revenue
- Statistics (average transaction, effective tax rate, etc.)

Query parameters:
- `start_date` - Report start (required, ISO format)
- `end_date` - Report end (required, ISO format)
- `country` - Filter to specific country (optional)

## Helper Functions

### Calculate Tax
```typescript
import { calculateTax } from '@/lib/commissions';

const { taxRate, taxAmount } = calculateTax('DE', 100.00, false);
// taxRate: 0.19, taxAmount: 19.00
```

### Calculate Commission
```typescript
import { calculateCommission } from '@/lib/commissions';

const { processorFee, netAmount } = calculateCommission(100.00);
// processorFee: 3.20, netAmount: 96.80
```

### Generate Invoice Number
```typescript
import { generateInvoiceNumber } from '@/lib/commissions';

const invoice = generateInvoiceNumber();
// Returns: "INV-202401-1234"
```

### Generate Tax Report
```typescript
import { generateTaxReport } from '@/lib/commissions';

const records = await fetchRecords();
const report = generateTaxReport(records);

console.log(report.totalGross);
console.log(report.totalTax);
console.log(report.byCountry);
```

## Tax Rates

The system includes pre-configured tax rates for:
- All EU countries (VAT)
- UK (VAT)
- Australia (GST)
- New Zealand (GST)
- Canada (GST)
- Switzerland
- Norway
- Japan
- India
- Singapore

**Note:** US sales tax varies by state. The default is 0%, but you should configure state-specific rates.

## Important Tax Rules

### EU B2B Transactions
If customer provides VAT number, reverse charge applies (0% tax, customer pays in their country).

### EU B2C Transactions
Charge VAT rate of customer's country.

### Outside EU
Apply local tax rates (GST, sales tax, etc.) based on customer location.

## Integration Example

When processing a Stripe payment:

```typescript
// In your Stripe webhook handler
const session = await stripe.checkout.sessions.retrieve(sessionId);

await fetch('/api/commissions/record', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: session.client_reference_id,
    user_email: session.customer_email,
    payment_amount: session.amount_total / 100,
    payment_currency: session.currency.toUpperCase(),
    payment_method: 'stripe',
    transaction_id: session.payment_intent,
    subscription_type: 'pro',
    subscription_start_date: new Date().toISOString(),
    subscription_end_date: addMonths(new Date(), 1).toISOString(),
    billing_cycle: 'monthly',
    user_country: session.customer_details.address.country,
    user_state: session.customer_details.address.state,
    user_city: session.customer_details.address.city,
    user_postal_code: session.customer_details.address.postal_code,
    receipt_url: session.receipt_url,
  }),
});
```

## Reporting

### Quarterly Tax Report
```bash
curl "http://localhost:3000/api/commissions/tax-report?start_date=2024-01-01&end_date=2024-03-31"
```

### Country-Specific Report
```bash
curl "http://localhost:3000/api/commissions/tax-report?start_date=2024-01-01&end_date=2024-12-31&country=DE"
```

### Export to CSV
Query the database directly for CSV export:
```sql
SELECT 
  payment_date,
  user_country,
  user_email,
  payment_amount,
  tax_amount,
  payment_processor_fee,
  net_amount,
  invoice_number
FROM commissions_taxes
WHERE payment_date >= '2024-01-01'
AND payment_date <= '2024-12-31'
ORDER BY payment_date ASC;
```

## Best Practices

1. **Record every transaction immediately** after successful payment
2. **Include all geographic data** for accurate tax calculation
3. **Store transaction_id** from payment processor for reconciliation
4. **Generate quarterly reports** for tax filing
5. **Verify tax rates** with your accountant (rates change)
6. **Keep receipt URLs** for customer support
7. **Monitor refunds** and update refund_status accordingly
8. **Back up the database** regularly

## Disclaimer

Tax rates provided are approximate and subject to change. Always consult with a tax professional or accountant for accurate tax calculations and compliance with local regulations.
