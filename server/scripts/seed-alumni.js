import { pool } from "../src/config/db.js";

async function seedAlumniData() {
  try {
    console.log("🌱 Seeding alumni profile data...");
    
    // Update alumni with sample data - get IDs first then update
    const getAlumniQuery = `
      SELECT user_id FROM alumni 
      WHERE graduation_year IS NULL
      LIMIT 10;
    `;
    
    const alumniRows = await pool.query(getAlumniQuery);
    console.log(`Found ${alumniRows.rows.length} alumni without data`);
    
    if (alumniRows.rows.length > 0) {
      const updateQuery = `
        UPDATE alumni 
        SET 
          graduation_year = CASE 
            WHEN user_id % 5 = 0 THEN 2010
            WHEN user_id % 5 = 1 THEN 2011
            WHEN user_id % 5 = 2 THEN 2012
            WHEN user_id % 5 = 3 THEN 2013
            ELSE 2014
          END,
          bio = 'Passionate technology professional building innovative solutions',
          location = CASE 
            WHEN user_id % 3 = 0 THEN 'Bangalore, India'
            WHEN user_id % 3 = 1 THEN 'Hyderabad, India'
            ELSE 'Chennai, India'
          END,
          experience = 'Senior Software Engineer with 8+ years of industry experience',
          previous_companies = 'Google, Amazon, TCS',
          willing_to_help = 'Career guidance, Interview prep, Technical mentorship'
        WHERE graduation_year IS NULL;
      `;
      
      const result = await pool.query(updateQuery);
      console.log(`✅ Updated ${result.rowCount} alumni records with sample data`);
    }
    
    // Show sample of updated data
    const checkQuery = `
      SELECT user_id, company, role, graduation_year, bio, location 
      FROM alumni 
      WHERE graduation_year IS NOT NULL 
      LIMIT 3;
    `;
    
    const check = await pool.query(checkQuery);
    console.log("📋 Sample data:", check.rows);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

seedAlumniData();
