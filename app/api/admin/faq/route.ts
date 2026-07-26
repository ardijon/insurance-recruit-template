import { NextRequest, NextResponse } from "next/server";
import { selectAll, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const rows = await selectAll(
    "SELECT id, question, answer, sort_order FROM faq_items ORDER BY sort_order"
  );
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  let body: { question?: string; answer?: string; sort_order?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.question || !body.answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 422 });
  }

  await ensureSchema();
  const result = await executeInsert(
    "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
    [body.question, body.answer, body.sort_order ?? 0]
  );
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  let body: { id?: number; question?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  await ensureSchema();

  if (body.question !== undefined && body.answer !== undefined) {
    await executeUpdate("UPDATE faq_items SET question = ?, answer = ? WHERE id = ?", [body.question, body.answer, body.id]);
  } else if (body.question !== undefined) {
    await executeUpdate("UPDATE faq_items SET question = ? WHERE id = ?", [body.question, body.id]);
  } else if (body.answer !== undefined) {
    await executeUpdate("UPDATE faq_items SET answer = ? WHERE id = ?", [body.answer, body.id]);
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
    await executeUpdate("UPDATE faq_items SET sort_order = ? WHERE id = ?", [sort_order, id]);
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
  await executeUpdate("DELETE FROM faq_items WHERE id = ?", [Number(id)]);
  return NextResponse.json({ success: true });
}
