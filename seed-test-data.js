import { pool } from './server/src/config/db.js';

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');
    
    // First check if priya already exists
    const priyaCheck = await pool.query(
      `SELECT id FROM users WHERE email = $1`,
      ['priya.sharma@rguktrkv.ac.in']
    );
    
    let priyaId = priyaCheck.rows[0]?.id;
    
    if (!priyaId) {
      console.log('Creating priya user...');
      const userResult = await pool.query(
        `INSERT INTO users (email, password, role, is_first_login, is_active) 
         VALUES ($1, $2, $3, false, true) 
         RETURNING id`,
        ['priya.sharma@rguktrkv.ac.in', 'hashed_password', 'student']
      );
      priyaId = userResult.rows[0].id;
      console.log('Created user ID:', priyaId);
    }
    
    // Check if student profile exists
    const profileCheck = await pool.query(
      `SELECT user_id FROM students WHERE user_id = $1`,
      [priyaId]
    );
    
    if (profileCheck.rows.length === 0) {
      console.log('Creating student profile...');
      await pool.query(
        `INSERT INTO students (user_id, name, department, year, cgpa, skills, bio, linkedin, github, portfolio)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          priyaId,
          'Priya Sharma',
          'Electronics & Communication',
          'E4',
          3.8,
          'VLSI,Embedded Systems,C++,Arduino',
          'Passionate about embedded systems and VLSI design',
          'linkedin.com/in/priya',
          'github.com/priya',
          'priya.dev'
        ]
      );
      console.log('✅ Student profile created for user ID:', priyaId);
    } else {
      console.log('Profile already exists, updating...');
      await pool.query(
        `UPDATE students SET 
         name = $2, 
         department = $3, 
         year = $4, 
         cgpa = $5, 
         skills = $6, 
         bio = $7,
         linkedin = $8,
         github = $9,
         portfolio = $10
         WHERE user_id = $1`,
        [
          priyaId,
          'Priya Sharma',
          'Electronics & Communication',
          'E4',
          3.8,
          'VLSI,Embedded Systems,C++,Arduino',
          'Passionate about embedded systems and VLSI design',
          'linkedin.com/in/priya',
          'github.com/priya',
          'priya.dev'
        ]
      );
      console.log('✅ Student profile updated for user ID:', priyaId);
    }
    
    // Verify data was inserted
    const verify = await pool.query(
      `SELECT * FROM students WHERE user_id = $1`,
      [priyaId]
    );
    
    console.log('\n📋 Current profile data:');
    console.log(verify.rows[0]);
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
}

seedTestData();
