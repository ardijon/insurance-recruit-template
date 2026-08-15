const { verifyPassword, isPasswordSet } = require("./lib/auth.ts");
const { ensureSchema } = require("./lib/db.ts");

(async () => {
  await ensureSchema();
  console.log("isPasswordSet:", await isPasswordSet());
  console.log("verify testpass123:", await verifyPassword("testpass123"));
  console.log("verify wrong:", await verifyPassword("wrong"));
})().catch((e) => console.error(e));
