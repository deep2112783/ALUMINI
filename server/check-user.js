import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const res = await pool.query(
  "SELECT id, email, role, is_first_login, is_active, password IS NOT NULL as has_password FROM users WHERE email=$1",
  ['student1@rguktrkv.ac.in']
);

console.log('User data:', res.rows[0]);
await pool.end();
