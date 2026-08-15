import { NextRequest, NextResponse } from "next/server";
import { selectOne, selectAll, executeUpdate, ensureSchema } from "@/lib/db";
import { isDemoMode, getDemoApplicants, updateDemoApplicantStatus, scheduleDemoAppointment, deleteDemoApplicant } from "@/lib/demo";

const VALID_STATUSES = ["new", "contacted", "interviewed", "hired", "rejected"] as const;
const VALID_SORT = ["created_at", "score", "full_name", "appointment_date"] as const;
type SortField = (typeof VALID_SORT)[number];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  if (isDemoMode()) {
    const result = getDemoApplicants({
      search: searchParams.get("search")?.trim() || undefined,
      status: searchParams.get("status")?.trim() || undefined,
      city: searchParams.get("city")?.trim() || undefined,
      hasAppointment: searchParams.get("has_appointment") || undefined,
      scoreMin: searchParams.get("score_min") || undefined,
      scoreMax: searchParams.get("score_max") || undefined,
      dateFrom: searchParams.get("date_from") || undefined,
      dateTo: searchParams.get("date_to") || undefined,
      sortBy: searchParams.get("sort_by") || "created_at",
      sortOrder: searchParams.get("sort_order") || "desc",
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });
    return NextResponse.json(result);
  }

  try {
    await ensureSchema();

  const page = Math.min(10000, Math.max(1, Number(searchParams.get("page")) || 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const search = searchParams.get("search")?.trim() || "";
  const scoreMin = searchParams.get("score_min");
  const scoreMax = searchParams.get("score_max");
  const city = searchParams.get("city")?.trim() || "";
  const hasAppointment = searchParams.get("has_appointment");
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const statusParam = searchParams.get("status")?.trim() || "";
  const sortBy = (VALID_SORT.includes(searchParams.get("sort_by") as SortField) ? searchParams.get("sort_by") : "created_at") as SortField;
  const sortOrder = searchParams.get("sort_order") === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (search) {
    conditions.push("(full_name LIKE ? OR phone LIKE ? OR city LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (scoreMin) { conditions.push("score >= ?"); params.push(Number(scoreMin)); }
  if (scoreMax) { conditions.push("score <= ?"); params.push(Number(scoreMax)); }
  if (city) { conditions.push("city = ?"); params.push(city); }
  if (hasAppointment === "true") { conditions.push("appointment_date IS NOT NULL"); }
  else if (hasAppointment === "false") { conditions.push("appointment_date IS NULL"); }
  if (dateFrom) { conditions.push("date(created_at) >= date(?)"); params.push(dateFrom); }
  if (dateTo) { conditions.push("date(created_at) <= date(?)"); params.push(dateTo); }
  if (statusParam) {
    const statuses = statusParam.split(",").filter((s) => VALID_STATUSES.includes(s as (typeof VALID_STATUSES)[number]));
    if (statuses.length === 1) { conditions.push("status = ?"); params.push(statuses[0]); }
    else if (statuses.length > 1) { conditions.push(`status IN (${statuses.map(() => "?").join(",")})`); params.push(...statuses); }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const totalRow = await selectOne(
    `SELECT COUNT(*) as cnt FROM applicants ${where}`,
    params
  ) as { cnt: number };
  const total = totalRow.cnt;

  const data = await selectAll(
    `SELECT id, full_name, phone, city, sales_background, network_size,
     availability, motivation, score, referral_code,
      appointment_date, appointment_jalali, appointment_time, status, created_at
      FROM applicants ${where}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return NextResponse.json({ data, total, page, limit });
  } catch {
    return NextResponse.json({ error: "خطا در خواندن متقاضیان" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  let body: {
    id?: number;
    appointment_date?: string | null;
    appointment_jalali?: string | null;
    appointment_time?: string | null;
    status?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.id === undefined || body.id === null) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  if (isDemoMode()) {
    if (body.status !== undefined) {
      updateDemoApplicantStatus(body.id, body.status);
    }
    if (body.appointment_date !== undefined || body.appointment_time !== undefined) {
      scheduleDemoAppointment(body.id, body.appointment_date ?? "", body.appointment_jalali ?? null, body.appointment_time ?? null);
    }
    return NextResponse.json({ success: true, message: "در حالت دمو، تغییرات ذخیره نمی‌شوند" });
  }

  await ensureSchema();

  if (body.appointment_date !== undefined || body.appointment_time !== undefined) {
    await executeUpdate(
      `UPDATE applicants SET
        appointment_date = COALESCE(?, appointment_date),
        appointment_jalali = COALESCE(?, appointment_jalali),
        appointment_time = COALESCE(?, appointment_time)
       WHERE id = ?`,
      [body.appointment_date ?? null, body.appointment_jalali ?? null, body.appointment_time ?? null, body.id]
    );
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 422 });
    }
    await executeUpdate("UPDATE applicants SET status = ? WHERE id = ?", [body.status, body.id]);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 422 });
  }

  if (isDemoMode()) {
    const result = deleteDemoApplicant(Number(id));
    if (!result.success) return NextResponse.json({ error: "applicant not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "در حالت دمو، تغییرات ذخیره نمی‌شوند" });
  }

  try {
    await ensureSchema();
    await executeUpdate("DELETE FROM fit_assessment_results WHERE applicant_id = ?", [Number(id)]);
    const result = await executeUpdate("DELETE FROM applicants WHERE id = ?", [Number(id)]);
    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "applicant not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "خطا در حذف" }, { status: 500 });
  }
}
