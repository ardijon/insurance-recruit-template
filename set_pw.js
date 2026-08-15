const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");
const db = new DatabaseSync("data/app.db");

(async () => {
  const hash = await bcrypt.hash("testpass123", 10);
  db.prepare("INSERT INTO settings (key, value, updated_at) VALUES ('admin_password_hash', ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(hash);
  console.log("set testpass123, hash:", hash.slice(0, 20));

  const row = db.prepare("SELECT value FROM settings WHERE key='admin_password_hash'").get();
  const ok = await bcrypt.compare("testpass123", row.value);
  console.log("verify testpass123:", ok);
})();
