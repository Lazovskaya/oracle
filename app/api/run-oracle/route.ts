import { NextResponse } from "next/server";
import { buildOraclePrompt } from "@/lib/oraclePrompt";
import { db } from "@/lib/db";
import OpenAI from "openai";

export const runtime = "nodejs"; // стабильнее для OpenAI

export async function GET() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    const today = new Date().toISOString().split("T")[0];
    const prompt = buildOraclePrompt(today);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Ты инвестиционный аналитик." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    });

    const result = completion.choices[0].message.content;

    // сохраняем в БД
    await db.execute({
      sql: `
        INSERT INTO oracle_runs (date, result)
        VALUES (?, ?)
      `,
      args: [today, result]
    });

    return NextResponse.json({
      status: "ok",
      date: today
    });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
