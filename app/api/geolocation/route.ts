import { NextRequest, NextResponse } from 'next/server';

// EU country codes
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
];

export async function GET(request: NextRequest) {
  try {
    // Try to get country from Vercel's edge function headers
    const country = request.headers.get('x-vercel-ip-country');
    
    // Fallback: try to get IP and use a geolocation service
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') ||
               'unknown';

    let detectedCountry = country || null;
    let currency = 'USD';
    let locale = 'en-US';

    // If we have a country code, determine currency
    if (detectedCountry === 'GB') {
      currency = 'GBP';
      locale = 'en-GB';
    } else if (detectedCountry && EU_COUNTRIES.includes(detectedCountry)) {
      currency = 'EUR';
      locale = 'en-GB'; // Use British English for EU
    }

    return NextResponse.json({
      country: detectedCountry,
      currency,
      locale,
      ip: ip === 'unknown' ? null : ip,
      isEU: detectedCountry ? EU_COUNTRIES.includes(detectedCountry) : false,
      isUK: detectedCountry === 'GB'
    });
  } catch (error) {
    console.error('Geolocation detection error:', error);
    
    // Default to USD for rest of world
    return NextResponse.json({
      country: null,
      currency: 'USD',
      locale: 'en-US',
      ip: null,
      isEU: false
    });
  }
}
