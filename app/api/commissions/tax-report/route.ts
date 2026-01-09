import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { CommissionTaxRecord, generateTaxReport } from "@/lib/commissions";

/**
 * GET /api/commissions/tax-report?start_date=2024-01-01&end_date=2024-12-31
 * Generate tax report for a date range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const country = searchParams.get("country");

    if (!start_date || !end_date) {
      return NextResponse.json(
        { error: "start_date and end_date are required" },
        { status: 400 }
      );
    }

    let sql = `
      SELECT * FROM commissions_taxes 
      WHERE payment_date >= ? 
      AND payment_date <= ?
      AND refund_status = 'none'
    `;
    const args: any[] = [start_date, end_date];

    if (country) {
      sql += " AND user_country = ?";
      args.push(country);
    }

    sql += " ORDER BY payment_date ASC";

    const result = await db.execute({ sql, args });
    const records = result.rows as unknown as CommissionTaxRecord[];

    // Generate comprehensive report
    const report = generateTaxReport(records);

    // Additional statistics
    const stats = {
      averageTransactionValue: records.length > 0 
        ? Math.round((report.totalGross / records.length) * 100) / 100 
        : 0,
      effectiveTaxRate: report.totalGross > 0 
        ? Math.round((report.totalTax / report.totalGross) * 10000) / 100 
        : 0,
      effectiveFeeRate: report.totalGross > 0 
        ? Math.round((report.totalProcessorFees / report.totalGross) * 10000) / 100 
        : 0,
      netProfitMargin: report.totalGross > 0 
        ? Math.round(((report.totalNet - report.totalTax) / report.totalGross) * 10000) / 100 
        : 0,
    };

    // Top countries by revenue
    const topCountries = Object.entries(report.byCountry)
      .sort(([, a], [, b]) => b.gross - a.gross)
      .slice(0, 10)
      .map(([code, data]) => ({
        country: code,
        revenue: data.gross,
        tax: data.tax,
        transactions: data.count,
      }));

    return NextResponse.json({
      success: true,
      period: { start_date, end_date },
      summary: {
        totalGross: report.totalGross,
        totalTax: report.totalTax,
        totalNet: report.totalNet,
        totalProcessorFees: report.totalProcessorFees,
        netAfterTaxAndFees: report.totalNet - report.totalTax,
        transactionCount: report.transactionCount,
      },
      statistics: stats,
      byCountry: report.byCountry,
      topCountries,
    });
  } catch (error) {
    console.error("Error generating tax report:", error);
    return NextResponse.json(
      { error: "Failed to generate tax report" },
      { status: 500 }
    );
  }
}
