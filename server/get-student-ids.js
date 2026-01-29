import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function getStudentIds() {
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT u.id, u.email, s.name, s.department FROM users u 
       LEFT JOIN students s ON u.id = s.user_id 
       WHERE u.role = 'student' ORDER BY u.id LIMIT 10`
    );

    console.log('\n📋 Student IDs from Database:');
    console.log(result.rows);
    
    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getStudentIds();
