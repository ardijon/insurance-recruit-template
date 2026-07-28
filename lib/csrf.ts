import { cookies } from "next/headers";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomUUID();
  return token;
}

export async function verifyCsrf(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  const headerToken = request.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  if (cookieToken !== headerToken) return false;

  return true;
}

export { CSRF_COOKIE, CSRF_HEADER };
