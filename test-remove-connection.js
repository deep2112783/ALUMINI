#!/usr/bin/env node
import http from 'http';

const API = 'http://localhost:4000/api';

async function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API + path, 'http://localhost:3000');
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function test() {
  console.log('=== Testing Remove Connection ===\n');

  // Step 1: Login as a student
  console.log('1. Logging in as student...');
  const loginRes = await makeRequest('POST', '/auth/login', {
    email: 'rajesh.kumar@rguktrkv.ac.in',
    password: 'password123'
  });
  console.log(`   Status: ${loginRes.status}`);
  if (loginRes.status !== 200) {
    console.error('   Error:', loginRes.data);
    return;
  }
  const token = loginRes.data.token;
  console.log(`   Token: ${token.substring(0, 20)}...`);

  // Step 2: Get connections
  console.log('\n2. Fetching connections...');
  const connRes = await makeRequest('GET', '/student/connections', null, token);
  console.log(`   Status: ${connRes.status}`);
  if (connRes.status !== 200) {
    console.error('   Error:', connRes.data);
    return;
  }
  console.log(`   Found ${connRes.data.length} connections`);
  if (connRes.data.length > 0) {
    console.log('   First connection:', connRes.data[0]);
  }

  if (connRes.data.length === 0) {
    console.log('\n   No connections to test removal with');
    return;
  }

  // Step 3: Try to remove a connection
  const targetUserId = connRes.data[0].user_id;
  console.log(`\n3. Attempting to remove connection with user ${targetUserId}...`);
  const removeRes = await makeRequest('DELETE', `/student/connections/${targetUserId}`, null, token);
  console.log(`   Status: ${removeRes.status}`);
  console.log(`   Response:`, removeRes.data);

  if (removeRes.status === 200) {
    console.log('\n✓ Connection removed successfully!');
  } else {
    console.log('\n✗ Failed to remove connection');
  }
}

test().catch(console.error);
