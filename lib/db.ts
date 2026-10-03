// lib/db.ts
//
// Triple-mode database layer (priority order):
//   1. Cloudflare D1 (Workers production) — via getCloudflareContext().env.DB
//   2. Turso (cloud SQLite) — if TURSO_DATABASE_URL is set
//   3. Local node:sqlite — self-hosted / dev fallback
//
// edge.md §2: each deployment has its own independent database.

import type { Client } from "@libsql/client";
import { SCHEMA_STATEMENTS } from "./schema";

// ---------------------------------------------------------------------------
// D1 client (Cloudflare Workers production)
// ---------------------------------------------------------------------------

interface D1PreparedStatement {
  bind(...args: unknown[]): D1PreparedStatement;
  all(): Promise<{ results?: Record<string, unknown>[] }>;
  run(): Promise<{ meta?: { changes?: number; last_row_id?: number } }>;
}

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

async function getD1(): Promise<D1Database | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext({ async: false });
    const db = (ctx.env as Record<string, unknown>).DB as D1Database | undefined;
    return db ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Turso client (cloud mode) — dynamic import to avoid native binary install
// ---------------------------------------------------------------------------

type TursoClient = Client;
let tursoClient: TursoClient | null = null;

async function getTursoClient(): Promise<TursoClient> {
  if (!tursoClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    const { createClient } = await import("@libsql/client");
    tursoClient = createClient({ url, authToken: authToken ?? undefined });
  }
  return tursoClient;
}

// ---------------------------------------------------------------------------
// Local SQLite client (self-hosted mode)
// ---------------------------------------------------------------------------

// Local SQLite types — matches the subset of node:sqlite DatabaseSync API we use
interface LocalStatement {
  all(...args: unknown[]): unknown[];
  run(...args: unknown[]): { changes: number | bigint; lastInsertRowid: number | bigint };
}

interface LocalDatabase {
  exec(sql: string): void;
  prepare(sql: string): LocalStatement;
}

type LocalDatabaseConstructor = new (path: string) => LocalDatabase;

// Dynamic import for node:sqlite — only loaded in local (non-Turso) mode
async function loadLocalDb(): Promise<LocalDatabaseConstructor> {
  const { DatabaseSync } = await import("node:sqlite");
  return DatabaseSync;
}

declare global {
  var __db: LocalDatabase | undefined;
  var __dbPromise: Promise<LocalDatabase> | undefined;
}

async function createLocalConnection(): Promise<LocalDatabase> {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DATA_DIR, "app.db");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const DatabaseSync = await loadLocalDb();
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");

  return db;
}

async function getLocalDb(): Promise<LocalDatabase> {
  if (global.__db) return global.__db;
  if (global.__dbPromise) return global.__dbPromise;
  global.__dbPromise = createLocalConnection().then((db) => {
    global.__db = db;
    global.__dbPromise = undefined;
    return db;
  });
  return global.__dbPromise;
}

// ---------------------------------------------------------------------------
// Unified async API
// ---------------------------------------------------------------------------

export type DbRow = Record<string, unknown>;

export interface QueryResult {
  rows: DbRow[];
  rowsAffected: number;
  lastInsertRowid: number | bigint;
}

function isTurso(): boolean {
  return !!process.env.TURSO_DATABASE_URL;
}

function normalizeArgs(args?: (string | number | null)[]): unknown[] {
  return (args ?? []).map((a) => a);
}

async function runD1(
  sql: string,
  args?: (string | number | null)[]
): Promise<QueryResult> {
  const db = await getD1();
  if (!db) throw new Error("D1 binding not available");
  const upperSql = sql.trim().toUpperCase();
  const stmt = db.prepare(sql).bind(...normalizeArgs(args));
  if (upperSql.startsWith("SELECT") || upperSql.startsWith("PRAGMA")) {
    const { results } = await stmt.all();
    return { rows: (results ?? []) as DbRow[], rowsAffected: 0, lastInsertRowid: 0 };
  }
  const { meta } = await stmt.run();
  return {
    rows: [],
    rowsAffected: meta?.changes ?? 0,
    lastInsertRowid: meta?.last_row_id ?? 0,
  };
}

export async function execute(
  sql: string,
  args?: (string | number | null)[]
): Promise<QueryResult> {
  if (await getD1()) {
    return runD1(sql, args);
  }
  if (isTurso()) {
    const client = await getTursoClient();
    const result = await client.execute({
      sql,
      args: args ?? [],
    });
    return {
      rows: result.rows.map((r: Record<string, unknown>) => r as unknown as DbRow),
      rowsAffected: Number(result.rowsAffected),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  // Local SQLite (sync wrapped in async)
  const db = await getLocalDb();
  const stmt = db.prepare(sql);
  const upperSql = sql.trim().toUpperCase();

  if (upperSql.startsWith("INSERT")) {
    // Redirect to executeInsert for INSERT statements
    return executeInsert(sql, args);
  }

  if (upperSql.startsWith("UPDATE") || upperSql.startsWith("DELETE")) {
    const runResult = args ? stmt.run(...args) : stmt.run();
    return { rows: [], rowsAffected: Number(runResult.changes), lastInsertRowid: runResult.lastInsertRowid };
  }

  const allRows = args ? (stmt.all(...args) as DbRow[]) : (stmt.all() as DbRow[]);
  return { rows: allRows, rowsAffected: 0, lastInsertRowid: 0 };
}

export async function executeInsert(
  sql: string,
  args?: (string | number | null)[]
): Promise<QueryResult> {
  if (await getD1()) {
    return runD1(sql, args);
  }
  if (isTurso()) {
    const client = await getTursoClient();
    const result = await client.execute({
      sql,
      args: args ?? [],
    });
    return {
      rows: result.rows.map((r: Record<string, unknown>) => r as unknown as DbRow),
      rowsAffected: Number(result.rowsAffected),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  // Local SQLite
  const db = await getLocalDb();
  const stmt = db.prepare(sql);
  const runResult = args ? stmt.run(...args) : stmt.run();
  return {
    rows: [],
    rowsAffected: Number(runResult.changes),
    lastInsertRowid: runResult.lastInsertRowid,
  };
}

export async function executeUpdate(
  sql: string,
  args?: (string | number | null)[]
): Promise<QueryResult> {
  if (await getD1()) {
    return runD1(sql, args);
  }
  if (isTurso()) {
    const client = await getTursoClient();
    const result = await client.execute({
      sql,
      args: args ?? [],
    });
    return {
      rows: result.rows.map((r: Record<string, unknown>) => r as unknown as DbRow),
      rowsAffected: Number(result.rowsAffected),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  // Local SQLite
  const db = await getLocalDb();
  const stmt = db.prepare(sql);
  const runResult = args ? stmt.run(...args) : stmt.run();
  return {
    rows: [],
    rowsAffected: Number(runResult.changes),
    lastInsertRowid: runResult.lastInsertRowid,
  };
}

export async function selectOne(
  sql: string,
  args?: (string | number | null)[]
): Promise<DbRow | undefined> {
  const result = await execute(sql, args);
  return result.rows[0];
}

export async function selectAll(
  sql: string,
  args?: (string | number | null)[]
): Promise<DbRow[]> {
  const result = await execute(sql, args);
  return result.rows;
}

// Reorder helper: persists {id, sort_order}[] in ONE atomic UPDATE (CASE-based)
// instead of one query per row. `table` must be a hard-coded literal from our
// own code — never user input.
export async function updateSortOrders(
  table: string,
  orders: { id: number; sort_order: number }[]
): Promise<void> {
  const rows = orders
    .map((o) => ({ id: Number(o.id), order: Number(o.sort_order) }))
    .filter((o) => Number.isInteger(o.id) && Number.isInteger(o.order));
  if (rows.length === 0) return;
  const cases = rows.map(() => "WHEN ? THEN ?").join(" ");
  const placeholders = rows.map(() => "?").join(",");
  const args: (string | number | null)[] = [];
  for (const r of rows) args.push(r.id, r.order);
  await executeUpdate(
    `UPDATE ${table} SET sort_order = CASE id ${cases} END WHERE id IN (${placeholders})`,
    [...args, ...rows.map((r) => r.id)]
  );
}

// ---------------------------------------------------------------------------
// Schema & migration (runs once on first call)
// ---------------------------------------------------------------------------

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  schemaReady = true;

  const d1 = await getD1();
  const schemaAsScript = `${SCHEMA_STATEMENTS.filter((s) => !s.startsWith("INSERT INTO")).join(";\n")};`;
  if (d1) {
    // D1: same SQLite dialect as Turso/local. Statements run one at a time
    // because D1 batch() rejects mixed read/write batches.
    for (const sql of SCHEMA_STATEMENTS) {
      await runD1(sql);
    }
    await migrateDbD1();
  } else if (isTurso()) {
    const client = await getTursoClient();
    await client.executeMultiple(schemaAsScript);

    // Run migrations
    await migrateDbTurso(client);
  } else {
    // Local SQLite — same single-DDL-source script as Turso/D1, then migrations
    // (keeps lib/schema.sql only for build/seed scripts that read the file).
    const db = await getLocalDb();
    db.exec(schemaAsScript);
    migrateDbLocal(db);
  }

  // Seed default sample data ONLY in demo/test mode. Production deployments
  // must start completely empty so each customer populates their own data.
  if (process.env.DEMO_MODE === "true" || process.env.SEED_SAMPLE_DATA === "true") {
    const { seedIfEmpty } = await import("@/lib/seed");
    await seedIfEmpty();
  }
}

async function migrateDbTurso(client: Client): Promise<void> {
  const ensureCol = async (table: string, col: string, typedef: string) => {
    const result = await client.execute({
      sql: `PRAGMA table_info(${table})`,
      args: [],
    });
    const colNames = result.rows.map((r: Record<string, unknown>) => r.name as string);
    if (!colNames.includes(col)) {
      await client.execute({
        sql: `ALTER TABLE ${table} ADD COLUMN ${col} ${typedef}`,
        args: [],
      });
    }
  };

  await ensureCol("applicants", "appointment_date", "TEXT");
  await ensureCol("applicants", "appointment_jalali", "TEXT");
  await ensureCol("applicants", "appointment_time", "TEXT");
  await ensureCol("applicants", "status", "TEXT NOT NULL DEFAULT 'new'");
  await ensureCol("manager_profile", "site_theme", "TEXT NOT NULL DEFAULT 'warm'");
  await ensureCol("manager_profile", "photo_url", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("manager_profile", "position_code", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("manager_profile", "position_start_date", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("manager_profile", "title", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("success_wall_entries", "images_json", "TEXT NOT NULL DEFAULT '[]'");
  await ensureCol("manager_profile", "growth_agents_6m", "INTEGER");
  await ensureCol("manager_profile", "growth_agents_1y", "INTEGER");
  await ensureCol("manager_profile", "growth_agents_2y", "INTEGER");
  await ensureCol("manager_profile", "growth_policies_6m", "INTEGER");
  await ensureCol("manager_profile", "growth_policies_1y", "INTEGER");
  await ensureCol("manager_profile", "growth_policies_2y", "INTEGER");

  // Ensure settings table exists (added for Telegram integration)
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    args: [],
  });

  // Singleton rows for fresh production DBs (see D1 branch above).
  for (const seed of SCHEMA_STATEMENTS.filter((s) => s.startsWith("INSERT INTO"))) {
    await client.execute({ sql: seed, args: [] });
  }

  // Uploads table for D1-backed image storage (no R2/filesystem)
  await client.execute({
    sql: `CREATE TABLE IF NOT EXISTS uploads (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      mime TEXT NOT NULL DEFAULT 'image/jpeg',
      size INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    args: [],
  });
}

async function migrateDbD1(): Promise<void> {
  const ensureCol = async (table: string, col: string, typedef: string) => {
    const result = await runD1(`PRAGMA table_info(${table})`);
    const colNames = result.rows.map((r) => r.name as string);
    if (!colNames.includes(col)) {
      await runD1(`ALTER TABLE ${table} ADD COLUMN ${col} ${typedef}`);
    }
  };

  await ensureCol("applicants", "appointment_date", "TEXT");
  await ensureCol("applicants", "appointment_jalali", "TEXT");
  await ensureCol("applicants", "appointment_time", "TEXT");
  await ensureCol("applicants", "status", "TEXT NOT NULL DEFAULT 'new'");
  await ensureCol("manager_profile", "site_theme", "TEXT NOT NULL DEFAULT 'warm'");
  await ensureCol("manager_profile", "photo_url", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("manager_profile", "position_code", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("manager_profile", "position_start_date", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("manager_profile", "title", "TEXT NOT NULL DEFAULT ''");
  await ensureCol("success_wall_entries", "images_json", "TEXT NOT NULL DEFAULT '[]'");
  await ensureCol("manager_profile", "growth_agents_6m", "INTEGER");
  await ensureCol("manager_profile", "growth_agents_1y", "INTEGER");
  await ensureCol("manager_profile", "growth_agents_2y", "INTEGER");
  await ensureCol("manager_profile", "growth_policies_6m", "INTEGER");
  await ensureCol("manager_profile", "growth_policies_1y", "INTEGER");
  await ensureCol("manager_profile", "growth_policies_2y", "INTEGER");

  // Singleton rows for fresh production DBs (see D1 branch above).
  await runD1(`INSERT INTO manager_profile (id) VALUES (1) ON CONFLICT(id) DO NOTHING`);
  await runD1(`INSERT INTO success_visual_story (id) VALUES (1) ON CONFLICT(id) DO NOTHING`);

  // Uploads table for D1-backed image storage (no R2/filesystem)
  await runD1(`CREATE TABLE IF NOT EXISTS uploads (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    mime TEXT NOT NULL DEFAULT 'image/jpeg',
    size INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
}

function migrateDbLocal(db: LocalDatabase): void {
  let cols = db
    .prepare("PRAGMA table_info(applicants)")
    .all() as { name: string }[];
  let colNames = cols.map((c) => c.name);

  if (!colNames.includes("appointment_date")) {
    db.exec("ALTER TABLE applicants ADD COLUMN appointment_date TEXT");
  }
  if (!colNames.includes("appointment_jalali")) {
    db.exec("ALTER TABLE applicants ADD COLUMN appointment_jalali TEXT");
  }
  if (!colNames.includes("appointment_time")) {
    db.exec("ALTER TABLE applicants ADD COLUMN appointment_time TEXT");
  }
  if (!colNames.includes("status")) {
    db.exec("ALTER TABLE applicants ADD COLUMN status TEXT NOT NULL DEFAULT 'new'");
  }

  cols = db
    .prepare("PRAGMA table_info(manager_profile)")
    .all() as { name: string }[];
  colNames = cols.map((c) => c.name);

  if (!colNames.includes("site_theme")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN site_theme TEXT NOT NULL DEFAULT 'warm'");
  }
  if (!colNames.includes("photo_url")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN photo_url TEXT NOT NULL DEFAULT ''");
  }
  if (!colNames.includes("position_code")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN position_code TEXT NOT NULL DEFAULT ''");
  }
  if (!colNames.includes("position_start_date")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN position_start_date TEXT NOT NULL DEFAULT ''");
  }
  if (!colNames.includes("title")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN title TEXT NOT NULL DEFAULT ''");
  }

  cols = db
    .prepare("PRAGMA table_info(success_wall_entries)")
    .all() as { name: string }[];
  colNames = cols.map((c) => c.name);
  if (!colNames.includes("images_json")) {
    db.exec("ALTER TABLE success_wall_entries ADD COLUMN images_json TEXT NOT NULL DEFAULT '[]'");
  }

  cols = db
    .prepare("PRAGMA table_info(manager_profile)")
    .all() as { name: string }[];
  colNames = cols.map((c) => c.name);

  if (!colNames.includes("growth_agents_6m")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN growth_agents_6m INTEGER");
  }
  if (!colNames.includes("growth_agents_1y")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN growth_agents_1y INTEGER");
  }
  if (!colNames.includes("growth_agents_2y")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN growth_agents_2y INTEGER");
  }
  if (!colNames.includes("growth_policies_6m")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN growth_policies_6m INTEGER");
  }
  if (!colNames.includes("growth_policies_1y")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN growth_policies_1y INTEGER");
  }
  if (!colNames.includes("growth_policies_2y")) {
    db.exec("ALTER TABLE manager_profile ADD COLUMN growth_policies_2y INTEGER");
  }

  // Ensure settings table exists
  db.exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  // Singleton rows for fresh production DBs (see D1 branch above).
  db.exec(`INSERT INTO manager_profile (id) VALUES (1) ON CONFLICT(id) DO NOTHING`);
  db.exec(`INSERT INTO success_visual_story (id) VALUES (1) ON CONFLICT(id) DO NOTHING`);

  // Uploads table for D1-backed image storage (no R2/filesystem)
  db.exec(`CREATE TABLE IF NOT EXISTS uploads (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    mime TEXT NOT NULL DEFAULT 'image/jpeg',
    size INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);
}
