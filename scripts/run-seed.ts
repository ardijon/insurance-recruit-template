// scripts/run-seed.ts
// Runner for seed-screenshots.sql
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "app.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = OFF");

// Apply schema first
const schema = fs.readFileSync(path.join(process.cwd(), "lib", "schema.sql"), "utf-8");
db.exec(schema);

// Read and execute seed SQL
const seedSql = fs.readFileSync(path.join(process.cwd(), "scripts", "seed-screenshots.sql"), "utf-8");

// Remove comment lines
const cleanSql = seedSql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");

// Split by semicolons, but handle string literals properly
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];

    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      current += ch;
      escaped = true;
      continue;
    }

    if (ch === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      current += ch;
      continue;
    }

    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += ch;
      continue;
    }

    if (ch === ";" && !inSingleQuote && !inDoubleQuote) {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = "";
      continue;
    }

    current += ch;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }

  return statements;
}

const statements = splitSqlStatements(cleanSql);

let count = 0;
let errors = 0;
for (const stmt of statements) {
  try {
    db.exec(stmt);
    count++;
  } catch (e: any) {
    errors++;
    console.error(`Error: ${e.message}`);
    console.error(`Statement: ${stmt.substring(0, 120)}...`);
  }
}

db.exec("PRAGMA foreign_keys = ON");

console.log(`\nExecuted ${count} statements successfully (${errors} errors).`);
console.log("Database seeded at:", DB_PATH);

// Verify counts
const tables = [
  "manager_profile",
  "success_wall_entries",
  "growth_path_stages",
  "faq_items",
  "referral_links",
  "applicants",
  "fit_assessment_results",
  "settings",
  "success_visual_story",
];

console.log("\nTable counts:");
for (const table of tables) {
  const row = db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number };
  console.log(`  ${table}: ${row.c}`);
}

// Status breakdown
const statusRows = db.prepare("SELECT status, COUNT(*) as c FROM applicants GROUP BY status").all() as { status: string; c: number }[];
console.log("\nApplicant status breakdown:");
for (const row of statusRows) {
  console.log(`  ${row.status}: ${row.c}`);
}

// Score breakdown
const scoreRows = db.prepare(`
  SELECT
    CASE
      WHEN score >= 70 THEN 'high (70+)'
      WHEN score >= 40 THEN 'medium (40-69)'
      ELSE 'low (<40)'
    END as range,
    COUNT(*) as c
  FROM applicants
  GROUP BY range
`).all() as { range: string; c: number }[];
console.log("\nScore breakdown:");
for (const row of scoreRows) {
  console.log(`  ${row.range}: ${row.c}`);
}
