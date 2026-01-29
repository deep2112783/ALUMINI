import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  password: "sushu789",
  host: "db.ulkytfwbbkcuskzgafsx.supabase.co",
  port: 5432,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  try {
    console.log("Running migration...");
    await pool.query(`ALTER TABLE faculty ADD COLUMN IF NOT EXISTS designation TEXT, ADD COLUMN IF NOT EXISTS phone_extension TEXT, ADD COLUMN IF NOT EXISTS profile_image TEXT, ADD COLUMN IF NOT EXISTS cover_image TEXT;`);
    console.log("✓ Faculty table updated!");
    await pool.query(`ALTER TABLE alumni ADD COLUMN IF NOT EXISTS profile_image TEXT, ADD COLUMN IF NOT EXISTS cover_image TEXT;`);
    console.log("✓ Alumni table updated!");
    console.log("✅ Done!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

runMigration();
