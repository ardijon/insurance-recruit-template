import { NextRequest, NextResponse } from "next/server";
import { applicantSchema } from "@/lib/validation";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { computeBreakdown, deriveMotivationScore } from "@/lib/scoring";
import { computeFitResult } from "@/lib/fit-assessment";
import { notifyManagerOnTelegram } from "@/lib/telegram";
import { checkPublicRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/demo";
import type { FitAnswers } from "@/lib/fit-assessment";

export async function POST(request: NextRequest) {
  const rlKey = getRateLimitKey(request);
  if (!(await checkPublicRateLimit(rlKey, 10))) {
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

  const { full_name, phone, city, sales_experience, sales_result, leadership, network_size, availability, motivation, referral_code, fit_answers } = parsed.data;

  await ensureSchema();

  const fitResult = computeFitResult(fit_answers as FitAnswers);
  const motivationScore = deriveMotivationScore(motivation);

  const breakdown = computeBreakdown({
    sales_experience,
    sales_result,
    leadership,
    network_size,
    availability,
    motivation: motivationScore,
    fitScore: fitResult.fitScore,
  });
  const totalScore = breakdown.total;

  // Demo mode: never persist — return a realistic mock success instead.
  if (isDemoMode()) {
    return NextResponse.json(
      {
        id: 0,
        score: totalScore,
        fitScore: fitResult.fitScore,
        message: "با موفقیت ثبت شد",
      },
      { status: 201 },
    );
  }

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
    [
      full_name,
      phone,
      city || null,
      JSON.stringify({ sales_experience, sales_result, leadership }),
      String(network_size),
      String(availability),
      motivation || null,
      referral_code || null,
    ]
  );

  const applicantId = Number(result.lastInsertRowid);

  await executeInsert(
    "INSERT INTO fit_assessment_results (applicant_id, answers_json, summary) VALUES (?, ?, ?)",
    [applicantId, JSON.stringify(fit_answers), fitResult.summary]
  );

  await executeUpdate("UPDATE applicants SET score = ? WHERE id = ?", [totalScore, applicantId]);

  let notified = false;
  try {
    notified = await notifyManagerOnTelegram({
      fullName: full_name,
      phone,
      score: totalScore,
      scoreBreakdown: breakdown,
      fitResult,
      referralAgentName,
    });
    if (notified) {
      await executeUpdate("UPDATE applicants SET telegram_notified_at = datetime('now') WHERE id = ?", [applicantId]);
    } else {
      console.error("[applications] telegram notification not sent — manager will not be alerted");
    }
  } catch (err) {
    console.error("[applications] telegram notification failed:", err);
  }

  return NextResponse.json(
    {
      id: applicantId,
      score: totalScore,
      fitScore: fitResult.fitScore,
      telegramNotified: notified,
      message: notified ? "با موفقیت ثبت شد" : "ثبت شد، اما ارسال پیام تلگرام ممکن نشد",
    },
    { status: 201 },
  );
}
