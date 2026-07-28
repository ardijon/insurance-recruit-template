import { NextRequest, NextResponse } from "next/server";
import { selectAll, executeUpdate, executeInsert as execInsert, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const rows = await selectAll(
    "SELECT id, agent_name, quote, images_json, permission_granted, sort_order, created_at FROM success_wall_entries ORDER BY sort_order"
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  let body: {
    agent_name?: string;
    quote?: string;
    images_json?: string;
    permission_granted?: boolean | number;
    sort_order?: number;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.agent_name || !body.quote) {
    return NextResponse.json(
      { error: "agent_name and quote are required" },
      { status: 422 },
    );
  }

  await ensureSchema();

  const result = await execInsert(
    "INSERT INTO success_wall_entries (agent_name, quote, images_json, permission_granted, sort_order) VALUES (?, ?, ?, ?, ?)",
    [body.agent_name, body.quote, body.images_json ?? "[]", body.permission_granted ? 1 : 0, body.sort_order ?? 0]
  );

  return NextResponse.json(
    { id: Number(result.lastInsertRowid) },
    { status: 201 },
  );
}

export async function PATCH(request: NextRequest) {
  let body: { id?: number; agent_name?: string; quote?: string; images_json?: string; permission_granted?: boolean | number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await ensureSchema();

  const updates: string[] = [];
  const params: (string | number)[] = [];
  if (body.agent_name !== undefined) { updates.push("agent_name = ?"); params.push(body.agent_name); }
  if (body.quote !== undefined) { updates.push("quote = ?"); params.push(body.quote); }
  if (body.images_json !== undefined) { updates.push("images_json = ?"); params.push(body.images_json); }
  if (body.permission_granted !== undefined) { updates.push("permission_granted = ?"); params.push(body.permission_granted ? 1 : 0); }
  if (updates.length === 0) {
    return NextResponse.json({ error: "no fields to update" }, { status: 422 });
  }
  params.push(body.id);
  await executeUpdate(`UPDATE success_wall_entries SET ${updates.join(", ")} WHERE id = ?`, params);
  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  let body: { orders?: { id: number; sort_order: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.orders || !Array.isArray(body.orders)) {
    return NextResponse.json({ error: "orders array is required" }, { status: 422 });
  }

  await ensureSchema();

  for (const { id, sort_order } of body.orders) {
    await executeUpdate("UPDATE success_wall_entries SET sort_order = ? WHERE id = ?", [sort_order, id]);
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await ensureSchema();
  await executeUpdate("DELETE FROM success_wall_entries WHERE id = ?", [Number(id)]);
  return NextResponse.json({ success: true });
}
