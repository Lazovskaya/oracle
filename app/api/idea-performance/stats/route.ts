import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { IdeaPerformance, calculatePerformanceStats } from "@/lib/ideaPerformance";

/**
 * GET /api/idea-performance/stats?user_email=xxx
 * Get performance statistics for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_email = searchParams.get("user_email");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const symbol = searchParams.get("symbol");

    if (!user_email) {
      return NextResponse.json(
        { error: "user_email is required" },
        { status: 400 }
      );
    }

    let sql = "SELECT * FROM idea_performance WHERE user_email = ?";
    const args: any[] = [user_email];

    if (start_date) {
      sql += " AND created_at >= ?";
      args.push(start_date);
    }

    if (end_date) {
      sql += " AND created_at <= ?";
      args.push(end_date);
    }

    if (symbol) {
      sql += " AND symbol = ?";
      args.push(symbol);
    }

    const result = await db.execute({ sql, args });
    const trades = result.rows as unknown as IdeaPerformance[];

    // Calculate comprehensive statistics
    const stats = calculatePerformanceStats(trades);

    // Group by symbol
    const symbolGroups: Record<string, IdeaPerformance[]> = {};
    trades.forEach(trade => {
      if (!symbolGroups[trade.symbol]) {
        symbolGroups[trade.symbol] = [];
      }
      symbolGroups[trade.symbol].push(trade);
    });

    const bySymbol = Object.entries(symbolGroups).map(([symbol, trades]) => ({
      symbol,
      count: trades.length,
      stats: calculatePerformanceStats(trades),
    }));

    // Recent trades
    const recentTrades = trades
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      stats,
      bySymbol: bySymbol.sort((a, b) => b.stats.totalProfitLoss - a.stats.totalProfitLoss),
      recentTrades,
    });
  } catch (error) {
    console.error("Error fetching performance stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance stats" },
      { status: 500 }
    );
  }
}
