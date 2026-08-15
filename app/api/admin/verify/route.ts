import { NextRequest, NextResponse } from "next/server";
import { verifySessionValue, SESSION_COOKIE } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // Demo mode: accept any demo session token
  if (isDemoMode() && token?.startsWith("demo.")) {
    return NextResponse.json({ authenticated: true });
  }

  if (!token || !(await verifySessionValue(token))) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
