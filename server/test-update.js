import { pool } from "./src/config/db.js";

async function testUpdate() {
  try {
    // Get a student user_id (from priya.sharma)
    const userRes = await pool.query(`SELECT id FROM users WHERE email = $1`, ["priya.sharma@rguktrkv.ac.in"]);
    
    if (userRes.rows.length === 0) {
      console.log("User not found");
      return;
    }
    
    const userId = userRes.rows[0].id;
    console.log("User ID:", userId);
    
    // Check if student record exists
    const studentRes = await pool.query(`SELECT * FROM students WHERE user_id = $1`, [userId]);
    console.log("Student record before update:", studentRes.rows[0]);
    
    // Try to update
    const updateRes = await pool.query(
      `UPDATE students SET name = $1, bio = $2 WHERE user_id = $3`,
      ["Test Name", "Test Bio", userId]
    );
    console.log("Update result:", updateRes.rowCount, "rows affected");
    
    // Check after update
    const afterRes = await pool.query(`SELECT * FROM students WHERE user_id = $1`, [userId]);
    console.log("Student record after update:", afterRes.rows[0]);
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    process.exit(0);
  }
}

testUpdate();
