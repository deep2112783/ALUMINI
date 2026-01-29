import { pool } from './src/config/db.js';

async function checkCommunities() {
  try {
    const result = await pool.query('SELECT id, name, archived FROM communities ORDER BY id');
    console.log('All communities:');
    result.rows.forEach(c => {
      console.log(`ID: ${c.id}, Name: ${c.name}, Archived: ${c.archived}`);
    });
    console.log(`\nTotal: ${result.rows.length} communities`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCommunities();
