// lib/db.ts
//
// Dual-mode database layer:
//   - If TURSO_URL is set → uses Turso (cloud SQLite) for Vercel/serverless
//   - Otherwise → falls back to local node:sqlite for self-hosted deployments
//
// edge.md §2: each deployment has its own independent database.

import { createClient, type Client } from "@libsql/client";

// ---------------------------------------------------------------------------
// Turso client (cloud mode)
// ---------------------------------------------------------------------------

let tursoClient: Client | null = null;

function getTursoClient(): Client {
  if (!tursoClient) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (!url) throw new Error("TURSO_DATABASE_URL is not set");
    tursoClient = createClient({ url, authToken: authToken ?? undefined });
  }
  return tursoClient;
}

// ---------------------------------------------------------------------------
// Local SQLite client (self-hosted mode)
// ---------------------------------------------------------------------------

import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

declare global {
  var __db: DatabaseSync | undefined;
}

function createLocalConnection(): DatabaseSync {
  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DATA_DIR, "app.db");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL");

  const schema = fs.readFileSync(
    path.join(process.cwd(), "lib", "schema.sql"),
    "utf-8"
  );
  db.exec(schema);

  return db;
}

function getLocalDb(): DatabaseSync {
  if (!global.__db) {
    global.__db = createLocalConnection();
  }
  return global.__db;
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

export async function execute(
  sql: string,
  args?: (string | number | null)[]
): Promise<QueryResult> {
  if (isTurso()) {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: args ?? [],
    });
    return {
      rows: result.rows.map((r) => r as unknown as DbRow),
      rowsAffected: Number(result.rowsAffected),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  // Local SQLite (sync wrapped in async)
  const db = getLocalDb();
  const stmt = db.prepare(sql);
  const allRows = args ? (stmt.all(...args) as DbRow[]) : (stmt.all() as DbRow[]);
  // For INSERT, get lastInsertRowid from the stmt
  let lastId: number | bigint = 0;
  let affected = 0;
  if (sql.trim().toUpperCase().startsWith("INSERT")) {
    // We need run() for INSERT — handle separately
    throw new Error("Use executeInsert for INSERT statements in local mode");
  }
  if (sql.trim().toUpperCase().startsWith("UPDATE") || sql.trim().toUpperCase().startsWith("DELETE")) {
    const runResult = args ? stmt.run(...args) : stmt.run();
    affected = Number(runResult.changes);
    lastId = runResult.lastInsertRowid;
  }
  return { rows: allRows, rowsAffected: affected, lastInsertRowid: lastId };
}

export async function executeInsert(
  sql: string,
  args?: (string | number | null)[]
): Promise<QueryResult> {
  if (isTurso()) {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: args ?? [],
    });
    return {
      rows: result.rows.map((r) => r as unknown as DbRow),
      rowsAffected: Number(result.rowsAffected),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  // Local SQLite
  const db = getLocalDb();
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
  if (isTurso()) {
    const client = getTursoClient();
    const result = await client.execute({
      sql,
      args: args ?? [],
    });
    return {
      rows: result.rows.map((r) => r as unknown as DbRow),
      rowsAffected: Number(result.rowsAffected),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }

  // Local SQLite
  const db = getLocalDb();
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

// ---------------------------------------------------------------------------
// Schema & migration (runs once on first call)
// ---------------------------------------------------------------------------

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  schemaReady = true;

  if (isTurso()) {
    const client = getTursoClient();
    const schema = `
      CREATE TABLE IF NOT EXISTS manager_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        position_code TEXT NOT NULL DEFAULT '',
        position_start_date TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        achievements TEXT NOT NULL DEFAULT '',
        current_agent_count INTEGER NOT NULL DEFAULT 0,
        growth_agents_6m INTEGER,
        growth_agents_1y INTEGER,
        growth_agents_2y INTEGER,
        growth_policies_6m INTEGER,
        growth_policies_1y INTEGER,
        growth_policies_2y INTEGER,
        site_theme TEXT NOT NULL DEFAULT 'warm',
        photo_url TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS success_wall_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        quote TEXT NOT NULL,
        images_json TEXT NOT NULL DEFAULT '[]',
        permission_granted INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS growth_path_stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sort_order INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS faq_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS referral_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS applicants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT,
        sales_background TEXT,
        network_size TEXT,
        availability TEXT,
        motivation TEXT,
        score INTEGER,
        referral_code TEXT REFERENCES referral_links(code),
        appointment_date TEXT,
        appointment_time TEXT,
        telegram_notified_at TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS fit_assessment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicant_id INTEGER NOT NULL REFERENCES applicants(id),
        answers_json TEXT NOT NULL,
        summary TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS success_visual_story (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        images_json TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `;
    await client.executeMultiple(schema);

    // Run migrations
    await migrateDbTurso(client);
  } else {
    // Local SQLite — run schema.sql + migrations
    const db = getLocalDb();
    const schemaPath = path.join(process.cwd(), "lib", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf-8");
      db.exec(schema);
    }
    migrateDbLocal(db);
  }

  // Seed default data
  const { seedIfEmpty } = await import("@/lib/seed");
  await seedIfEmpty();
}

async function migrateDbTurso(client: Client): Promise<void> {
  const ensureCol = async (table: string, col: string, typedef: string) => {
    const result = await client.execute({
      sql: `PRAGMA table_info(${table})`,
      args: [],
    });
    const colNames = result.rows.map((r) => r.name);
    if (!colNames.includes(col)) {
      await client.execute({
        sql: `ALTER TABLE ${table} ADD COLUMN ${col} ${typedef}`,
        args: [],
      });
    }
  };

  await ensureCol("applicants", "appointment_date", "TEXT");
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
}

function migrateDbLocal(db: DatabaseSync): void {
  let cols = db
    .prepare("PRAGMA table_info(applicants)")
    .all() as { name: string }[];
  let colNames = cols.map((c) => c.name);

  if (!colNames.includes("appointment_date")) {
    db.exec("ALTER TABLE applicants ADD COLUMN appointment_date TEXT");
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
}
