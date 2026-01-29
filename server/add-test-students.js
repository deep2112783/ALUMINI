import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const testStudents = [
  {
    email: 'rajiv.kumar@rguktrkv.ac.in',
    name: 'Rajiv Kumar',
    department: 'Mechanical Engineering',
    year: 'E4',
    skills: 'CAD, SOLIDWORKS, MATLAB, Thermodynamics',
    password: 'password123'
  },
  {
    email: 'neha.singh@rguktrkv.ac.in',
    name: 'Neha Singh',
    department: 'Civil Engineering',
    year: 'E3',
    skills: 'AutoCAD, Revit, Structural Analysis, STAAD Pro',
    password: 'password123'
  },
  {
    email: 'rohan.patel@rguktrkv.ac.in',
    name: 'Rohan Patel',
    department: 'Electrical Engineering',
    year: 'E2',
    skills: 'Circuit Design, MATLAB, PLC Programming, Power Systems',
    password: 'password123'
  },
  {
    email: 'anjali.verma@rguktrkv.ac.in',
    name: 'Anjali Verma',
    department: 'Computer Science',
    year: 'E4',
    skills: 'Python, Machine Learning, TensorFlow, Data Analysis',
    password: 'password123'
  },
  {
    email: 'vikram.sharma@rguktrkv.ac.in',
    name: 'Vikram Sharma',
    department: 'Electronics & Communication',
    year: 'E3',
    skills: 'Signal Processing, VLSI Design, Embedded Systems, C++',
    password: 'password123'
  },
  {
    email: 'pooja.reddy@rguktrkv.ac.in',
    name: 'Pooja Reddy',
    department: 'Computer Science',
    year: 'E2',
    skills: 'Web Development, React, Node.js, MongoDB',
    password: 'password123'
  }
];

async function addStudents() {
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    
    for (const student of testStudents) {
      try {
        // Hash password
        const hashedPassword = await bcrypt.hash(student.password, 10);

        // Insert user
        const userResult = await client.query(
          'INSERT INTO users (email, password, role, is_first_login, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [student.email, hashedPassword, 'student', false, true]
        );

        const userId = userResult.rows[0].id;

        // Insert student profile
        await client.query(
          'INSERT INTO students (user_id, name, department, year, skills) VALUES ($1, $2, $3, $4, $5)',
          [userId, student.name, student.department, student.year, student.skills]
        );

        console.log(`✅ Added student: ${student.name} (${student.email})`);
      } catch (err) {
        if (err.code === '23505') {
          console.log(`⚠️  Student already exists: ${student.email}`);
        } else {
          console.error(`❌ Error adding ${student.email}:`, err.message);
        }
      }
    }

    client.release();
    console.log('\n✨ Test students added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

addStudents();
