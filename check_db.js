const { DatabaseSync } = require("node:sqlite");
const db = new DatabaseSync("data/app.db");
try {
  const r = db.prepare("SELECT value FROM settings WHERE key='admin_password_hash'").get();
  console.log("hash set:", !!r, r ? r.value.slice(0, 20) : "");
} catch (e) {
  console.log("err", e.message);
}
