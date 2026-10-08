import { NextRequest, NextResponse } from "next/server";
import { selectAll, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { checkPublicRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isAdminRequest } from "@/lib/admin-guard";
import { isDemoMode } from "@/lib/demo";

const CODE_REGEX = /^[a-zA-Z0-9_-]{3,32}$/;

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isDemoMode()) {
    return NextResponse.json([]);
  }
  await ensureSchema();
  const rows = await selectAll(
    `SELECT rl.id, rl.agent_name, rl.code, rl.created_at, COUNT(a.id) AS uses
     FROM referral_links rl LEFT JOIN applicants a ON a.referral_code = rl.code
     GROUP BY rl.id ORDER BY rl.id DESC`
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  // This endpoint mutates the database, so it must be authenticated. The
  // public application form does not create referral links — only the admin
  // panel does — so require a valid admin session (demo mode allows it too).
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rlKey = getRateLimitKey(request);
  if (!(await checkPublicRateLimit(rlKey, 10))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { agent_name?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const agentName = body.agent_name?.trim() || "";
  const code = body.code?.trim() || "";

  if (!agentName || !code) {
    return NextResponse.json(
      { error: "agent_name and code are required" },
      { status: 422 },
    );
  }
  if (agentName.length > 100) {
    return NextResponse.json(
      { error: "agent_name must be 100 characters or less" },
      { status: 422 },
    );
  }
  if (!CODE_REGEX.test(code)) {
    return NextResponse.json(
      { error: "code must be 3-32 chars (letters, numbers, _ or -)" },
      { status: 422 },
    );
  }

  await ensureSchema();

  try {
    await executeInsert(
      "INSERT INTO referral_links (agent_name, code) VALUES (?, ?)",
      [agentName, code]
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("UNIQUE constraint")) {
      return NextResponse.json(
        { error: "این کد قبلاً ثبت شده است" },
        { status: 409 },
      );
    }
    throw err;
  }

  return NextResponse.json(
    { message: "لینک ارجاع ثبت شد", code },
    { status: 201 },
  );
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }
  await ensureSchema();
  const result = await executeUpdate("DELETE FROM referral_links WHERE id = ?", [Number(id)]);
  if (result.rowsAffected === 0) {
    return NextResponse.json({ error: "item not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
