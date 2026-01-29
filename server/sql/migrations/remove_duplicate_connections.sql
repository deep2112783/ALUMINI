-- Migration: Remove duplicate bidirectional connections
-- This script removes duplicate connections where both A→B and B→A exist
-- We keep only one direction (lower user_id → higher user_id)

BEGIN;

-- Step 1: Identify and log duplicates (optional, for debugging)
-- SELECT 
--   c1.id as id1, c1.user_id as user1, c1.connected_user_id as user2, c1.status,
--   c2.id as id2, c2.user_id as user2_reverse, c2.connected_user_id as user1_reverse, c2.status
-- FROM connections c1
-- JOIN connections c2 ON c1.user_id = c2.connected_user_id AND c1.connected_user_id = c2.user_id
-- WHERE c1.id < c2.id;

-- Step 2: Delete the reverse connections (keep only one direction per connection pair)
-- Keep the connection where user_id < connected_user_id, delete the reverse
DELETE FROM connections
WHERE id IN (
  SELECT c2.id
  FROM connections c1
  JOIN connections c2 ON c1.user_id = c2.connected_user_id AND c1.connected_user_id = c2.user_id
  WHERE c1.user_id < c2.user_id
);

-- Step 3: Verify no duplicates remain
-- Should return 0 rows
SELECT 
  c1.user_id, c1.connected_user_id, COUNT(*) as pair_count
FROM connections c1
JOIN connections c2 ON 
  (c1.user_id = c2.connected_user_id AND c1.connected_user_id = c2.user_id)
  OR (c1.user_id = c2.user_id AND c1.connected_user_id = c2.connected_user_id)
GROUP BY c1.user_id, c1.connected_user_id
HAVING COUNT(*) > 1;

COMMIT;
