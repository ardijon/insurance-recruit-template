import { NextRequest, NextResponse } from "next/server";
import { selectOne, ensureSchema } from "@/lib/db";
import { checkPublicRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const rlKey = getRateLimitKey(_request);
  if (!(await checkPublicRateLimit(rlKey, 10))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  await ensureSchema();

  const row = await selectOne(
    "SELECT id, agent_name as agentName, code FROM referral_links WHERE code = ?",
    [code]
  ) as { id: number; agentName: string; code: string } | undefined;

  if (!row) {
    return NextResponse.json(
      { error: "Referral code not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(row);
}
