import { NextRequest, NextResponse } from "next/server";
import { revalidateHome } from "@/lib/revalidate";
import { selectAll, executeInsert, ensureSchema } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-guard";

const LOCATION_KEYS = ["MAP_LAT", "MAP_LNG", "MAP_ADDRESS"] as const;

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    await ensureSchema();
    const rows = await selectAll(
      `SELECT key, value FROM settings WHERE key IN (?, ?, ?)`,
      [...LOCATION_KEYS]
    );
    const result: Record<string, string> = { MAP_LAT: "", MAP_LNG: "", MAP_ADDRESS: "" };
    for (const row of rows) {
      result[row.key as string] = (row.value as string) ?? "";
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "خطا در خواندن موقعیت مکانی" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { lat?: unknown; lng?: unknown; address?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const lat = body.lat === null || body.lat === "" ? null : Number(body.lat);
  const lng = body.lng === null || body.lng === "" ? null : Number(body.lng);
  const address = typeof body.address === "string" ? body.address.trim().slice(0, 300) : "";

  if (lat !== null && (!Number.isFinite(lat) || lat < -90 || lat > 90)) {
    return NextResponse.json({ error: "عرض جغرافیایی نامعتبر است" }, { status: 422 });
  }
  if (lng !== null && (!Number.isFinite(lng) || lng < -180 || lng > 180)) {
    return NextResponse.json({ error: "طول جغرافیایی نامعتبر است" }, { status: 422 });
  }
  if ((lat === null) !== (lng === null)) {
    return NextResponse.json({ error: "هر دو مختصات باید با هم تنظیم شوند" }, { status: 422 });
  }

  try {
    await ensureSchema();
    const values: Record<string, string> = {
      MAP_LAT: lat === null ? "" : String(lat),
      MAP_LNG: lng === null ? "" : String(lng),
      MAP_ADDRESS: address,
    };
    for (const key of LOCATION_KEYS) {
      await executeInsert(
        `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [key, values[key]]
      );
    }
    revalidateHome();
    return NextResponse.json({ message: "موقعیت مکانی ذخیره شد" });
  } catch {
    return NextResponse.json({ error: "خطا در ذخیره موقعیت مکانی" }, { status: 500 });
  }
}
