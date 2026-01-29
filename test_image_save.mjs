import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: "postgres",
  password: "sushu789",
  host: "db.ulkytfwbbkcuskzgafsx.supabase.co",
  port: 5432,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

async function testImageSave() {
  try {
    // Get a faculty user
    const { rows: users } = await pool.query(
      "SELECT id, email FROM users WHERE role = 'faculty' LIMIT 1"
    );
    
    if (users.length === 0) {
      console.log("No faculty user found");
      return;
    }
    
    const userId = users[0].id;
    console.log("Testing with user:", users[0].email);
    
    // Check current data
    const { rows: before } = await pool.query(
      "SELECT profile_image, cover_image FROM faculty WHERE user_id = $1",
      [userId]
    );
    console.log("Before:", {
      profile_image: before[0]?.profile_image ? "EXISTS" : "NULL",
      cover_image: before[0]?.cover_image ? "EXISTS" : "NULL"
    });
    
    // Try to update with test data
    const testImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg";
    await pool.query(
      "UPDATE faculty SET profile_image = $1, cover_image = $2 WHERE user_id = $3",
      [testImage, testImage, userId]
    );
    console.log("✓ Update executed");
    
    // Check after update
    const { rows: after } = await pool.query(
      "SELECT profile_image, cover_image FROM faculty WHERE user_id = $1",
      [userId]
    );
    console.log("After:", {
      profile_image: after[0]?.profile_image ? after[0].profile_image.substring(0, 30) + "..." : "NULL",
      cover_image: after[0]?.cover_image ? after[0].cover_image.substring(0, 30) + "..." : "NULL"
    });
    
    if (after[0]?.profile_image === testImage) {
      console.log("✅ Images are being saved correctly!");
    } else {
      console.log("❌ Images are NOT being saved!");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

testImageSave();
