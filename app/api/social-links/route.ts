import { NextResponse } from "next/server";
import { selectOne, ensureSchema } from "@/lib/db";

const SOCIAL_KEYS = ["SOCIAL_TELEGRAM", "SOCIAL_WHATSAPP", "SOCIAL_INSTAGRAM"] as const;

export async function GET() {
  try {
    await ensureSchema();
    const result: Record<string, string> = {};
    for (const key of SOCIAL_KEYS) {
      const row = await selectOne("SELECT value FROM settings WHERE key = ?", [key]);
      result[key] = row ? (row.value as string) : "";
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ SOCIAL_TELEGRAM: "", SOCIAL_WHATSAPP: "", SOCIAL_INSTAGRAM: "" });
  }
}
