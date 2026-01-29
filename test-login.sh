#!/bin/bash

echo "Testing login..."
RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.sharma@rguktrkv.ac.in","password":"password123"}')

echo "$RESPONSE" | python3 -m json.tool

TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo -e "\n\nToken: $TOKEN"

echo -e "\n\nTesting PUT /api/student/profile with new token..."
curl -s -X PUT http://localhost:4000/api/student/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Priya Updated","department":"CSE"}' | python3 -m json.tool
