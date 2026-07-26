import { NextRequest, NextResponse } from "next/server";
import { selectAll, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const rows = await selectAll(
    "SELECT id, title, description, sort_order FROM growth_path_stages ORDER BY sort_order"
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  let body: { title?: string; description?: string; sort_order?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 422 });
  }

  await ensureSchema();
  const result = await executeInsert(
    "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
    [body.title, body.description ?? "", body.sort_order ?? 0]
  );
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  let body: { id?: number; title?: string; description?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await ensureSchema();

  if (body.title !== undefined && body.description !== undefined) {
    await executeUpdate("UPDATE growth_path_stages SET title = ?, description = ? WHERE id = ?", [body.title, body.description, body.id]);
  } else if (body.title !== undefined) {
    await executeUpdate("UPDATE growth_path_stages SET title = ? WHERE id = ?", [body.title, body.id]);
  } else if (body.description !== undefined) {
    await executeUpdate("UPDATE growth_path_stages SET description = ? WHERE id = ?", [body.description, body.id]);
  } else {
    return NextResponse.json({ error: "no fields to update" }, { status: 422 });
  }

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
    await executeUpdate("UPDATE growth_path_stages SET sort_order = ? WHERE id = ?", [sort_order, id]);
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
  await executeUpdate("DELETE FROM growth_path_stages WHERE id = ?", [Number(id)]);
  return NextResponse.json({ success: true });
}
