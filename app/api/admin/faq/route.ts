import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { selectAll, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { isDemoMode, getDemoFaqItems } from "@/lib/demo";

export async function GET() {
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
  revalidatePath("/");
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
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

    if (body.question !== undefined && body.answer !== undefined) {
      await executeUpdate("UPDATE faq_items SET question = ?, answer = ? WHERE id = ?", [body.question, body.answer, body.id]);
    } else if (body.question !== undefined) {
      await executeUpdate("UPDATE faq_items SET question = ? WHERE id = ?", [body.question, body.id]);
    } else if (body.answer !== undefined) {
      await executeUpdate("UPDATE faq_items SET answer = ? WHERE id = ?", [body.answer, body.id]);
    } else {
      return NextResponse.json({ error: "no fields to update" }, { status: 422 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در بروزرسانی" }, { status: 500 });
  }
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

  try {
    await ensureSchema();
    for (const { id, sort_order } of body.orders) {
      await executeUpdate("UPDATE faq_items SET sort_order = ? WHERE id = ?", [sort_order, id]);
    }
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در بروزرسانی ترتیب" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}
