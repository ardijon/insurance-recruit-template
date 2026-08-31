import { NextResponse } from "next/server";
import { selectAll, ensureSchema } from "@/lib/db";

const LOCATION_KEYS = ["MAP_LAT", "MAP_LNG", "MAP_ADDRESS"] as const;

// Public location data for the home-page map section (mirrors /api/social-links pattern).
export async function GET() {
  try {
    await ensureSchema();
    const rows = await selectAll(
      `SELECT key, value FROM settings WHERE key IN (?, ?, ?)`,
      [...LOCATION_KEYS]
    );
    const result: Record<string, string> = { lat: "", lng: "", address: "" };
    for (const row of rows) {
      const key = row.key as string;
      const value = (row.value as string) ?? "";
      if (key === "MAP_LAT") result.lat = value;
      if (key === "MAP_LNG") result.lng = value;
      if (key === "MAP_ADDRESS") result.address = value;
    }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ lat: "", lng: "", address: "" });
  }
}
