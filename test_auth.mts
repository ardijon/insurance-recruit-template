import { verifyPassword, isPasswordSet } from "./lib/auth";
import { ensureSchema } from "./lib/db";

await ensureSchema();
console.log("isPasswordSet:", await isPasswordSet());
console.log("verify testpass123:", await verifyPassword("testpass123"));
console.log("verify wrong:", await verifyPassword("wrong"));
