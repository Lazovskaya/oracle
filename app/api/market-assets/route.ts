import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET - Fetch all market assets with their latest data
 */
export async function GET(request: NextRequest) {
  try {
    const result = await db.execute({
      sql: `
        SELECT 
          symbol,
          name,
          asset_type,
          price,
          change_1h,
          change_24h,
          change_7d,
          volume_24h,
          market_cap,
          volatility_14d,
          is_trending,
          is_volatile,
          last_updated,
          data_source
        FROM market_assets
        ORDER BY 
          CASE asset_type 
            WHEN 'crypto' THEN 1 
            WHEN 'stock' THEN 2 
            WHEN 'etf' THEN 3 
            ELSE 4 
          END,
          market_cap DESC
      `
    });

    return NextResponse.json({
      success: true,
      assets: result.rows,
      count: result.rows.length
    });
  } catch (error: any) {
    console.error('Error fetching market assets:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch market assets'
    }, { status: 500 });
  }
}

/**
 * POST - Manually add a new market asset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, asset_type, price } = body;

    if (!symbol || !asset_type || !price) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: symbol, asset_type, price'
      }, { status: 400 });
    }

    // Validate asset_type
    if (!['crypto', 'stock', 'etf', 'commodity'].includes(asset_type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid asset_type. Must be: crypto, stock, etf, or commodity'
      }, { status: 400 });
    }

    await db.execute({
      sql: `
        INSERT INTO market_assets (
          symbol, name, asset_type, price, 
          last_updated, data_source
        ) VALUES (?, ?, ?, ?, datetime('now'), 'manual')
        ON CONFLICT(symbol) DO UPDATE SET
          name = excluded.name,
          asset_type = excluded.asset_type,
          price = excluded.price,
          last_updated = datetime('now'),
          data_source = 'manual'
      `,
      args: [
        symbol.toUpperCase(),
        name || symbol,
        asset_type,
        parseFloat(price)
      ]
    });

    return NextResponse.json({
      success: true,
      message: `Asset ${symbol} added successfully`
    });
  } catch (error: any) {
    console.error('Error adding market asset:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to add market asset'
    }, { status: 500 });
  }
}

/**
 * DELETE - Remove a market asset
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json({
        success: false,
        error: 'Missing symbol parameter'
      }, { status: 400 });
    }

    await db.execute({
      sql: 'DELETE FROM market_assets WHERE symbol = ?',
      args: [symbol]
    });

    return NextResponse.json({
      success: true,
      message: `Asset ${symbol} deleted successfully`
    });
  } catch (error: any) {
    console.error('Error deleting market asset:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to delete market asset'
    }, { status: 500 });
  }
}
