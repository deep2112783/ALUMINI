import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function initializeDatabase() {
  try {
    console.log('🔌 Connecting to Supabase...');
    const client = await pool.connect();
    console.log('✅ Connected!');

    // Read schema SQL
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
    console.log('📋 Running schema...');
    await client.query(schemaSQL);
    console.log('✅ Schema created!');

    // Read seed SQL
    const seedSQL = fs.readFileSync(path.join(__dirname, 'sql', 'seed.sql'), 'utf8');
    console.log('🌱 Running seed data...');
    await client.query(seedSQL);
    console.log('✅ Seed data inserted!');

    client.release();
    console.log('\n✨ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
