#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsImVtYWlsIjoicHJpeWEuc2hhcm1hQHJndWt0cmtzLmFjLmluIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzcxODU1NjV9.xQVJy1S-6tNM3xLwUqEYYwFVQ3zcGSu3nqRjhPJxDJo"

echo "Testing PUT /api/student/profile..."
curl -s -X PUT http://localhost:4000/api/student/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Update","department":"CSE"}' | python3 -m json.tool

echo -e "\n\nTesting GET /api/student/profile..."
curl -s -X GET http://localhost:4000/api/student/profile \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
