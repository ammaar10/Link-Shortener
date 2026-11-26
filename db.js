const { Pool } = require('pg');

// Reads DATABASE_URL from the environment, e.g. postgres://app:pass@db:5432/expenses
// The pool does not connect until the first query, so importing this is safe in tests.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS links (
      id SERIAL PRIMARY KEY,
      code VARCHAR(12) UNIQUE NOT NULL,
      url TEXT NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

module.exports = { pool, init };
