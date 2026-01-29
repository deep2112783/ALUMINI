import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";
import { pool } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log("🔍 Env loaded from:", path.resolve(__dirname, "../.env"));
console.log("📝 DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Not set");
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET ? "✓ Set" : "✗ Not set");

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    // Verify DB connection
    await pool.query("SELECT 1");
    app.listen(PORT, () => {
      console.log(`[server] running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
