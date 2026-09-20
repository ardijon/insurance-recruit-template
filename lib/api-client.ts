function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : "";
}

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  const isStateChanging = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isFormData = options.body instanceof FormData;

  // When body is FormData, let the browser auto-set Content-Type with the
  // correct multipart boundary — setting it manually (even via an empty
  // Headers object) strips the boundary and breaks file uploads on the server.
  if (isFormData && isStateChanging) {
    return fetch(url, {
      ...options,
      headers: { "x-csrf-token": getCsrfToken() },
    });
  }

  const headers = new Headers(options.headers);
  if (isStateChanging) {
    headers.set("x-csrf-token", getCsrfToken());
  }

  return fetch(url, { ...options, headers });
}
