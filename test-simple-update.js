import fetch from 'node-fetch';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsImVtYWlsIjoicHJpeWEuc2hhcm1hQHJndWt0cmtzLmFjLmluIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzcxODU1NjV9.xQVJy1S-6tNM3xLwUqEYYwFVQ3zcGSu3nqRjhPJxDJo';

async function testUpdate() {
  try {
    const response = await fetch('http://localhost:4000/api/student/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Priya Updated',
        department: 'CSE',
        year: 'E4',
        cgpa: 3.8,
        bio: 'Test bio',
        skills: ['JavaScript', 'React'],
        linkedin: 'linkedin.com/in/priya',
        github: 'github.com/priya',
        portfolio: 'priya.dev'
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUpdate();
