import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  CommissionTaxRecord,
  calculateTax,
  calculateCommission,
  generateInvoiceNumber,
} from "@/lib/commissions";

/**
 * POST /api/commissions/record
 * Record a new commission/tax entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      user_id,
      user_email,
      payment_amount,
      payment_currency = 'USD',
      payment_method,
      transaction_id,
      subscription_type,
      subscription_start_date,
      subscription_end_date,
      billing_cycle,
      user_country,
      user_state,
      user_city,
      user_postal_code,
      user_ip_address,
      vat_number,
      receipt_url,
      notes,
    } = body;

    // Validate required fields
    if (!user_id || !payment_amount || !user_country || !subscription_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate tax
    const isB2B = !!vat_number;
    const { taxRate, taxAmount } = calculateTax(
      user_country,
      payment_amount,
      isB2B
    );

    // Calculate commission and fees
    const { processorFee, netAmount } = calculateCommission(payment_amount);

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Prepare record
    const record: Partial<CommissionTaxRecord> = {
      user_id,
      user_email,
      payment_date: new Date().toISOString(),
      payment_amount,
      payment_currency,
      payment_method,
      transaction_id,
      subscription_type,
      subscription_start_date,
      subscription_end_date,
      billing_cycle,
      user_country,
      user_state,
      user_city,
      user_postal_code,
      user_ip_address,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      vat_number,
      is_reverse_charge: isB2B && taxRate === 0,
      gross_amount: payment_amount,
      payment_processor_fee: processorFee,
      net_amount: netAmount,
      platform_commission: netAmount, // Adjust if you have partners
      invoice_number: invoiceNumber,
      receipt_url,
      refund_status: 'none',
      refund_amount: 0,
      notes,
    };

    // Insert into database
    const sql = `
      INSERT INTO commissions_taxes (
        user_id, user_email, payment_date, payment_amount, payment_currency,
        payment_method, transaction_id, subscription_type, subscription_start_date,
        subscription_end_date, billing_cycle, user_country, user_state, user_city,
        user_postal_code, user_ip_address, tax_rate, tax_amount, vat_number,
        is_reverse_charge, gross_amount, payment_processor_fee, net_amount,
        platform_commission, invoice_number, receipt_url, refund_status,
        refund_amount, notes
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `;

    const result = await db.execute({
      sql,
      args: [
        record.user_id,
        record.user_email,
        record.payment_date,
        record.payment_amount,
        record.payment_currency,
        record.payment_method,
        record.transaction_id,
        record.subscription_type,
        record.subscription_start_date,
        record.subscription_end_date,
        record.billing_cycle,
        record.user_country,
        record.user_state,
        record.user_city,
        record.user_postal_code,
        record.user_ip_address,
        record.tax_rate,
        record.tax_amount,
        record.vat_number,
        record.is_reverse_charge ? 1 : 0,
        record.gross_amount,
        record.payment_processor_fee,
        record.net_amount,
        record.platform_commission,
        record.invoice_number,
        record.receipt_url,
        record.refund_status,
        record.refund_amount,
        record.notes,
      ],
    });

    return NextResponse.json({
      success: true,
      invoice_number: invoiceNumber,
      record,
    });
  } catch (error) {
    console.error("Error recording commission:", error);
    return NextResponse.json(
      { error: "Failed to record commission" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/commissions/record?user_id=xxx
 * Get commission records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const country = searchParams.get("country");

    let sql = "SELECT * FROM commissions_taxes WHERE 1=1";
    const args: any[] = [];

    if (user_id) {
      sql += " AND user_id = ?";
      args.push(user_id);
    }

    if (start_date) {
      sql += " AND payment_date >= ?";
      args.push(start_date);
    }

    if (end_date) {
      sql += " AND payment_date <= ?";
      args.push(end_date);
    }

    if (country) {
      sql += " AND user_country = ?";
      args.push(country);
    }

    sql += " ORDER BY payment_date DESC";

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      success: true,
      records: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching commissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}
