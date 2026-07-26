import { NextRequest, NextResponse } from "next/server";
import { selectOne, ensureSchema } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

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
