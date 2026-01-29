import { pool } from "./src/config/db.js";

async function testProfileData() {
  try {
    // Get priya's user ID
    const userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, ["priya.sharma@rguktrkv.ac.in"]);
    
    if (userRes.rows.length === 0) {
      console.log("User not found");
      return;
    }
    
    const userId = userRes.rows[0].id;
    console.log("User ID:", userId);
    
    // Get all student data for this user
    const studentRes = await pool.query(
      `SELECT name, department, year, cgpa, bio, skills, linkedin, github, portfolio, profile_image, cover_image
       FROM students 
       WHERE user_id = $1`,
      [userId]
    );
    
    if (studentRes.rows.length === 0) {
      console.log("Student record not found");
      return;
    }
    
    const student = studentRes.rows[0];
    console.log("\n=== STUDENT PROFILE DATA ===");
    console.log("Name:", student.name);
    console.log("Department:", student.department);
    console.log("Year:", student.year);
    console.log("CGPA:", student.cgpa);
    console.log("Bio:", student.bio);
    console.log("Skills:", student.skills);
    console.log("LinkedIn:", student.linkedin);
    console.log("GitHub:", student.github);
    console.log("Portfolio:", student.portfolio);
    console.log("Profile Image:", student.profile_image ? "[EXISTS]" : "[NULL]");
    console.log("Cover Image:", student.cover_image ? "[EXISTS]" : "[NULL]");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

testProfileData();
