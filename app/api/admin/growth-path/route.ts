import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { selectAll, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { isDemoMode, getDemoGrowthPathStages } from "@/lib/demo";

export async function GET() {
  try {
    if (isDemoMode()) {
      return NextResponse.json(getDemoGrowthPathStages());
    }
    await ensureSchema();
    const rows = await selectAll(
      "SELECT id, title, description, sort_order FROM growth_path_stages ORDER BY sort_order"
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "خطا در خواندن مسیر رشد" }, { status: 500 });
  }
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

  if (body.title.length > 200) {
    return NextResponse.json({ error: "title must be 200 characters or less" }, { status: 422 });
  }
  if (body.description && body.description.length > 2000) {
    return NextResponse.json({ error: "description must be 2000 characters or less" }, { status: 422 });
  }

  await ensureSchema();
  const result = await executeInsert(
    "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
    [body.title, body.description ?? "", body.sort_order ?? 0]
  );
  revalidatePath("/");
  return NextResponse.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  let body: { id?: number; title?: string; description?: string };
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

    if (body.title !== undefined && body.description !== undefined) {
      await executeUpdate("UPDATE growth_path_stages SET title = ?, description = ? WHERE id = ?", [body.title, body.description, body.id]);
    } else if (body.title !== undefined) {
      await executeUpdate("UPDATE growth_path_stages SET title = ? WHERE id = ?", [body.title, body.id]);
    } else if (body.description !== undefined) {
      await executeUpdate("UPDATE growth_path_stages SET description = ? WHERE id = ?", [body.description, body.id]);
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
      await executeUpdate("UPDATE growth_path_stages SET sort_order = ? WHERE id = ?", [sort_order, id]);
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
    const result = await executeUpdate("DELETE FROM growth_path_stages WHERE id = ?", [Number(id)]);
    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "stage not found" }, { status: 404 });
    }
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}
