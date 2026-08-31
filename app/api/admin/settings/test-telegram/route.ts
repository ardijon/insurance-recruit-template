import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { testTelegramConnection } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { token, chatId } = body as { token?: string; chatId?: string };

  if (!token || !chatId) {
    return NextResponse.json({ error: "توکن و شناسه چت الزامی است" }, { status: 422 });
  }

  const result = await testTelegramConnection(token, chatId);

  if (result.success) {
    return NextResponse.json({ message: "اتصال با موفقیت برقرار شد" });
  }

  return NextResponse.json({ error: result.error }, { status: 422 });
}
