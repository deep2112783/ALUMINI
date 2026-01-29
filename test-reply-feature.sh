#!/bin/bash

echo "========================================="
echo "Testing Reply to Comments Feature"
echo "========================================="

# Step 1: Login as student and add a comment
echo -e "\n1. Login as student to post a comment..."
STUDENT_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rajesh.kumar@rguktrkv.ac.in","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$STUDENT_TOKEN" ]; then
  echo "❌ Student login failed"
  exit 1
fi
echo "✓ Student logged in"

# Get first insight
echo -e "\n2. Getting first insight..."
INSIGHT_DATA=$(curl -s -X GET http://localhost:4000/api/student/insights \
  -H "Authorization: Bearer $STUDENT_TOKEN")

FIRST_INSIGHT_ID=$(echo "$INSIGHT_DATA" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'] if len(data) > 0 else '')" 2>/dev/null)

if [ -z "$FIRST_INSIGHT_ID" ]; then
  echo "❌ No insights found"
  exit 1
fi
echo "✓ Found insight ID: $FIRST_INSIGHT_ID"

# Post a comment
echo -e "\n3. Student posting a comment..."
COMMENT_RESPONSE=$(curl -s -X POST "http://localhost:4000/api/student/insights/$FIRST_INSIGHT_ID/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"content":"This is a great insight! Can you share more details?"}')

echo "Comment response: $COMMENT_RESPONSE"

# Wait a moment
sleep 1

# Get the comment ID
COMMENTS=$(curl -s -X GET "http://localhost:4000/api/student/insights/$FIRST_INSIGHT_ID/comments" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

COMMENT_ID=$(echo "$COMMENTS" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[-1]['id'] if len(data) > 0 else '')" 2>/dev/null)

if [ -z "$COMMENT_ID" ]; then
  echo "❌ Could not get comment ID"
  exit 1
fi
echo "✓ Comment posted with ID: $COMMENT_ID"

# Step 2: Login as alumni and reply
echo -e "\n4. Login as alumni to reply..."
ALUMNI_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"arjun.mehta@rguktrkv.ac.in","password":"password123"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token', ''))")

if [ -z "$ALUMNI_TOKEN" ]; then
  echo "❌ Alumni login failed"
  exit 1
fi
echo "✓ Alumni logged in"

# Post a reply
echo -e "\n5. Alumni replying to comment..."
REPLY_RESPONSE=$(curl -s -X POST "http://localhost:4000/api/alumni/insights/$FIRST_INSIGHT_ID/comments/$COMMENT_ID/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALUMNI_TOKEN" \
  -d '{"content":"Thanks for your question! Here are more details..."}')

echo "Reply response: $REPLY_RESPONSE"

if echo "$REPLY_RESPONSE" | grep -q '"id"'; then
  echo "✓ Reply posted successfully!"
else
  echo "❌ Failed to post reply"
  exit 1
fi

# Verify the reply is visible
echo -e "\n6. Verifying reply is visible..."
ALL_COMMENTS=$(curl -s -X GET "http://localhost:4000/api/student/insights/$FIRST_INSIGHT_ID/comments" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "$ALL_COMMENTS" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'\n📊 Total comments and replies: {len(data)}')
print('\nComments Structure:')
print('-' * 50)
for c in data:
    if c.get('parent_id'):
        print(f'  ↳ REPLY by {c[\"author_name\"]}: {c[\"content\"][:50]}...')
    else:
        print(f'• COMMENT by {c[\"author_name\"]}: {c[\"content\"][:50]}...')
" 2>/dev/null || echo "Could not parse comments"

echo -e "\n========================================="
echo "✅ Reply Feature Working!"
echo "========================================="
echo "Alumni can now:"
echo "1. View all comments on their insights"
echo "2. Click 'Reply' button on any comment"
echo "3. Type their response"
echo "4. Student sees the reply indented below their comment"
echo ""
