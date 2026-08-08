import { NextRequest, NextResponse } from "next/server";
import { executeInsert, ensureSchema } from "@/lib/db";
import { checkPublicRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rlKey = getRateLimitKey(request.headers);
  if (!checkPublicRateLimit(rlKey, 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: { agent_name?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.agent_name?.trim() || !body.code?.trim()) {
    return NextResponse.json(
      { error: "agent_name and code are required" },
      { status: 422 },
    );
  }

  await ensureSchema();

  try {
    await executeInsert(
      "INSERT INTO referral_links (agent_name, code) VALUES (?, ?)",
      [body.agent_name.trim(), body.code.trim()]
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
    { message: "لینک معرف ساخته شد", code: body.code.trim() },
    { status: 201 },
  );
}
