import { pool } from "../src/config/db.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    // Run first migration
    console.log("🔄 Running migration: add_student_profile_fields...");
    const studentMigrationSQL = readFileSync(
      join(__dirname, "../sql/migrations/add_student_profile_fields.sql"),
      "utf-8"
    );
    await pool.query(studentMigrationSQL);
    console.log("✅ Student migration completed!");

    // Run second migration
    console.log("🔄 Running migration: add_alumni_profile_fields...");
    const alumniMigrationSQL = readFileSync(
      join(__dirname, "../sql/migrations/add_alumni_profile_fields.sql"),
      "utf-8"
    );
    await pool.query(alumniMigrationSQL);
    console.log("✅ Alumni migration completed!");

    // Run third migration
    console.log("🔄 Running migration: fix_connections_table...");
    const connectionsMigrationSQL = readFileSync(
      join(__dirname, "../sql/migrations/fix_connections_table.sql"),
      "utf-8"
    );
    await pool.query(connectionsMigrationSQL);
    console.log("✅ Connections table migration completed!");
    
    console.log("✅ All migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
