import { pool } from './src/config/db.js';

async function testCommunitiesQuery() {
  try {
    // Simulate a user ID (using the first student from seed data)
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = 'rajesh.kumar@rguktrkv.ac.in'"
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ Test user not found. Make sure seed data is loaded.');
      process.exit(1);
    }
    
    const userId = userResult.rows[0].id;
    console.log(`✓ Test user ID: ${userId}`);
    
    // Run the exact query from listCommunities
    const { rows } = await pool.query(
      `SELECT c.id, c.name, c.domain, c.description,
              CASE WHEN cm.user_id IS NOT NULL THEN true ELSE false END as "isJoined",
              COUNT(DISTINCT cm_all.user_id)::int as "memberCount",
              COUNT(DISTINCT fq.id)::int as "postCount"
       FROM communities c
       LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = $1
       LEFT JOIN community_members cm_all ON c.id = cm_all.community_id
       LEFT JOIN forum_questions fq ON c.id = fq.community_id
       WHERE c.archived = false
       GROUP BY c.id, c.name, c.domain, c.description, cm.user_id
       ORDER BY c.name ASC`,
      [userId]
    );
    
    console.log(`\n✓ Query executed successfully`);
    console.log(`✓ Found ${rows.length} communities\n`);
    
    if (rows.length === 0) {
      console.log('❌ NO COMMUNITIES RETURNED - This is the problem!');
    } else {
      console.log('Communities returned by API:');
      rows.forEach(c => {
        console.log(`  - ${c.name} (${c.domain})`);
        console.log(`    ID: ${c.id}, Members: ${c.memberCount}, Posts: ${c.postCount}, Joined: ${c.isJoined}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCommunitiesQuery();
