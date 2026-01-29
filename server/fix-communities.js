import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function runFixScript() {
  const client = await pool.connect();
  
  try {
    console.log("🔧 Starting community fix...");
    
    const sql = fs.readFileSync(
      path.join(__dirname, "sql", "fix-duplicate-communities.sql"),
      "utf8"
    );
    
    console.log("🗑️  Removing duplicate communities...");
    await client.query(sql);
    
    console.log("✅ Successfully fixed communities!");
    console.log("📊 Verifying...");
    
    const result = await client.query("SELECT * FROM communities");
    console.log(`✨ Total communities: ${result.rows.length}`);
    result.rows.forEach(comm => {
      console.log(`   - ${comm.name} (${comm.domain})`);
    });
    
  } catch (error) {
    console.error("❌ Error fixing communities:", error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runFixScript();
