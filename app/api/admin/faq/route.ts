import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidateHome } from "@/lib/revalidate";
import { selectAll, executeInsert, executeUpdate, updateSortOrders, ensureSchema } from "@/lib/db";
import { isDemoMode, getDemoFaqItems } from "@/lib/demo";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    if (isDemoMode()) {
      return NextResponse.json(getDemoFaqItems());
    }
    await ensureSchema();
    const rows = await selectAll(
      "SELECT id, question, answer, sort_order FROM faq_items ORDER BY sort_order"
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "خطا در خواندن سوالات متداول" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { question?: string; answer?: string; sort_order?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.question || !body.answer) {
    return NextResponse.json({ error: "question and answer are required" }, { status: 422 });
  }

  if (body.question.length > 500) {
    return NextResponse.json({ error: "question must be 500 characters or less" }, { status: 422 });
  }
  if (body.answer.length > 5000) {
    return NextResponse.json({ error: "answer must be 5000 characters or less" }, { status: 422 });
  }

  await ensureSchema();
  const result = await executeInsert(
    "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
    [body.question, body.answer, body.sort_order ?? 0]
  );
  revalidateHome();
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { id?: number; question?: string; answer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.id === undefined || body.id === null) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  try {
    await ensureSchema();

    const FIELDS = ["question", "answer"] as const;
    const updates: string[] = [];
    const params: (string | number)[] = [];
    for (const field of FIELDS) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(body[field]);
      }
    }
    if (updates.length === 0) {
      return NextResponse.json({ error: "no fields to update" }, { status: 422 });
    }
    params.push(body.id);
    await executeUpdate(`UPDATE faq_items SET ${updates.join(", ")} WHERE id = ?`, params);

    revalidateHome();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در بروزرسانی" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { orders?: { id: number; sort_order: number }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.orders || !Array.isArray(body.orders)) {
    return NextResponse.json({ error: "orders array is required" }, { status: 422 });
  }

  try {
    await ensureSchema();
    await updateSortOrders("faq_items", body.orders);
    revalidateHome();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در بروزرسانی ترتیب" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  try {
    await ensureSchema();
    const result = await executeUpdate("DELETE FROM faq_items WHERE id = ?", [Number(id)]);
    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "item not found" }, { status: 404 });
    }
    revalidateHome();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}
