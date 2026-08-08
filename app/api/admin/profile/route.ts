import { NextRequest, NextResponse } from "next/server";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";

export async function GET() {
  try {
    await ensureSchema();
    const row = await selectOne(
      "SELECT * FROM manager_profile WHERE id = 1"
    ) as
      | {
          id: number;
          name: string;
          title: string;
          position_code: string;
          position_start_date: string;
          bio: string;
          achievements: string;
          current_agent_count: number;
          growth_agents_6m: number | null;
          growth_agents_1y: number | null;
          growth_agents_2y: number | null;
          growth_policies_6m: number | null;
          growth_policies_1y: number | null;
          growth_policies_2y: number | null;
          photo_url: string;
          updated_at: string;
        }
      | undefined;

    return NextResponse.json(
      row
        ? {
            name: row.name,
            title: row.title,
            position_code: row.position_code,
            position_start_date: row.position_start_date,
            bio: row.bio,
            achievements: row.achievements,
            current_agent_count: row.current_agent_count,
            growth_agents_6m: row.growth_agents_6m,
            growth_agents_1y: row.growth_agents_1y,
            growth_agents_2y: row.growth_agents_2y,
            growth_policies_6m: row.growth_policies_6m,
            growth_policies_1y: row.growth_policies_1y,
            growth_policies_2y: row.growth_policies_2y,
            photo_url: row.photo_url,
          }
        : {
            name: "",
            title: "",
            position_code: "",
            position_start_date: "",
            bio: "",
            achievements: "",
            current_agent_count: 0,
            growth_agents_6m: null,
            growth_agents_1y: null,
            growth_agents_2y: null,
            growth_policies_6m: null,
            growth_policies_1y: null,
            growth_policies_2y: null,
            photo_url: "",
          },
    );
  } catch {
    return NextResponse.json({ error: "خطا در خواندن پروفایل" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  let body: {
    name?: string;
    title?: string;
    position_code?: string;
    position_start_date?: string;
    bio?: string;
    achievements?: string;
    current_agent_count?: number;
    growth_agents_6m?: number | null;
    growth_agents_1y?: number | null;
    growth_agents_2y?: number | null;
    growth_policies_6m?: number | null;
    growth_policies_1y?: number | null;
    growth_policies_2y?: number | null;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await ensureSchema();

  if (body.name !== undefined && body.name.length > 100) {
    return NextResponse.json({ error: "name must be 100 characters or less" }, { status: 422 });
  }
  if (body.title !== undefined && body.title.length > 100) {
    return NextResponse.json({ error: "title must be 100 characters or less" }, { status: 422 });
  }
  if (body.bio !== undefined && body.bio.length > 2000) {
    return NextResponse.json({ error: "bio must be 2000 characters or less" }, { status: 422 });
  }
  if (body.achievements !== undefined && body.achievements.length > 2000) {
    return NextResponse.json({ error: "achievements must be 2000 characters or less" }, { status: 422 });
  }

  await executeUpdate(
    `UPDATE manager_profile SET
      name = COALESCE(?, name),
      title = COALESCE(?, title),
      position_code = COALESCE(?, position_code),
      position_start_date = COALESCE(?, position_start_date),
      bio = COALESCE(?, bio),
      achievements = COALESCE(?, achievements),
      current_agent_count = COALESCE(?, current_agent_count),
      growth_agents_6m = ?,
      growth_agents_1y = ?,
      growth_agents_2y = ?,
      growth_policies_6m = ?,
      growth_policies_1y = ?,
      growth_policies_2y = ?,
      updated_at = datetime('now')
    WHERE id = 1`,
    [
      body.name ?? null,
      body.title ?? null,
      body.position_code ?? null,
      body.position_start_date ?? null,
      body.bio ?? null,
      body.achievements ?? null,
      body.current_agent_count ?? null,
      body.growth_agents_6m ?? null,
      body.growth_agents_1y ?? null,
      body.growth_agents_2y ?? null,
      body.growth_policies_6m ?? null,
      body.growth_policies_1y ?? null,
      body.growth_policies_2y ?? null,
    ]
  );

  return NextResponse.json({ success: true });
}
