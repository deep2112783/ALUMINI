import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: 'sushu789',
  host: 'db.ulkytfwbbkcuskzgafsx.supabase.co',
  port: 5432,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixConnections() {
  try {
    await pool.query("UPDATE connections SET status = 'connected' WHERE status = 'accepted'");
    console.log('Updated connection statuses to connected');
    
    const result = await pool.query("SELECT COUNT(*) FROM connections WHERE status = 'connected'");
    console.log('Total connected connections:', result.rows[0].count);
    
    const connections = await pool.query(`
      SELECT c.id, u1.email as from_user, u2.email as to_user, c.status 
      FROM connections c
      JOIN users u1 ON c.user_id = u1.id
      JOIN users u2 ON c.connected_user_id = u2.id
      WHERE u1.email = 'rajesh.kumar@rguktrkv.ac.in' OR u2.email = 'rajesh.kumar@rguktrkv.ac.in'
    `);
    console.log('\nConnections for rajesh.kumar:');
    connections.rows.forEach(row => {
      console.log(`  ${row.from_user} -> ${row.to_user} (${row.status})`);
    });
    
    pool.end();
  } catch (err) {
    console.error('Error:', err.message);
    pool.end();
  }
}

fixConnections();
