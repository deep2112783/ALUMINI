import { pool } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeDuplicateConnections() {
  try {
    console.log('🔄 Starting duplicate connections removal...\n');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../sql/migrations/remove_duplicate_connections.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    console.log('📝 Executing migration SQL...');
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('   All duplicate bidirectional connections have been removed.\n');

    // Verify the results
    const result = await pool.query(`
      SELECT COUNT(*) as total_connections
      FROM connections
      WHERE status = 'connected'
    `);
    
    console.log(`📊 Total connected connections: ${result.rows[0].total_connections}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing duplicate connections:', error.message);
    console.error(error);
    process.exit(1);
  }
}

removeDuplicateConnections();
