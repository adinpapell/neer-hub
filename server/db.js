/**
 * Database — Supports PostgreSQL (cloud) and JSON file (local).
 * Auto-detects: if DATABASE_URL env var exists, uses PostgreSQL.
 * Otherwise falls back to data.json for local development.
 */
import pg from 'pg';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'data.json');
const IS_CLOUD = !!process.env.DATABASE_URL;

let pool = null;

/* ── PostgreSQL Setup ── */

async function initPostgres() {
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Create table if it doesn't exist — stores entire app state as JSONB
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_data (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL DEFAULT '{}',
      CHECK (id = 1)
    );
  `);

  // Insert default row if empty
  const result = await pool.query('SELECT COUNT(*) FROM app_data');
  if (parseInt(result.rows[0].count) === 0) {
    const defaults = getDefaults();
    await pool.query('INSERT INTO app_data (id, data) VALUES (1, $1)', [JSON.stringify(defaults)]);
  }
}

function getDefaults() {
  return {
    tasks: [], contacts: [], meetings: [],
    ganttItems: [], categories: [], issues: [],
    lastModified: Date.now(),
  };
}

/* ── Public API ── */

/** Initialize the database. Must be called on startup. */
export async function initDB() {
  if (IS_CLOUD) {
    await initPostgres();
    console.log('  📦 Connected to PostgreSQL');
  } else {
    console.log('  📦 Using local data.json');
  }
}

/** Read the full database. */
export async function readDB() {
  if (IS_CLOUD) {
    const result = await pool.query('SELECT data FROM app_data WHERE id = 1');
    return result.rows[0]?.data || getDefaults();
  }
  // Local: read JSON file
  if (!existsSync(DATA_FILE)) {
    const defaults = getDefaults();
    writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2), 'utf-8');
    return defaults;
  }
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return getDefaults();
  }
}

/** Write the full database, updating lastModified. */
export async function writeDB(data) {
  data.lastModified = Date.now();
  if (IS_CLOUD) {
    await pool.query('UPDATE app_data SET data = $1 WHERE id = 1', [JSON.stringify(data)]);
  } else {
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
  return data;
}

/** Get a specific collection. */
export async function getCollection(name) {
  const db = await readDB();
  return db[name] || [];
}

/** Add an item to a collection. */
export async function addItem(collection, item) {
  const db = await readDB();
  if (!db[collection]) db[collection] = [];
  item.id = generateId();
  item.createdAt = new Date().toISOString();
  db[collection].push(item);
  await writeDB(db);
  return item;
}

/** Update an item in a collection by id. */
export async function updateItem(collection, id, updates) {
  const db = await readDB();
  const items = db[collection] || [];
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) return null;
  Object.assign(items[idx], updates);
  await writeDB(db);
  return items[idx];
}

/** Delete an item from a collection by id. */
export async function deleteItem(collection, id) {
  const db = await readDB();
  const before = (db[collection] || []).length;
  db[collection] = (db[collection] || []).filter(i => i.id !== id);
  await writeDB(db);
  return db[collection].length < before;
}

/** Get the lastModified timestamp. */
export async function getLastModified() {
  const db = await readDB();
  return db.lastModified || 0;
}

/** Generate a unique ID. */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
