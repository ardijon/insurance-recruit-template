import { NextResponse } from "next/server";
import { selectAll, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const rows = await selectAll(
    "SELECT DISTINCT city FROM applicants WHERE city IS NOT NULL AND city != '' ORDER BY city"
  ) as { city: string }[];
  return NextResponse.json(rows.map((r) => r.city));
}
