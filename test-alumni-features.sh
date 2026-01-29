#!/bin/bash

echo "========================================="
echo "Testing Alumni Features"
echo "========================================="

# Login and get token
echo -e "\n1. Logging in as alumni..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun.mehta@rguktrkv.ac.in","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi
echo "✓ Login successful"

# Test post insight WITH title
echo -e "\n2. Testing Post Insight WITH title..."
INSIGHT_RESPONSE=$(curl -s -X POST http://localhost:4000/api/alumni/insights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Insight With Title","content":"This is a test insight with a custom title","category":"career"}')

echo "Response: $INSIGHT_RESPONSE"
if echo "$INSIGHT_RESPONSE" | grep -q '"id"'; then
  echo "✓ Post insight WITH title works"
else
  echo "❌ Post insight WITH title failed"
fi

# Test post insight WITHOUT title (auto-generate)
echo -e "\n3. Testing Post Insight WITHOUT title (auto-generate)..."
INSIGHT_NO_TITLE=$(curl -s -X POST http://localhost:4000/api/alumni/insights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"content":"This insight has no title and should auto-generate one from this content","category":"technical"}')

echo "Response: $INSIGHT_NO_TITLE"
if echo "$INSIGHT_NO_TITLE" | grep -q '"id"'; then
  echo "✓ Post insight WITHOUT title works (auto-generated)"
else
  echo "❌ Post insight WITHOUT title failed"
fi

# Test recent questions
echo -e "\n4. Testing Recent Questions endpoint..."
COMMUNITIES=$(curl -s -X GET http://localhost:4000/api/alumni/communities \
  -H "Authorization: Bearer $TOKEN")

echo "Communities response length: ${#COMMUNITIES}"
if echo "$COMMUNITIES" | grep -q '\['; then
  COMM_COUNT=$(echo "$COMMUNITIES" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
  echo "✓ Communities endpoint works - found $COMM_COUNT communities"
  
  # Get first community ID
  FIRST_COMM_ID=$(echo "$COMMUNITIES" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if len(data) > 0 else '')" 2>/dev/null)
  
  if [ ! -z "$FIRST_COMM_ID" ]; then
    echo -e "\n5. Testing Community Details (ID: $FIRST_COMM_ID)..."
    COMM_DETAILS=$(curl -s -X GET "http://localhost:4000/api/alumni/communities/$FIRST_COMM_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    if echo "$COMM_DETAILS" | grep -q 'questions'; then
      Q_COUNT=$(echo "$COMM_DETAILS" | python3 -c "import sys,json; data=json.load(sys.stdin); print(len(data.get('questions', [])))" 2>/dev/null || echo "0")
      echo "✓ Community details endpoint works - found $Q_COUNT questions"
    else
      echo "❌ Community details endpoint returned unexpected format"
      echo "Response snippet: ${COMM_DETAILS:0:200}"
    fi
  fi
else
  echo "❌ Communities endpoint failed"
  echo "Response snippet: ${COMMUNITIES:0:200}"
fi

echo -e "\n========================================="
echo "Test Complete"
echo "========================================="
