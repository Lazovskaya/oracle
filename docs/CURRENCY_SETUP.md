# Multi-Currency Setup - Environment Variables

## Required Stripe Price IDs

You need to create EUR and GBP price IDs in your Stripe dashboard and add them to your environment variables.

### Current USD Price IDs (already configured)
- `STRIPE_BASIC_PRICE_ID` - Basic Monthly ($9/month)
- `STRIPE_PRO_PRICE_ID` - Pro Monthly ($19/month)
- `STRIPE_BASIC_YEARLY_PRICE_ID` - Basic Yearly ($79/year)
- `STRIPE_PRO_YEARLY_PRICE_ID` - Pro Yearly ($149/year)

### New EUR Price IDs (need to be created in Stripe)

Add these to your `.env.local` file:

```bash
# EUR Pricing
STRIPE_BASIC_PRICE_ID_EUR=price_xxx  # €9/month
STRIPE_PRO_PRICE_ID_EUR=price_xxx  # €19/month
STRIPE_BASIC_YEARLY_PRICE_ID_EUR=price_xxx  # €79/year
STRIPE_PRO_YEARLY_PRICE_ID_EUR=price_xxx  # €149/year
```

### New GBP Price IDs (need to be created in Stripe)

Add these to your `.env.local` file:

```bash
# GBP Pricing
STRIPE_BASIC_PRICE_ID_GBP=price_xxx  # £9/month
STRIPE_PRO_PRICE_ID_GBP=price_xxx  # £19/month
STRIPE_BASIC_YEARLY_PRICE_ID_GBP=price_xxx  # £79/year
STRIPE_PRO_YEARLY_PRICE_ID_GBP=price_xxx  # £149/year
```

## Steps to Create EUR and GBP Prices in Stripe

1. **Go to Stripe Dashboard** → Products
2. **For each product, create new prices:**
   - Click on the product (Basic or Pro)
   - Click "Add another price"
   - Set the currency to **EUR** or **GBP**
   - Set the appropriate price (same amount as USD: 9, 19, 79, or 149)
   - Set billing period (monthly or yearly)
   - Save and copy the price ID
3. **Add the price IDs to your environment variables**
4. **Restart your development server** to load the new environment variables

## Pricing Structure (Same Across All Currencies)

All currencies use the same price numbers - no conversion applied.

### Monthly Plans
- **Basic (Premium)**: $9 / £9 / €9 per month
- **Pro**: $19 / £19 / €19 per month

### Yearly Plans (with discount)
- **Basic Yearly**: $79 / £79 / €79 per year (save 27%)
- **Pro Yearly**: $149 / £149 / €149 per year (save 35%)

## How It Works

1. **IP-based Detection**: When users visit the pricing page, the system detects their location via `/api/geolocation`
2. **GB (United Kingdom)**: Users from UK automatically see GBP (£) pricing
3. **EU Countries**: Users from EU countries automatically see EUR (€) pricing
4. **Rest of World**: All other users see USD ($) pricing
5. **Manual Override**: Users can switch between USD/GBP/EUR using the currency selector in the header
6. **Same Prices**: All currencies use the same numbers (no conversion) - $9, £9, and €9 are the same price
7. **Locale**: GBP and EUR users see EN-GB locale, USD users see EN-US locale

## EU Country List

The system recognizes these countries as EU:
AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE

## Testing

To test the multi-currency feature:
1. Visit `/pricing` - you should see a currency selector in the header ($ USD / £ GBP / € EUR)
2. Toggle between currencies to see the currency symbol change (prices remain the same)
3. The appropriate Stripe price ID is sent based on selected currency
4. Test checkout with all currencies (Stripe test mode recommended)

## Notes

- Currently supports USD, GBP, and EUR
- **No currency conversion**: All prices use the same numbers ($9 = £9 = €9)
- Only English (EN-US and EN-GB) is supported
- Other languages are hidden but can be enabled later
- The system saves user's currency preference in localStorage
- UK users automatically see GBP pricing
- EU users automatically see EUR pricing
- Rest of world sees USD pricing
- Currency selector is located in the header next to language selector
