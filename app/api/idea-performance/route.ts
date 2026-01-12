import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import {
  IdeaPerformance,
  calculateProfitLoss,
  calculateDuration,
  calculateRiskRewardRatio,
  determineStatus,
} from "@/lib/ideaPerformance";

/**
 * POST /api/idea-performance
 * Create or update idea performance tracking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      saved_idea_id,
      saved_analysis_id,
      user_email,
      symbol,
      idea_type,
      entry_price,
      entry_date,
      position_size,
      position_value,
      exit_price,
      exit_date,
      exit_reason,
      status,
      original_target,
      original_stop_loss,
      targets_hit,
      highest_price,
      lowest_price,
      expected_timeframe,
      notes,
      lessons_learned,
    } = body;

    // Validate required fields
    if (!user_email || !symbol || !idea_type) {
      return NextResponse.json(
        { error: "Missing required fields: user_email, symbol, idea_type" },
        { status: 400 }
      );
    }

    // Calculate metrics if closing the trade
    let profit_loss = null;
    let profit_loss_percentage = null;
    let risk_reward_ratio = null;
    let duration_days = null;
    let calculated_status = status || 'active';
    let closed_at = null;

    if (exit_price && entry_price) {
      const metrics = calculateProfitLoss(entry_price, exit_price, position_size || 1);
      profit_loss = metrics.profitLoss;
      profit_loss_percentage = metrics.profitLossPercentage;
      
      if (original_stop_loss) {
        risk_reward_ratio = calculateRiskRewardRatio(entry_price, exit_price, original_stop_loss);
      }
      
      if (!status) {
        calculated_status = determineStatus(profit_loss_percentage);
      }
    }

    if (entry_date && exit_date) {
      duration_days = calculateDuration(entry_date, exit_date);
    }

    if (['winner', 'loser', 'breakeven', 'cancelled'].includes(calculated_status)) {
      closed_at = exit_date || new Date().toISOString();
    }

    // Update existing or create new
    if (id) {
      // Update
      const sql = `
        UPDATE idea_performance 
        SET 
          entry_price = ?,
          entry_date = ?,
          position_size = ?,
          position_value = ?,
          exit_price = ?,
          exit_date = ?,
          exit_reason = ?,
          status = ?,
          profit_loss = ?,
          profit_loss_percentage = ?,
          risk_reward_ratio = ?,
          original_target = ?,
          original_stop_loss = ?,
          targets_hit = ?,
          highest_price = ?,
          lowest_price = ?,
          duration_days = ?,
          expected_timeframe = ?,
          notes = ?,
          lessons_learned = ?,
          updated_at = ?,
          closed_at = ?
        WHERE id = ? AND user_email = ?
      `;

      await db.execute({
        sql,
        args: [
          entry_price ?? null,
          entry_date ?? null,
          position_size ?? null,
          position_value ?? null,
          exit_price ?? null,
          exit_date ?? null,
          exit_reason ?? null,
          calculated_status,
          profit_loss ?? null,
          profit_loss_percentage ?? null,
          risk_reward_ratio ?? null,
          original_target ?? null,
          original_stop_loss ?? null,
          targets_hit ?? null,
          highest_price ?? null,
          lowest_price ?? null,
          duration_days ?? null,
          expected_timeframe ?? null,
          notes ?? null,
          lessons_learned ?? null,
          new Date().toISOString(),
          closed_at ?? null,
          id,
          user_email,
        ],
      });

      return NextResponse.json({ success: true, id, updated: true });
    } else {
      // Create new
      const sql = `
        INSERT INTO idea_performance (
          saved_idea_id, saved_analysis_id, user_email, symbol, idea_type,
          entry_price, entry_date, position_size, position_value,
          exit_price, exit_date, exit_reason,
          status, profit_loss, profit_loss_percentage, risk_reward_ratio,
          original_target, original_stop_loss, targets_hit,
          highest_price, lowest_price,
          duration_days, expected_timeframe,
          notes, lessons_learned, closed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result = await db.execute({
        sql,
        args: [
          saved_idea_id ?? null,
          saved_analysis_id ?? null,
          user_email,
          symbol,
          idea_type,
          entry_price ?? null,
          entry_date ?? null,
          position_size ?? null,
          position_value ?? null,
          exit_price ?? null,
          exit_date ?? null,
          exit_reason ?? null,
          calculated_status,
          profit_loss ?? null,
          profit_loss_percentage ?? null,
          risk_reward_ratio ?? null,
          original_target ?? null,
          original_stop_loss ?? null,
          targets_hit ?? null,
          highest_price ?? null,
          lowest_price ?? null,
          duration_days ?? null,
          expected_timeframe ?? null,
          notes ?? null,
          lessons_learned ?? null,
          closed_at ?? null,
        ],
      });

      return NextResponse.json({ 
        success: true, 
        id: result.info.lastInsertRowid,
        created: true 
      });
    }
  } catch (error) {
    console.error("Error saving idea performance:", error);
    return NextResponse.json(
      { error: "Failed to save idea performance" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/idea-performance?user_email=xxx
 * Get idea performance records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_email = searchParams.get("user_email");
    const symbol = searchParams.get("symbol");
    const status = searchParams.get("status");
    const idea_type = searchParams.get("idea_type");

    if (!user_email) {
      return NextResponse.json(
        { error: "user_email is required" },
        { status: 400 }
      );
    }

    let sql = "SELECT * FROM idea_performance WHERE user_email = ?";
    const args: any[] = [user_email];

    if (symbol) {
      sql += " AND symbol = ?";
      args.push(symbol);
    }

    if (status) {
      sql += " AND status = ?";
      args.push(status);
    }

    if (idea_type) {
      sql += " AND idea_type = ?";
      args.push(idea_type);
    }

    sql += " ORDER BY created_at DESC";

    const result = await db.execute({ sql, args });

    return NextResponse.json({
      success: true,
      records: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error fetching idea performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch idea performance" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/idea-performance?id=xxx
 * Delete a performance record
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const user_email = searchParams.get("user_email");

    if (!id || !user_email) {
      return NextResponse.json(
        { error: "id and user_email are required" },
        { status: 400 }
      );
    }

    await db.execute({
      sql: "DELETE FROM idea_performance WHERE id = ? AND user_email = ?",
      args: [id, user_email],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting idea performance:", error);
    return NextResponse.json(
      { error: "Failed to delete idea performance" },
      { status: 500 }
    );
  }
}
