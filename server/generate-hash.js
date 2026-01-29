import bcrypt from 'bcryptjs';

async function generateHashes() {
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log(`\nUse this in seed.sql for all 3 users`);
}

generateHashes();
