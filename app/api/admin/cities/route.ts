import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { selectAll, ensureSchema } from "@/lib/db";
import { isDemoMode, getDemoCities } from "@/lib/demo";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (isDemoMode()) {
    return NextResponse.json(getDemoCities());
  }

  await ensureSchema();
  const rows = await selectAll(
    "SELECT DISTINCT city FROM applicants WHERE city IS NOT NULL AND city != '' ORDER BY city"
  ) as { city: string }[];
  return NextResponse.json(rows.map((r) => r.city));
}
