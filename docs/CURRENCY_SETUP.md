# Multi-Currency Setup - Environment Variables

## Required Stripe Price IDs

You need to create EUR price IDs in your Stripe dashboard and add them to your environment variables.

### Current USD Price IDs (already configured)
- `STRIPE_BASIC_PRICE_ID` - Basic Monthly ($9/month)
- `STRIPE_PRO_PRICE_ID` - Pro Monthly ($19/month)
- `STRIPE_BASIC_YEARLY_PRICE_ID` - Basic Yearly ($79/year)
- `STRIPE_PRO_YEARLY_PRICE_ID` - Pro Yearly ($149/year)

### New EUR Price IDs (need to be created in Stripe)

Add these to your `.env.local` file:

```bash
# EUR Pricing
STRIPE_BASIC_PRICE_ID_EUR=price_xxx  # €8/month
STRIPE_PRO_PRICE_ID_EUR=price_xxx  # €17/month
STRIPE_BASIC_YEARLY_PRICE_ID_EUR=price_xxx  # €69/year
STRIPE_PRO_YEARLY_PRICE_ID_EUR=price_xxx  # €129/year
```

## Steps to Create EUR Prices in Stripe

1. **Go to Stripe Dashboard** → Products
2. **For each product, create a new price:**
   - Click on the product (Basic or Pro)
   - Click "Add another price"
   - Set the currency to **EUR**
   - Set the appropriate price (€8, €17, €69, or €129)
   - Set billing period (monthly or yearly)
   - Save and copy the price ID
3. **Add the price IDs to your environment variables**
4. **Restart your development server** to load the new environment variables

## EUR Pricing Structure

### Monthly Plans
- **Basic (Premium)**: €8/month (was $9/month)
- **Pro**: €17/month (was $19/month)

### Yearly Plans (with discount)
- **Basic (Premium) Yearly**: €69/year (save 27%, was €96)
- **Pro Yearly**: €129/year (save 35%, was €204)

## How It Works

1. **IP-based Detection**: When users visit the pricing page, the system detects their location via `/api/geolocation`
2. **EU Countries**: Users from EU countries automatically see EUR pricing
3. **Rest of World**: All other users see USD pricing
4. **Manual Override**: Users can switch between USD/EUR using the currency toggle
5. **Locale**: EUR users see prices with "€" symbol and EN-GB locale, USD users see "$" and EN-US locale

## EU Country List

The system recognizes these countries as EU:
AT, BE, BG, HR, CY, CZ, DK, EE, FI, FR, DE, GR, HU, IE, IT, LV, LT, LU, MT, NL, PL, PT, RO, SK, SI, ES, SE

## Testing

To test the multi-currency feature:
1. Visit `/pricing` - you should see a currency switcher (USD $ / EUR €)
2. Toggle between currencies to see price changes
3. The appropriate Stripe price ID is sent based on selected currency
4. Test checkout with both currencies (Stripe test mode recommended)

## Notes

- Currently only English (EN-US and EN-GB) is supported
- Other languages are hidden but can be enabled later
- Prices automatically adjust based on currency
- The system saves user's currency preference in localStorage
