const fs = require("fs");
const http = require("http");

function req(method, path, body, cookies, csrf) {
  return new Promise((resolve, reject) => {
    const data = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (cookies) headers["Cookie"] = cookies;
    if (csrf) headers["x-csrf-token"] = csrf;
    const r = http.request({ host: "localhost", port: 3000, path, method, headers }, (res) => {
      let buf = "";
      res.on("data", (c) => (buf += c));
      res.on("end", () => resolve({ status: res.statusCode, setCookie: res.headers["set-cookie"], body: buf }));
    });
    r.on("error", reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  // 1. login (password already set to mysecret123 from prior run; if not, it sets it)
  const login = await req("POST", "/api/admin/login", { password: "testpass123" });
  console.log("LOGIN:", login.status, login.body);
  const cookie = (login.setCookie || []).map((c) => c.split(";")[0]).join("; ");
  const csrfCookie = (login.setCookie || []).find((c) => c.startsWith("csrf_token=")) || "";
  const csrf = csrfCookie.split(";")[0].split("=")[1] || "";

  // 2. create entry
  const entry = await req("POST", "/api/admin/success-wall", { agent_name: "تست عکس", quote: "تست آپلود", images_json: "[]", permission_granted: true, sort_order: 99 }, cookie, csrf);
  console.log("ENTRY:", entry.status, entry.body);
  const eid = JSON.parse(entry.body).id;

  // 3. upload image (multipart)
  const png = fs.readFileSync("test_upload.png");
  const boundary = "----testboundary123";
  const multipart =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="image"; filename="test_upload.png"\r\n` +
    `Content-Type: image/png\r\n\r\n`;
  const tail = `\r\n--${boundary}\r\nContent-Disposition: form-data; name="entry_id"\r\n\r\n${eid}\r\n--${boundary}--\r\n`;
  const payload = Buffer.concat([Buffer.from(multipart, "utf8"), png, Buffer.from(tail, "utf8")]);

  await new Promise((resolve, reject) => {
    const r = http.request(
      { host: "localhost", port: 3000, path: "/api/admin/success-wall-images", method: "POST",
        headers: { "Content-Type": `multipart/form-data; boundary=${boundary}`, "Content-Length": payload.length, Cookie: cookie, "x-csrf-token": csrf } },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => { console.log("UPLOAD:", res.statusCode, buf); resolve(); });
      }
    );
    r.on("error", reject);
    r.write(payload);
    r.end();
  });
})();
