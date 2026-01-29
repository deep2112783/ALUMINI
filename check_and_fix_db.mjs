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

async function checkAndFix() {
  try {
    console.log("Checking faculty table structure...");
    
    const { rows } = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'faculty';
    `);
    
    console.log("Faculty table columns:");
    rows.forEach(row => console.log(`  - ${row.column_name}: ${row.data_type}`));
    
    const hasProfileImage = rows.some(r => r.column_name === 'profile_image');
    const hasCoverImage = rows.some(r => r.column_name === 'cover_image');
    
    if (!hasProfileImage || !hasCoverImage) {
      console.log("\n⚠️  Missing image columns! Adding them now...");
      
      if (!hasProfileImage) {
        await pool.query(`ALTER TABLE faculty ADD COLUMN profile_image TEXT;`);
        console.log("✓ Added profile_image column");
      }
      
      if (!hasCoverImage) {
        await pool.query(`ALTER TABLE faculty ADD COLUMN cover_image TEXT;`);
        console.log("✓ Added cover_image column");
      }
    } else {
      console.log("\n✓ All image columns exist!");
    }
    
    // Test update
    console.log("\nTesting image update...");
    await pool.query(`
      UPDATE faculty 
      SET profile_image = 'test', cover_image = 'test' 
      WHERE user_id = (SELECT id FROM users WHERE role = 'faculty' LIMIT 1);
    `);
    console.log("✓ Test update successful!");
    
    console.log("\n✅ Database is ready for image storage!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

checkAndFix();
