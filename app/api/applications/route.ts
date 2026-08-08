import { NextRequest, NextResponse } from "next/server";
import { applicantSchema } from "@/lib/validation";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { computeBreakdown } from "@/lib/scoring";
import { computeFitResult } from "@/lib/fit-assessment";
import { notifyManagerOnTelegram } from "@/lib/telegram";
import { checkPublicRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import type { FitAnswers } from "@/lib/fit-assessment";

export async function POST(request: NextRequest) {
  const rlKey = getRateLimitKey(request.headers);
  if (!checkPublicRateLimit(rlKey, 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = applicantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 422 }
    );
  }

  const { full_name, phone, city, sales_background, network_size, availability, motivation, referral_code, fit_answers } = parsed.data;

  await ensureSchema();

  let referralAgentName: string | null = null;
  if (referral_code) {
    const ref = await selectOne(
      "SELECT agent_name FROM referral_links WHERE code = ?",
      [referral_code]
    ) as { agent_name: string } | undefined;
    referralAgentName = ref?.agent_name ?? null;
  }

  const result = await executeInsert(
    `INSERT INTO applicants (full_name, phone, city, sales_background, network_size, availability, motivation, referral_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [full_name, phone, city || null, sales_background || null, network_size || null, availability || null, motivation || null, referral_code || null]
  );

  const applicantId = Number(result.lastInsertRowid);

  const breakdown = computeBreakdown({ salesBackground: sales_background ?? null, networkSize: network_size ?? null, availability: availability ?? null });
  const mainScore = breakdown.total;

  let fitResult = null;
  if (fit_answers && Object.keys(fit_answers as FitAnswers).length > 0) {
    fitResult = computeFitResult(fit_answers as FitAnswers);
    await executeInsert(
      "INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (?, ?, ?)",
      [applicantId, JSON.stringify(fit_answers), fitResult.summary]
    );
  }

  const totalScore = fitResult ? mainScore + fitResult.fitScore : mainScore;

  await executeUpdate("UPDATE applicants SET score = ? WHERE id = ?", [totalScore, applicantId]);

  try {
    await notifyManagerOnTelegram({
      fullName: full_name,
      phone,
      score: totalScore,
      scoreBreakdown: breakdown,
      fitResult,
      referralAgentName,
    });
    await executeUpdate("UPDATE applicants SET telegram_notified_at = datetime('now') WHERE id = ?", [applicantId]);
  } catch (err) {
    console.error("[applications] telegram notification failed:", err);
  }

  return NextResponse.json(
    {
      id: applicantId,
      score: totalScore,
      fitScore: fitResult?.fitScore ?? null,
      message: "با موفقیت ثبت شد",
    },
    { status: 201 },
  );
}
