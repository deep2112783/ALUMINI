import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Hash "password123"
const hash = await bcrypt.hash('password123', 10);

// Update all three users
await pool.query(
  "UPDATE users SET password = $1, is_first_login = false WHERE email IN ($2, $3, $4)",
  [hash, 'student1@rguktrkv.ac.in', 'alumni1@rguktrkv.ac.in', 'faculty1@rguktrkv.ac.in']
);

console.log('✓ Passwords set for all users');

// Verify
const res = await pool.query(
  "SELECT email, role, password IS NOT NULL as has_password, is_first_login FROM users"
);
console.log('Users:', res.rows);

await pool.end();
